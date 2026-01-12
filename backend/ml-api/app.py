# app.py — FastAPI backend using Tesseract + Gemini Vision (Render-safe)

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
import pytesseract
import re
import os
from pydantic import BaseModel
import uvicorn

# ✅ NEW Gemini SDK (not deprecated)
from google.ai import generativeai as genai



# ---------------- Gemini Configuration ----------------
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("❌ GOOGLE_API_KEY not found in environment variables")

client = genai.Client(api_key=GOOGLE_API_KEY)
print("✅ Gemini client initialized")

# ---------------- Tesseract ----------------
# Only set path on Windows (Render/Linux already has it)
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ---------------- FastAPI ----------------
app = FastAPI(title="MedLense AI - Medical Explainer (Gemini Vision)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Helper Functions ----------------
def clean_ocr_text(raw: str, max_len: int = 2000) -> str:
    if not raw:
        return ""
    s = raw.replace("\r", "\n")
    s = re.sub(r'[_\-\=]{3,}', ' ', s)
    s = re.sub(r'\n{2,}', '\n', s)
    s = s.replace('ﬁ', 'fi').replace('ﬂ', 'fl')
    return s.strip()[:max_len]


def build_prompt(caption: str, ocr_text: str) -> str:
    return f"""
You are a kind, friendly doctor explaining a medical report to a patient in very simple language.

Write your answer in Markdown with EXACTLY two sections:

Explanation:
Explain what the report means in simple, reassuring words.

Precautions:
1. Give 2–3 short care tips.

IMAGE DESCRIPTION:
{caption}

EXTRACTED TEXT:
{ocr_text}
""".strip()


# ---------------- Upload Endpoint ----------------
@app.post("/upload")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    # 🔍 OCR
    ocr_text = pytesseract.image_to_string(image)
    ocr_text = clean_ocr_text(ocr_text)

    # 🧠 Gemini Vision (caption + understanding)
    try:
        vision_response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                "Describe this medical image clearly and simply for a patient.",
                image_bytes,
            ],
        )
        caption = vision_response.text.strip()
    except Exception as e:
        caption = f"Vision analysis failed: {e}"

    # 🩺 Gemini Explanation
    try:
        prompt = build_prompt(caption, ocr_text)
        explanation_response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        explanation = explanation_response.text.strip()
    except Exception as e:
        explanation = f"Explanation failed: {e}"

    return JSONResponse(
        content={
            "caption": caption,
            "ocr_text": ocr_text,
            "explanation": explanation,
        }
    )


# ---------------- Chat Endpoint ----------------
class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat_with_ai(req: ChatRequest):
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=f"You are MedLense AI. Answer simply:\n{req.message}",
        )
        return {"reply": response.text.strip()}
    except Exception as e:
        return {"reply": f"⚠️ AI Error: {e}"}


# ---------------- Run ----------------
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=10000)
