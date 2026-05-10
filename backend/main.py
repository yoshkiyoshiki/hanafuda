from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from featurePointMatching import analyze_image

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境ではドメイン指定を推奨
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Hanafuda API is running"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):

    save_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = analyze_image(save_path)

    return {
        "result": result
    }