# 🚀 MASTER CURSOR PROMPT

Copy and paste the section below into Cursor (or any AI agent) to provide it with a perfect understanding of the AegisAuth system boundaries.

---

```text
We have 4 independent systems inside sbjit-project:

1. aegis-demo-app
   - A Next.js demo SaaS app
   - Uses @aegis/auth-sdk
   - Demonstrates login, risk scoring, live threat detection
   - Does NOT calculate risk

2. sdk
   - TypeScript SDK package
   - Collects contextual signals
   - Attaches API key
   - Calls ml-backend via REST
   - Provides helper methods for monitoring
   - Pure integration layer

3. ml-backend
   - Python FastAPI service
   - Loads 5 trained ML models
   - Calculates risk score
   - Aggregates risk components
   - Returns structured RiskResponse
   - Stateless inference service

4. frontend
   - AegisAuth platform dashboard
   - Manages projects and API keys
   - Displays risk logs
   - Displays analytics
   - Reads data from ml-backend

Architecture Flow:

Demo App → SDK → ML Backend → RiskResponse → Demo App UI
                                      ↓
                                Logs stored
                                      ↓
                              Platform Dashboard

These systems must remain independent.
No ML logic inside frontend or demo app.
SDK must remain inference-only.
ML backend must not contain UI code.
Platform must not contain inference logic.

Maintain strict separation of concerns.
Use REST for communication between services.
Use API key authentication for SDK to backend calls.
```
