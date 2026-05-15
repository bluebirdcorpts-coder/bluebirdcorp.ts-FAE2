# Bluebird B-APO — 로컬 개발 환경 설정

## 사전 요구사항

| 도구 | 버전 | 설치 방법 |
|------|------|-----------|
| Python | 3.12+ | https://www.python.org/downloads/ |
| Git | 최신 | https://git-scm.com/ |
| Redis | 7+ | Docker 또는 https://redis.io/ |

> Windows에서는 Python 공식 설치 시 **"Add Python to PATH"** 체크 필수

---

## 1. 가상 환경 생성 및 의존성 설치

```powershell
cd C:\Users\user\bluebird-apo

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

---

## 2. 환경 변수 설정

```powershell
Copy-Item .env.example .env
```

`.env` 파일에서 반드시 설정:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
SECRET_KEY=your-random-secret-key
```

---

## 3. 서버 실행

```powershell
# 개발 모드 (핫 리로드)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 또는
python main.py
```

API 문서: http://localhost:8000/docs

---

## 4. Docker로 전체 스택 실행

```powershell
docker-compose up -d
```

서비스:
- `api` → http://localhost:8000
- `worker` → Celery 비동기 워커
- `redis` → localhost:6379

---

## 5. 테스트 실행

```powershell
pytest tests/ -v
```

---

## API 빠른 사용 예시

### 제품 등록
```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"BB-001","name":"Bluebird X1","category":"hardware","price":299.99}'
```

### AI 분석 실행
```bash
curl -X POST http://localhost:8000/api/v1/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "product_analysis",
    "payload": {
      "product_name": "Bluebird X1",
      "product_data": {"category": "hardware", "price": 299.99}
    }
  }'
```

### 헬스 체크
```bash
curl http://localhost:8000/api/v1/health
```
