from fastapi import FastAPI, UploadFile, File
import shutil
import os

from featurePointMatching import analyze_image, load_templates

app = FastAPI()


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


@app.post("/test")
async def test(text: str):

    return {
        "text": text
    }