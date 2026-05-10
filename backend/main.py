from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
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

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hanafuda API</title>
    </head>
    <body>
        <h1>Hanafuda API is running</h1>
        <p>このサーバーは花札認識API です。</p>
        <ul>
            <li><a href="/docs">API Documentation</a></li>
            <li><a href="/privacy-policy">プライバシーポリシー</a></li>
        </ul>
    </body>
    </html>
    """

@app.get("/privacy-policy", response_class=HTMLResponse)
async def privacy_policy():
    return """
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>プライバシーポリシー</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            h1 {
                color: #333;
                border-bottom: 3px solid #007bff;
                padding-bottom: 10px;
            }
            h2 {
                color: #555;
                margin-top: 30px;
            }
            .section {
                background-color: white;
                padding: 20px;
                margin: 10px 0;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .last-updated {
                color: #888;
                font-size: 14px;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <h1>プライバシーポリシー</h1>
        
        <div class="section">
            <h2>1. はじめに</h2>
            <p>
                花札認識アプリ「Koikoi」（以下「本アプリ」）は、ユーザーの個人情報を尊重し、
                プライバシー保護を最優先とします。このプライバシーポリシーは、
                本アプリの開発者がどのような情報を収集し、
                どのように使用するかを説明しています。
            </p>
        </div>

        <div class="section">
            <h2>2. 収集する情報</h2>
            <h3>2.1 カメラ権限</h3>
            <p>
                本アプリはカメラ機能を使用して花札カードの画像を撮影します。
                撮影した画像は以下の目的でのみ使用されます：
            </p>
            <ul>
                <li>花札カードの認識・判定</li>
                <li>アプリの機能向上</li>
            </ul>
            <p>
                <strong>重要：撮影した画像はサーバーで処理された後、
                ローカルデバイスから自動削除されます。</strong>
            </p>
        </div>

        <div class="section">
            <h2>3. 情報の保管と安全性</h2>
            <ul>
                <li>画像データはサーバーで一時的に処理されます</li>
                <li>処理後、画像データはサーバーから削除されます</li>
                <li>個人を特定可能な情報（顔、人物など）は保存されません</li>
                <li>通信はSSL/TLSで暗号化されます</li>
            </ul>
        </div>

        <div class="section">
            <h2>4. 第三者への情報開示</h2>
            <p>
                本アプリは法律の要求がない限り、
                ユーザーの個人情報を第三者と共有することはありません。
            </p>
        </div>

        <div class="section">
            <h2>5. ユーザーの権利</h2>
            <p>
                ユーザーはいつでも本アプリのカメラ権限をアンインストールまたは無効化することができます。
                これにより、アプリの画像認識機能は利用できなくなりますが、その他の機能は継続して使用できます。
            </p>
        </div>

        <div class="section">
            <h2>6. ポリシーの変更</h2>
            <p>
                本アプリの開発者は、本プライバシーポリシーを予告なく変更する権利を有しています。
                変更がある場合は、このページで通知されます。
            </p>
        </div>

        <div class="section">
            <h2>7. お問い合わせ</h2>
            <p>
                本プライバシーポリシーについてご質問がある場合は、
                アプリストアの「開発者に連絡」オプションからお問い合わせください。
            </p>
        </div>

        <p class="last-updated">
            最終更新日：2026年5月10日
        </p>
    </body>
    </html>
    """

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