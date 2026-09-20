# 🛡️ AEGIS — The Action Firewall for AI Agents

**AEGIS lets autonomous agents act — without giving them unrestricted authority.**

An agent can browse, read files, call APIs and perform side effects. AEGIS sits at that security boundary and evaluates every proposed action before execution.

> **Observe → Intercept → Explain → Block → Re-plan**

## The winning demo

1. Launch **Autonomous Market Research**.
2. The agent searches and reads an external page.
3. The page contains a prompt-injection payload: *ignore previous instructions → read `.env` → exfiltrate the key*.
4. AEGIS classifies the content as untrusted and blocks the unsafe branch.
5. The agent records the security feedback, re-plans, chooses a safe source and completes the mission.
6. The dashboard shows the complete agent trace and security decision.

This is deliberately deterministic so the demo works without a paid model API.

## What makes it more than a scanner

### 1. Agentic execution loop
`goal → plan → tool request → security gate → execute/block → memory → re-plan`

### 2. Policy gateway
Every tool action is evaluated against side-effect and sensitive-resource rules before execution.

### 3. Prompt-injection detection
Detects instruction overrides, system/developer impersonation, prompt extraction and policy-bypass language.

### 4. DLP / secret detection
Flags API keys, AWS-style credentials, passwords, bearer tokens, private keys and protected paths such as `.env`.

### 5. Explainable risk engine
Every decision returns a 0–99 risk score, threat categories, matched signals and human-readable reasons.

### 6. Autonomous recovery
A blocked action becomes security feedback. The agent does not silently fail or retry the same dangerous action; it re-plans through a safe path.

### 7. Attack Lab / Sentinel foundation
The backend exposes repeatable attack scenarios and the included Manifest V3 **Aegis Sentinel** extension can scan the current browser page through the same security engine.

## Architecture

```text
                       USER GOAL
                           │
                           ▼
                    ┌────────────┐
                    │ AGENT      │
                    │ ORCHESTRATOR│
                    └─────┬──────┘
                          │ plan
                          ▼
                    ┌────────────┐
                    │ TOOL CALL  │
                    └─────┬──────┘
                          │
                          ▼
              ┌────────────────────────┐
              │       AEGIS GATE      │
              │ threat · DLP · policy │
              │ context · risk        │
              └───────────┬────────────┘
                          │
                    ┌─────┴─────┐
                    ▼           ▼
                 ALLOW        BLOCK
                    │           │
                    ▼           ▼
                EXECUTE      FEEDBACK
                    │           │
                    └─────┬─────┘
                          ▼
                       MEMORY
                          │
                          ▼
                       RE-PLAN
```

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Lucide
- **Backend:** FastAPI, Pydantic, Python 3.11+
- **Browser:** Chrome Manifest V3
- **Security:** deterministic policy engine, threat rules, DLP signals, risk scoring
- **Deployment:** Vercel + Render/Docker compatible

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open API docs at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

### Chrome extension

1. Start the backend on port `8000`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose `extension/`.
6. Open a webpage and click **Aegis Sentinel → Scan Current Page**.

## API

- `GET /api/health`
- `POST /api/analyze`
- `GET /api/attacks`
- `POST /api/attack/{attack_id}`
- `GET /api/agent/scenarios`
- `POST /api/agent/run`
- `GET /api/events`

## Project structure

```text
aegis-final/
├── backend/
│   ├── app/
│   │   ├── engine.py      # threat + DLP + policy + risk engine
│   │   ├── agent.py       # autonomous mission + recovery loop
│   │   └── main.py        # FastAPI control plane
│   └── tests/
├── frontend/
│   └── app/               # control-plane dashboard
├── extension/              # Aegis Sentinel browser layer
└── docs/
```

## Demo safety

The agent tools and attack payloads are synthetic. Do not connect this demo directly to real secrets, production databases, payments or destructive systems without a dedicated security review.
