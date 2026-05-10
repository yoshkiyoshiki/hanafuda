from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from featurePointMatching import analyze_image, load_templates

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# アプリ起動時にテンプレートをロード（キャッシュ）
print("Loading templates...")
try:
    TEMPLATES_CACHE = load_templates()
    print(f"Loaded {len(TEMPLATES_CACHE)} templates")
except Exception as e:
    print(f"Warning: Failed to load templates: {e}")
    TEMPLATES_CACHE = []

@app.get("/", methods=["GET", "HEAD"])
@app.head("/")
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