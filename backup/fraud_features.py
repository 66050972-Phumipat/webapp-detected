"""Canonical transaction normalization and shared feature engineering."""
import re
import numpy as np
import pandas as pd


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Map common statement/training fields into the canonical transaction schema."""
    out = df.copy()
    normalized = {re.sub(r"[^a-z0-9]", "", str(c).lower()): c for c in out.columns}
    aliases = {
        "transaction_date": ["transactiondate", "date", "วันที่", "วันเวลา", "datetime", "timestamp"],
        "description": ["description", "รายละเอียด", "รายการ", "merchant", "name", "คำอธิบาย"],
        "amount": ["amount", "ยอดเงิน", "จำนวนเงิน", "transactionamount", "amt"],
        "withdrawal": ["withdrawal", "withdrawals", "debit", "ถอน", "ถอนเงิน", "ยอดถอน"],
        "deposit": ["deposit", "deposits", "credit", "ฝาก", "ฝากเงิน", "ยอดฝาก"],
        "balance": ["balance", "ยอดคงเหลือ", "คงเหลือ"],
        "transaction_type": ["type", "transactiontype", "ประเภท", "ถอนฝาก", "drcr"],
        "account": ["account", "บัญชี", "accountnumber"],
    }
    ren = {}
    for target, names in aliases.items():
        for n in names:
            key = re.sub(r"[^a-z0-9]", "", n.lower())
            if key in normalized:
                ren[normalized[key]] = target
                break
    out = out.rename(columns=ren)
    if "amount" not in out:
        out["amount"] = np.nan
    for key in ("withdrawal", "deposit"):
        if key in out:
            out[key] = pd.to_numeric(out[key].astype(str).str.replace(",", "", regex=False).str.replace(r"[^0-9.\-]", "", regex=True), errors="coerce").fillna(0)
    if "withdrawal" in out or "deposit" in out:
        debit = out.get("withdrawal", pd.Series(0.0, index=out.index)).fillna(0)
        credit = out.get("deposit", pd.Series(0.0, index=out.index)).fillna(0)
        out["amount"] = out["amount"].fillna(debit.where(debit.ne(0), credit))
        out["transaction_type"] = np.where(debit.ne(0), "debit", np.where(credit.ne(0), "credit", "unknown"))
    out["amount"] = pd.to_numeric(out["amount"].astype(str).str.replace(",", "", regex=False).str.replace(r"[^0-9.\-]", "", regex=True), errors="coerce").fillna(0)
    if "description" not in out:
        out["description"] = "ไม่พบรายละเอียด"
    if "transaction_date" in out:
        out["transaction_date"] = pd.to_datetime(out["transaction_date"], errors="coerce", dayfirst=True, format="mixed")
        buddhist_year = out["transaction_date"].dt.year > 2400
        out.loc[buddhist_year, "transaction_date"] -= pd.DateOffset(years=543)
    else:
        out["transaction_date"] = pd.NaT
    if "balance" in out:
        out["balance"] = pd.to_numeric(out["balance"].astype(str).str.replace(",", "", regex=False), errors="coerce")
    else:
        out["balance"] = np.nan
    out["description"] = out["description"].fillna("").astype(str)
    out["transaction_type"] = out.get("transaction_type", pd.Series("unknown", index=out.index)).fillna("unknown").astype(str)
    out["account"] = out.get("account", pd.Series("", index=out.index)).fillna("").astype(str)
    return out


def make_features(df: pd.DataFrame) -> pd.DataFrame:
    x = pd.DataFrame(index=df.index)
    amount = df["amount"].abs()
    description = df["description"].str.lower()
    kind = df["transaction_type"].str.lower().str.replace(r"[^a-z0-9]", "", regex=True)
    x["amount"] = np.log1p(amount)
    x["is_outflow"] = kind.str.contains(r"withdraw|debit|ถอน|จ่าย|โอนออก|dr|cashout", regex=True).astype(int)
    x["is_transfer"] = (description.str.contains(r"transfer|โอน|พร้อมเพย์|promptpay", regex=True) | kind.str.contains("transfer")).astype(int)
    x["is_cash"] = (description.str.contains(r"atm|cash|เงินสด|เอทีเอ็ม", regex=True) | kind.str.contains(r"cashout|cashin", regex=True)).astype(int)
    x["is_payment"] = (kind.str.contains("payment") | description.str.contains(r"payment|bill", regex=True)).astype(int)
    x["is_cash_out"] = (kind.str.contains("cashout") | description.str.contains(r"cash\s*out|atm|withdraw", regex=True)).astype(int)
    x["is_cash_in"] = (kind.str.contains("cashin") | description.str.contains(r"cash\s*in|deposit", regex=True)).astype(int)
    x["is_debit_card"] = (kind.str.contains("debitcard") | description.str.contains(r"debit\s*card|card\s*payment", regex=True)).astype(int)
    x["is_international"] = description.str.contains(r"international|foreign|ต่างประเทศ|swift", regex=True).astype(int)
    x["hour"] = df["transaction_date"].dt.hour.fillna(12)
    x["is_night"] = df["transaction_date"].dt.hour.isin([0, 1, 2, 3, 4, 5]).astype(int)
    x["day_of_week"] = df["transaction_date"].dt.dayofweek.fillna(3)
    x["amount_vs_median"] = amount / max(float(amount.median()), 1.0)
    x["description_len"] = df["description"].str.len().clip(0, 200)
    canonical = {"transaction_date", "description", "amount", "balance", "transaction_type", "account", "withdrawal", "deposit"}
    for col in df.columns:
        if col in canonical:
            continue
        numeric = pd.to_numeric(df[col], errors="coerce")
        if numeric.notna().mean() > .8:
            x[f"source_{col}"] = numeric.fillna(numeric.median() if numeric.notna().any() else 0)
    return x.astype(float)
