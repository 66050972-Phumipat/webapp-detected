"""PDF statement ingestion, including password-protected KBank statements."""
import re

import pandas as pd

from fraud_features import normalize_columns

DATE_LINE = re.compile(r"^\s*(?P<date>\d{1,2}[-/]\d{1,2}[-/]\d{2,4})(?:\s+(?P<time>\d{1,2}:\d{2}))?\s+(?P<body>.+?)\s*$")
MONEY = re.compile(r"(?<![\w/])(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2}(?!\d)")


def _parse_statement_text(text: str) -> pd.DataFrame:
    rows = []
    previous_balance = None
    for line in text.splitlines():
        match = DATE_LINE.match(line)
        if not match:
            continue
        body = match.group("body")
        money = list(MONEY.finditer(body))
        description = body[:money[-1].start()].strip() if money else body.strip()
        if re.search(r"ยอดยกมา|opening\s+balance|balance\s+brought\s+forward", description, re.I):
            if money:
                previous_balance = float(money[-1].group().replace(",", ""))
            continue
        if len(money) < 2:
            continue
        # KBank prints a single nonzero withdrawal/deposit followed by the new balance.
        amount = float(money[-2].group().replace(",", ""))
        balance = float(money[-1].group().replace(",", ""))
        label = description.lower()
        incoming = bool(re.search(r"รับโอน|รับเงิน|เงินเข้า|โอนเข้า|deposit|cash\s*in|เงินเดือน", label))
        outgoing = bool(re.search(r"ถอน|ชำระ|จ่าย|โอน|เติมเงิน|ซื้อ|debit|payment|cash\s*out", label))
        if incoming:
            transaction_type = "credit"
        elif outgoing:
            transaction_type = "debit"
        elif previous_balance is not None and balance != previous_balance:
            transaction_type = "credit" if balance > previous_balance else "debit"
        else:
            transaction_type = "unknown"
        rows.append({
            "transaction_date": f"{match.group('date')} {match.group('time') or ''}".strip(),
            "description": description,
            "amount": amount,
            "balance": balance,
            "transaction_type": transaction_type,
        })
        previous_balance = balance
    if not rows:
        return pd.DataFrame()
    return normalize_columns(pd.DataFrame(rows))


def extract_pdf(upload, password: str = "") -> pd.DataFrame:
    try:
        import pdfplumber
    except ImportError as exc:
        raise RuntimeError("ติดตั้ง pdfplumber ก่อนจึงจะแยกข้อความจาก PDF ได้") from exc
    try:
        with pdfplumber.open(upload, password=password or "") as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            parsed = _parse_statement_text(text)
            if not parsed.empty:
                return parsed
            # Generic table fallback for other bank layouts.
            rows = []
            for page in pdf.pages:
                for table in page.extract_tables() or []:
                    for row in table:
                        if row and any(value and str(value).strip() for value in row):
                            rows.append([str(value or "").strip() for value in row])
    except Exception as exc:
        message = str(exc).lower()
        if "password" in message or "decrypt" in message:
            raise ValueError("เปิด PDF ไม่ได้ กรุณาตรวจสอบรหัสผ่าน") from exc
        raise
    if rows:
        width = max(map(len, rows))
        rows = [row + [""] * (width - len(row)) for row in rows]
        header_idx = next((i for i, row in enumerate(rows[:8]) if any(re.search(r"date|วันที่|รายการ|description", cell, re.I) for cell in row)), 0)
        headers = [cell or f"column_{j}" for j, cell in enumerate(rows[header_idx])]
        return normalize_columns(pd.DataFrame(rows[header_idx + 1:], columns=headers))
    raise ValueError("ไม่พบรายการใน PDF นี้ โปรดใช้ statement ที่เลือกข้อความได้ หรือแปลง PDF เป็น CSV ก่อน")
