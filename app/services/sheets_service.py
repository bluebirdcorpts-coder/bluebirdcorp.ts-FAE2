"""
Google Sheets export service.

Setup:
1. GCP Console → APIs & Services → Enable "Google Sheets API" & "Google Drive API"
2. Create a Service Account → download JSON key
3. Save to ./credentials/google_service_account.json
4. Share your target spreadsheet with the service account email

If GOOGLE_SHEETS_ID is not set, a new spreadsheet is created automatically.
"""
import asyncio
import json
from datetime import datetime
from typing import Any, Dict, Optional

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]


class SheetsService:
    def __init__(self):
        settings = get_settings()
        self._cred_file = settings.google_service_account_file
        self._default_sheet_id: Optional[str] = settings.google_sheets_id or None
        self._service = None
        self._drive = None

    def _get_service(self):
        if self._service:
            return self._service
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        creds = service_account.Credentials.from_service_account_file(
            self._cred_file, scopes=_SCOPES
        )
        self._service = build("sheets", "v4", credentials=creds, cache_discovery=False)
        self._drive = build("drive", "v3", credentials=creds, cache_discovery=False)
        return self._service

    async def save_research(self, topic: str, result: Dict[str, Any]) -> str:
        """Save research result to Google Sheets. Returns the sheet URL."""
        return await asyncio.to_thread(self._sync_save, topic, result)

    def _sync_save(self, topic: str, result: Dict[str, Any]) -> str:
        svc = self._get_service()
        sheet_id = self._default_sheet_id or self._create_spreadsheet(topic)

        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        sheet_title = f"{topic[:30]} — {timestamp}"

        # Add a new tab for this research run
        svc.spreadsheets().batchUpdate(
            spreadsheetId=sheet_id,
            body={
                "requests": [
                    {
                        "addSheet": {
                            "properties": {"title": sheet_title}
                        }
                    }
                ]
            },
        ).execute()

        rows = self._build_rows(topic, timestamp, result)
        svc.spreadsheets().values().update(
            spreadsheetId=sheet_id,
            range=f"'{sheet_title}'!A1",
            valueInputOption="RAW",
            body={"values": rows},
        ).execute()

        url = f"https://docs.google.com/spreadsheets/d/{sheet_id}"
        logger.info("sheets.saved", sheet_id=sheet_id, tab=sheet_title)
        return url

    def _create_spreadsheet(self, topic: str) -> str:
        svc = self._get_service()
        body = {"properties": {"title": f"B-APO Research — {topic[:50]}"}}
        result = svc.spreadsheets().create(body=body).execute()
        sheet_id: str = result["spreadsheetId"]
        # Cache for subsequent calls in this session
        self._default_sheet_id = sheet_id
        logger.info("sheets.created", sheet_id=sheet_id)
        return sheet_id

    def _build_rows(self, topic: str, timestamp: str, result: Dict[str, Any]):
        research = result.get("research", {})
        ideation = result.get("ideation", {})
        validation = result.get("validation", {})
        prd = result.get("prd", "")
        sources = result.get("sources", [])

        rows = [
            ["B-APO 리서치 리포트"],
            ["주제", topic],
            ["생성 시간", timestamp],
            [],
            # ── 1. 시장 조사 ──────────────────────────────────
            ["[1] 시장 조사"],
            ["시장 개요", research.get("market_overview", "")],
            ["시장 규모 추정", research.get("market_size_estimate", "")],
            ["주요 트렌드"] + research.get("key_trends", []),
            ["타겟 고객"] + research.get("target_customers", []),
            ["고통점(Pain Points)"] + research.get("pain_points", []),
            ["기회"] + research.get("opportunities", []),
            [],
            # ── 2. 아이디어 기획 ──────────────────────────────
            ["[2] 제품 컨셉"],
        ]
        for i, c in enumerate(ideation.get("concepts", [])):
            rows.append([f"컨셉 {i+1}", c.get("name", ""), c.get("tagline", "")])
            rows.append(["설명", c.get("description", "")])
            rows.append(["타겟 세그먼트", c.get("target_segment", "")])
            rows.append(["수익 모델", c.get("revenue_model", "")])
            rows.append(["핵심 기능"] + c.get("key_features", []))
            rows.append([])

        rec = ideation.get("recommended_concept", 0)
        rows.append(["추천 컨셉 인덱스", str(rec)])
        rows.append([])

        # ── 3. 검증 ───────────────────────────────────────────
        rows.append(["[3] 검증 결과"])
        for ev in validation.get("evaluations", []):
            rows.append([
                f"컨셉 {ev.get('concept_index', '?')}",
                f"실현가능성: {ev.get('feasibility_score', 0):.2f}",
                f"시장적합성: {ev.get('market_fit_score', 0):.2f}",
                f"판정: {ev.get('verdict', '')}",
            ])
            rows.append(["리스크"] + ev.get("risks", []))
            rows.append(["완화방안"] + ev.get("mitigations", []))
        rows.append(["최종 추천", validation.get("final_recommendation", "")])
        rows.append([])

        # ── 4. PRD ────────────────────────────────────────────
        rows.append(["[4] PRD (제품 요구사항 정의서)"])
        for line in (prd or "").split("\n"):
            rows.append([line])
        rows.append([])

        # ── 출처 ─────────────────────────────────────────────
        rows.append(["[출처]"])
        rows.append(["제목", "URL"])
        for s in sources:
            rows.append([s.get("title", ""), s.get("url", "")])

        return rows
