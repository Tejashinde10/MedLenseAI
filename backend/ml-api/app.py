# app.py — FastAPI backend using BLIP + Tesseract + Google Gemini
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
import uvicorn
import torch
import pytesseract
from transformers import BlipProcessor, BlipForConditionalGeneration
import re
import google.generativeai as genai
import os
from pydantic import BaseModel


# ---------------- Gemini Configuration ----------------
# Make sure you've set GOOGLE_API_KEY in your system:
#   setx GOOGLE_API_KEY "your_api_key_here"
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("❌ GOOGLE_API_KEY not found. Run: setx GOOGLE_API_KEY 'your_key_here'")

genai.configure(api_key=api_key)
gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")

print("✅ Gemini model loaded successfully")

# ---------------- Caption Model (BLIP) ----------------
MODEL_NAME = "Salesforce/blip-image-captioning-base"
print("Loading BLIP caption model...")
processor = BlipProcessor.from_pretrained(MODEL_NAME)
model = BlipForConditionalGeneration.from_pretrained(MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
print("✅ BLIP loaded on", device)

# ---------------- Tesseract ----------------
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ---------------- FastAPI ----------------
app = FastAPI(title="MedLense AI - Medical Explainer (Gemini Powered)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173",
],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Helper Functions ----------------
def clean_ocr_text(raw: str, max_len: int = 2000) -> str:
    """Clean OCR artifacts and limit text length"""
    if not raw:
        return ""
    s = raw.replace("\r", "\n")
    s = re.sub(r'[_\-\=]{3,}', ' ', s)
    s = re.sub(r'\b(?:[A-Za-z]\s+){5,}\b', ' ', s)
    s = re.sub(r'\n{2,}', '\n', s)
    s = s.replace('ﬁ', 'fi').replace('ﬂ', 'fl')
    s = s.strip()
    return s[:max_len]

def build_prompt(caption: str, ocr_text: str) -> str:
    """Generate very friendly and patient-focused medical explanations."""
    return f"""
You are a kind, friendly doctor explaining a report to your patient in *very simple and caring language*.

💡 STYLE RULES:
- Always start with “Hi [patient name]!” if the name is available.
- Talk in a warm, reassuring tone like you are personally explaining their health.
- Keep sentences short and easy to understand.
- Do NOT sound like a report, record, or summary — sound like a conversation.
- Don’t mention dates, years, or complex medical terms unless they help the patient understand.
- Focus on what the patient *feels*, what happened, and what to do next.
- Always end with helpful and caring advice.

📋 Your response must always have exactly two parts:

**Explanation:**  
Explain what this report means in kind, simple words.  
Example:  
“Hi Ellen! You got a vaccine that protects you from cough, tetanus, and throat infections. It’s normal if your arm was a little sore afterward. You had your gallbladder surgery and a C-section a few years ago, and also had a small ankle injury once — nothing serious. You’re now using an inhaler for asthma, which helps you breathe better.”  

**Precautions:**  
Give 2–3 short, clear care tips based on the context (like “keep your inhaler with you” or “drink more water”).  
Always format them as a numbered list.  

Now write your output in this friendly style and Markdown format.

IMAGE CAPTION:
{caption}

EXTRACTED TEXT:
{ocr_text}

Write only:
Explanation: ...
**Precautions:**  
1. ...
2. ...
""".strip()

# ---------------- Main Endpoint ----------------
@app.post("/upload")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    image = Image.open(BytesIO(contents)).convert("RGB")

    # Step 1: OCR
    ocr_text = pytesseract.image_to_string(image)
    ocr_text = clean_ocr_text(ocr_text)

    # Step 2: Caption generation
    inputs = processor(images=image, return_tensors="pt").to(device)
    out = model.generate(**inputs, max_new_tokens=40)
    caption = processor.decode(out[0], skip_special_tokens=True)

    # Step 3: Simplified explanation with Gemini
    prompt = build_prompt(caption, ocr_text)

    try:
        response = gemini_model.generate_content(prompt)
        explanation = response.text.strip()
    except Exception as e:
        explanation = f"⚠️ Gemini explanation failed: {e}"

    return JSONResponse(content={
        "caption": caption,
        "extracted_text": ocr_text,
        "explanation": explanation
    })

# ---------------- Chat Endpoint ----------------
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_ai(req: ChatRequest):
    """Simple free-form chatbot using Gemini"""
    try:
        prompt = f"""
You are MedLense AI, a medical chatbot.
Give short, correct, simple answers.
User message: {req.message}
"""
        response = gemini_model.generate_content(prompt)
        ai_reply = response.text.strip()

        return {"reply": ai_reply}

    except Exception as e:
        return {"reply": f"⚠️ AI Error: {str(e)}"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, log_level="info")
