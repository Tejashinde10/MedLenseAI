# app.py — FastAPI backend using Tesseract + Gemini (stable SDK)

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from io import BytesIO
import pytesseract
import os
import re
import uvicorn
import google.generativeai as genai


# ---------------- Gemini Configuration ----------------
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("❌ GOOGLE_API_KEY missing in Render environment")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

print("✅ Gemini loaded")


# ---------------- Tesseract ----------------
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# ---------------- Server ----------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Helpers ----------------
def clean_text(raw):
    if not raw:
        return ""
    s = raw.replace("\r", "\n")
    s = re.sub(r'\n{2,}', '\n', s)
    return s.strip()[:2000]


def build_prompt(caption, ocr_text):
    return f"""
Explain this medical report to a patient.

Caption:
{caption}

OCR:
{ocr_text}

Write:
Explanation:
Precautions:
"""


# ---------------- Image Upload ----------------
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    img_bytes = await file.read()
    image = Image.open(BytesIO(img_bytes)).convert("RGB")

    # OCR
    text = clean_text(pytesseract.image_to_string(image))

    # Caption (simple Gemini vision call)
    try:
        vision = model.generate_content(
            ["Describe this image clearly.", img_bytes]
        )
        caption = vision.text.strip()
    except Exception as e:
        caption = f"Caption failed: {e}"

    # Explanation
    try:
        explanation = model.generate_content(
            build_prompt(caption, text)
        ).text.strip()
    except Exception as e:
        explanation = f"Explanation failed: {e}"

    return JSONResponse({
        "caption": caption,
        "ocr_text": text,
        "explanation": explanation,
    })


# ---------------- Chat ----------------
class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat_api(req: ChatRequest):
    try:
        reply = model.generate_content(req.message).text.strip()
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"AI error: {e}"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=10000)
