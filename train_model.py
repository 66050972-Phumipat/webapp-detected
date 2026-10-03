"""Train and evaluate the fraud models using fraud.csv (target: isFraud)."""
from pathlib import Path
import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (average_precision_score, f1_score, precision_score,
                             recall_score, roc_auc_score)
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

from fraud_features import make_features, normalize_columns

ROOT = Path(__file__).parent
MODEL_DIR = ROOT / "models"
MODEL_PATH = MODEL_DIR / "fraud_models.joblib"
DATA_PATH = Path(os.getenv("FRAUD_CSV_PATH", ROOT / "fraud.csv"))

def main():
    if not DATA_PATH.exists():
        sys.exit("fraud.csv not found. Put the labeled dataset beside app.py; target column must be isFraud.")
    header = pd.read_csv(DATA_PATH, nrows=0)
    target_col = next((c for c in header.columns if str(c).strip().lower() == "isfraud"), None)
    if target_col is None:
        sys.exit("Target column 'isFraud' not found in fraud.csv.")
    # Stream large source files. Reserve a representative 5% holdout; train on a
    # random 5% of the remaining negatives plus all available positive examples.
    # This keeps memory bounded while preserving the natural prevalence in evaluation.
    usecols = [c for c in header.columns if c.lower() not in {"isflaggedfraud", "nameorig", "namedest"}]
    rng = np.random.default_rng(42)
    train_x, train_y, test_x, test_y = [], [], [], []
    rows_seen = positives_seen = 0
    for chunk in pd.read_csv(DATA_PATH, usecols=usecols, chunksize=250_000):
        labels = pd.to_numeric(chunk[target_col], errors="coerce").fillna(0).astype(int)
        is_test = rng.random(len(chunk)) < .05
        is_positive = labels.eq(1).to_numpy()
        is_train = (~is_test) & (is_positive | (rng.random(len(chunk)) < .05))
        usable = is_test | is_train
        if not usable.any():
            continue
        df = normalize_columns(chunk.loc[usable].drop(columns=[target_col]))
        feats = make_features(df).replace([np.inf, -np.inf], np.nan).fillna(0)
        held = is_test[usable]
        y = labels.loc[usable].to_numpy()
        if held.any():
            test_x.append(feats.loc[held].to_numpy(dtype=np.float32)); test_y.append(y[held])
        fitted = ~held
        if fitted.any():
            train_x.append(feats.loc[fitted].to_numpy(dtype=np.float32)); train_y.append(y[fitted])
        rows_seen += len(chunk); positives_seen += int(is_positive.sum())
    if not train_x or not test_x:
        sys.exit("Not enough data to build train and holdout sets.")
    feature_columns = list(feats.columns)
    X_train = np.concatenate(train_x); y_train = np.concatenate(train_y)
    X_test = np.concatenate(test_x); y_test = np.concatenate(test_y)
    if np.unique(y_train).size < 2 or np.unique(y_test).size < 2:
        sys.exit("Need examples of both isFraud classes in train and holdout data.")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    try:
        from xgboost import XGBClassifier
    except ImportError as exc:
        sys.exit("xgboost is required. Install dependencies from requirements.txt.")
    scale_pos_weight = max(1.0, float((y_train == 0).sum()) / max(1, int((y_train == 1).sum())))
    models = {
        "xgboost": XGBClassifier(n_estimators=350, max_depth=5, learning_rate=.06,
            subsample=.85, colsample_bytree=.85, reg_lambda=2, scale_pos_weight=scale_pos_weight,
            eval_metric="logloss", random_state=42, n_jobs=-1),
        "random_forest": RandomForestClassifier(n_estimators=350, max_depth=16,
            min_samples_leaf=2, class_weight="balanced_subsample", random_state=42, n_jobs=-1),
    }
    metrics = {}
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        probs = model.predict_proba(X_test_scaled)[:, 1]
        pred = (probs >= .5).astype(int)
        metrics[name] = {
            "precision": float(precision_score(y_test, pred, zero_division=0)),
            "recall": float(recall_score(y_test, pred, zero_division=0)),
            "f1": float(f1_score(y_test, pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, probs)),
            "pr_auc": float(average_precision_score(y_test, probs)),
        }
        print(f"{name}: " + " | ".join(f"{k}={v:.4f}" for k,v in metrics[name].items()))
    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump({**models, "scaler": scaler, "feature_columns": feature_columns,
        "metrics": metrics, "rows": int(rows_seen), "fraud_rows": int(positives_seen), "test_size": .05,
        "threshold": .5}, MODEL_PATH)
    print(f"Saved models to {MODEL_PATH}")

if __name__ == "__main__":
    main()
