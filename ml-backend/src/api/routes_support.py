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
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID", "mock_agent")

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "mock_gemini_key"))
# Using user requested gemini-2.5-flash
model = genai.GenerativeModel('gemini-2.5-flash') 


def initiate_twilio_call(to_phone: str):
    """
    Mock or real Twilio call function.
    Connects to ElevenLabs conversational AI via Twilio streams.
    """
    if "mock" in TWILIO_ACCOUNT_SID:
        print(f"[MOCK] Twilio Call initiated to {to_phone} using ElevenLabs Agent {ELEVENLABS_AGENT_ID}")
        return {"status": "mock_success", "call_sid": "CA123456789 mock"}
        
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        # In a real integration, the URL would point to TwiML that connects a WebSocket to ElevenLabs
        call = client.calls.create(
            to=to_phone,
            from_=TWILIO_PHONE_NUMBER,
            url="http://demo.twilio.com/docs/voice.xml" # Placeholder TwiML
        )
        return {"status": "success", "call_sid": call.sid}
    except Exception as e:
        print(f"Twilio error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initiate voice call")


@router.post("/call")
async def trigger_voice_support(request: CallRequest, background_tasks: BackgroundTasks):
    """
    Initiates a voice call to the user via Twilio & ElevenLabs.
    """
    try:
        # Run Call in Background to avoid blocking the API response
        background_tasks.add_task(initiate_twilio_call, request.phone_number)
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
