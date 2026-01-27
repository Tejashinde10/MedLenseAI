# app.py — FastAPI backend (Render-safe, Netlify-safe)

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

# ---------------- Gemini ----------------
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("❌ GOOGLE_API_KEY missing in environment")

genai.configure(api_key=GOOGLE_API_KEY)
gemini = genai.GenerativeModel("gemini-1.5-flash")
print("✅ Gemini initialized")

# ---------------- FastAPI ----------------
app = FastAPI(title="MedLense AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://medlense.netlify.app",
    ],
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Tesseract ----------------
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ---------------- Helpers ----------------
def clean_text(text: str, limit: int = 2000) -> str:
    if not text:
        return ""
    text = text.replace("\r", "\n")
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()[:limit]


def build_prompt(caption: str, ocr: str) -> str:
    return f"""
You are a friendly doctor explaining a medical report to a patient.

Explanation:
Explain in simple, kind language.

Precautions:
Give 2–3 short care tips.

IMAGE DESCRIPTION:
{caption}

OCR TEXT:
{ocr}
""".strip()

# ---------------- Upload ----------------
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    data = await file.read()

    # ---- IMAGE ----
    if file.content_type.startswith("image/"):
        image = Image.open(BytesIO(data)).convert("RGB")
        ocr_text = clean_text(pytesseract.image_to_string(image))

        try:
            vision = gemini.generate_content(
                [
                    "Describe this medical image simply for a patient.",
                    data,
                ]
            )
            caption = vision.text.strip()
        except Exception as e:
            caption = f"Vision failed: {e}"

    # ---- PDF (SAFE FALLBACK) ----
    elif file.content_type == "application/pdf":
        caption = "Medical PDF uploaded"
        ocr_text = "PDF text extraction not enabled yet."

    else:
        raise HTTPException(400, "Unsupported file type")

    # ---- Explanation ----
    try:
        explanation = gemini.generate_content(
            build_prompt(caption, ocr_text)
        ).text.strip()
    except Exception as e:
        explanation = f"AI explanation failed: {e}"

    return JSONResponse({
        "caption": caption,
        "ocr_text": ocr_text,
        "explanation": explanation,
    })

# ---------------- Chat ----------------
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        reply = gemini.generate_content(req.message).text.strip()
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"AI error: {e}"}

# ---------------- Run ----------------
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=10000)
