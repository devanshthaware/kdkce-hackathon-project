# Adaptive Auth ML Backend

This is the Machine Learning Backend Service for the AegisAuth Adaptive Authentication system. It provides risk assessment, anomaly detection, and automated support capabilities using various ML models and the Gemini API.

## Architecture

The service is built with **FastAPI** and uses a modular structure:

- `src/api`: FastAPI routes, entry point (`main.py`), and Pydantic schemas.
- `src/inference`: Model loading and inference logic.
- `src/models`: Model definitions and wrappers.
- `src/features`: Feature engineering and preprocessing logic.
- `src/config`: Configuration settings and environment variable management.
- `src/utils`: Logging and helper utilities.
- `weights/`: Directory containing trained model parameters.

## Key Features

- **Continuous Risk Assessment**: Evaluates session and activity risk in real-time.
- **Anomaly Detection**: Identifies unusual login patterns and device behaviors.
- **Adaptive Policies**: Dynamically adjusts security requirements based on risk scores.
- **AI Support Agent**: Automated troubleshooting and security assistance powered by Gemini.

## Setup & Installation

### Prerequisites

- Python 3.9+
- [Optional] Tesseract OCR (for certain device/image analysis)

### Installation

1. Navigate to the `ml-backend` directory:
   ```bash
   cd ml-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Service

Start the FastAPI server using the provided entry point:

```bash
python -m src.api.main
```

The service will be available at `http://localhost:8000`.

- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Health Check**: `http://localhost:8000/health`

## Environment Variables

Create a `.env` file in the `ml-backend` directory with the following variables:

```env
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True

# Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# Convex Integration
CONVEX_URL=your_convex_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

## Testing

Run tests using `pytest`:

```bash
pytest
```
