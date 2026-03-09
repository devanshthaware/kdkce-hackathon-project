from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import os
from twilio.rest import Client
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Setup Router
router = APIRouter(prefix="/api/v1/support", tags=["Support Center"])

# Request Models
class CallRequest(BaseModel):
    user_id: str
    phone_number: str

class ChatRequest(BaseModel):
    ticket_id: str
    message: str

# Config & Credentials
# Use environment variables for secure keys
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "mock_sid")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "mock_token")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+1234567890")
import requests
from dotenv import load_dotenv

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "mock_gemini_key"))
# Using user requested gemini-2.5-flash
model = genai.GenerativeModel('gemini-2.5-flash') 


def initiate_elevenlabs_call(to_phone: str):
    """
    Initiates an outbound call using ElevenLabs API.
    """
    # Force dotenv to reload to ensure we have the latest keys from ml-backend/.env
    load_dotenv(override=True)
    
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID", "mock_agent")
    ELEVENLABS_PHONE_ID = os.getenv("ELEVENLABS_PHONE_ID", "mock_phone_id")
    
    if "mock" in ELEVENLABS_AGENT_ID or not ELEVENLABS_API_KEY:
        print(f"[MOCK] ElevenLabs Call initiated to {to_phone} using Agent {ELEVENLABS_AGENT_ID} and Phone ID {ELEVENLABS_PHONE_ID}")
        return {"status": "mock_success"}
        
    try:
        # Note: The precise endpoint for creating an outbound call in ElevenLabs V1 API is:
        # POST /v1/convai/twilio/outbound-call
        url = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call"
        payload = {
            "agent_id": ELEVENLABS_AGENT_ID,
            "agent_phone_number_id": ELEVENLABS_PHONE_ID,
            "to_number": to_phone
        }
        
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return {"status": "success", "data": response.json()}
    except Exception as e:
        print(f"ElevenLabs API error: {str(e)}")
        if isinstance(e, requests.exceptions.HTTPError):
            print(f"Response Body: {e.response.text}")
        raise HTTPException(status_code=500, detail="Failed to initiate voice call via ElevenLabs")


@router.post("/call")
async def trigger_voice_support(request: CallRequest, background_tasks: BackgroundTasks):
    """
    Initiates a voice call to the user via ElevenLabs Outbound Calling API.
    """
    try:
        # Run Call in Background to avoid blocking the API response
        background_tasks.add_task(initiate_elevenlabs_call, request.phone_number)
        return {"status": "Call initiated", "phone": request.phone_number}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/ai-chat")
async def trigger_ai_chat(request: ChatRequest):
    """
    Generates an AI response for the user's support message using Gemini.
    In a full implementation, this would also write the response back to Convex.
    """
    try:
        prompt = f"""
        You are the AegisAuth Support Assistant. The user has sent the following message:
        "{request.message}"
        
        Provide a concise, helpful troubleshooting response.
        If it seems like a critical security issue or they ask for a human, tell them an agent will be with them shortly.
        """
        response = model.generate_content(prompt)
        ai_text = response.text
        
        # Here we would normally use the convex python client to mutation/insert the message back into the Convex DB.
        # convex_client.mutation("support:sendMessage", ticketId=request.ticket_id, senderId="system", senderRole="ai", content=ai_text, isAiGenerated=True)
        
        return {"status": "success", "response": ai_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
