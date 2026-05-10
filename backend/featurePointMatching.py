from email.mime import image

import cv2
import numpy as np
import os
from multiprocessing import Pool, cpu_count

# =========================
# 設定
# =========================
# 今はpythonファイル内にURLをハードコードしているが、将来的にはフロントエンドから渡す形にする予定
IMAGE_URL = r"C:\Users\hanafuda\koikoi-app\frontend\assets\images\sample5.png"
TEMPLATE_DIR = "./images"  # テンプレート画像が保存されているディレクトリ

# テンプレートキャッシュ
_TEMPLATES_CACHE = None

def load_templates():
    """テンプレート画像をメモリにロード（初回起動時に一度だけ実行）"""
    global _TEMPLATES_CACHE
    if _TEMPLATES_CACHE is not None:
        return _TEMPLATES_CACHE
    
    templates = []
    for file in os.listdir(TEMPLATE_DIR):
        if not file.lower().endswith((".jpg", ".jpeg")):
            continue
        
        path = os.path.join(TEMPLATE_DIR, file)
        template = cv2.imread(path)
        
        if template is None:
            continue
        
        kp, des = get_features(template)
        templates.append((file, kp, des))
    
    _TEMPLATES_CACHE = templates
    return templates

# =========================
# 画像ダウンロード
# =========================
def load_image_from_url(url):
    return cv2.imread(url)

# =========================
# 特徴点
# =========================
def get_features(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    akaze = cv2.AKAZE_create()
    kp, des = akaze.detectAndCompute(gray, None)
    return kp, des

# =========================
# マッチング
# =========================
def match_score(des1, des2):
    if des1 is None or des2 is None:
        return 0

    bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    matches = bf.knnMatch(des1, des2, k=2)

    good = []
    for pair in matches:
        if len(pair) < 2:
            continue
        m, n = pair
        if m.distance < 0.75 * n.distance:
            good.append(m)

    return len(good)

def order_points(pts):
    pts = pts.reshape(4, 2)

    rect = np.zeros((4, 2), dtype="float32")

    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # 左上
    rect[2] = pts[np.argmax(s)]  # 右下

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # 右上
    rect[3] = pts[np.argmax(diff)]  # 左下

    return rect

def refine_card_inner(card_img):
    gray = cv2.cvtColor(card_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 5)
    blur = cv2.bilateralFilter(gray, 9, 75, 75)
    edges = cv2.Canny(blur, 50, 150)
    kernel = np.ones((3,3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return card_img

    cnt = max(contours, key=cv2.contourArea)

    peri = cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

    if len(approx) == 4:
        pts = approx.reshape(4, 2)
    else:
        rect = cv2.minAreaRect(cnt)
        pts = cv2.boxPoints(rect)

    pts = pts.astype(np.float32)

    # ★ 内側に縮める
    center = np.mean(pts, axis=0)
    shrink_ratio = 0.90
    pts_inner = (pts - center) * shrink_ratio + center

    # ★ ここでも順序を保証（念のため）
    pts_inner = order_points(pts_inner)

    dst = np.array([
        [0, 0],
        [199, 0],
        [199, 299],
        [0, 299]
    ], dtype=np.float32)

    M = cv2.getPerspectiveTransform(pts_inner, dst)
    warped = cv2.warpPerspective(card_img, M, (200, 300))

    # ★ 縦長を保証（保険）
    h, w = warped.shape[:2]
    if w > h:
        warped = cv2.rotate(warped, cv2.ROTATE_90_CLOCKWISE)

    return warped

# =========================
# カード検出
# =========================
def detect_cards(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.bilateralFilter(gray, 9, 75, 75)
    edges = cv2.Canny(blur, 80, 80)
    kernel = np.ones((3,3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=3)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # 描画用
    draw_img = image.copy()

    cards = []

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 10000:
            continue
        if area > 75000:
            continue

        # ★ 四角形推定
        rect = cv2.minAreaRect(cnt)

        (w, h) = rect[1]
        # ★ 0除算対策
        if w == 0 or h == 0:
            continue
        ratio = max(w, h) / min(w, h)
        print(f"Area: {area}, Ratio: {ratio:.2f}")
        # ★ 花札っぽい比率でフィルタ（調整ポイント）
        # if ratio < 1.1 or ratio > 1.7:
        #     continue

        box = cv2.boxPoints(rect)
        box = box.astype(int)
        x, y, w, h = cv2.boundingRect(box)
        if x < 0:
            x = 0
        if y < 0:
            y = 0

        card_crop = image[y:y+h, x:x+w]
        refine_card_img = refine_card_inner(card_crop)
        cards.append(refine_card_img)

        # ★ 描画
        cv2.drawContours(draw_img, [box], 0, (0, 255, 0), 2)

    

    return cards

# =========================
# 透視変換（カードを正面に補正）
# =========================
def warp_card(image, pts):
    pts = pts.reshape(4, 2)

    rect = np.zeros((4,2), dtype="float32")

    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]

    (tl, tr, br, bl) = rect

    width = 200
    height = 300

    dst = np.array([
        [0,0],
        [width-1,0],
        [width-1,height-1],
        [0,height-1]
    ], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    warp = cv2.warpPerspective(image, M, (width, height))

    return warp
    

# =========================
# テンプレマッチ関数
# =========================
def match_template(args):
    card_image, file, template = args

    best_score = 0

    rots = [
        card_image,
        cv2.rotate(card_image, cv2.ROTATE_90_CLOCKWISE),
        cv2.rotate(card_image, cv2.ROTATE_180),
        cv2.rotate(card_image, cv2.ROTATE_90_COUNTERCLOCKWISE)
    ]

    for rot in rots:
        rot = cv2.resize(rot, (template.shape[1], template.shape[0]))
        res = cv2.matchTemplate(rot, template, cv2.TM_CCOEFF_NORMED)
        score = res.max()

        if score > best_score:
            best_score = score

    return (file, best_score)


# =========================
# メイン
# =========================
def analyze_image(image_path):
    image = cv2.imread(image_path)

    if image is None:
        return []

    cards = detect_cards(image)

    # キャッシュされたテンプレートを使用
    templates = load_templates()

    results_json = []

    for i, card_img in enumerate(cards):

        kp1, des1 = get_features(card_img)

        best_score = 0
        best_match = None

        for file, kp2, des2 in templates:
            score = match_score(des1, des2)

            if score > best_score:
                best_score = score
                best_match = file

        if best_match is not None:
            results_json.append({
                "cardId": best_match.split(".")[0], #ファイル名からjpgを除いてカードIDを抽出
            })

    return results_json

# def main():
#     image = cv2.imread(IMAGE_URL)

#     if image is None:
#         print("画像読み込み失敗")
#         return

#     print("カード検出中...")
#     contours = detect_cards(image)

#     # テンプレ読み込み
#     templates = []
#     for file in os.listdir(TEMPLATE_DIR):
#         if not file.lower().endswith((".jpg", ".jpeg")):
#             continue

#         path = os.path.join(TEMPLATE_DIR, file)
#         template = cv2.imread(path)
#         #特徴点マッチング
#         kp, des = get_features(template)
#         templates.append((file, kp, des))
#         #テンプレートマッチング
#         #templates.append((file, template))

#     # カードごと処理
#     for i, cnt in enumerate(contours):
#         card_img = cnt

#         best_score = 0
#         best_match = None


#         #-----------------------------
#         #特徴点マッチング用の処理（ここから）
#         #-----------------------------
#         kp1, des1 = get_features(card_img)

#         for file, kp2, des2 in templates:
#             score = match_score(des1, des2)
#             if score > best_score:
#                 best_score = score
#                 best_match = file
#         #-----------------------------


#         #-----------------------------
#         #テンプレートマッチング用の処理（ここから）
#         #-----------------------------
#         # # 引数まとめる
#         # args = [(card_img, file, template) for file, template in templates]

#         # # 並列処理
#         # with Pool(cpu_count()) as pool:
#         #     results = pool.map(match_template, args)
#         # best_match, best_score = max(results, key=lambda x: x[1])    

#         #-----------------------------

#     # for i, cnt in enumerate(contours):
#     #     card_img = warp_card(image, cnt)

#         # ★ ここ追加
#         cv2.imshow(f"card_{i}", card_img)
#         cv2.waitKey(0)
#         cv2.destroyAllWindows()

#         print(f"[カード{i}] → {best_match} (score={best_score})")

# if __name__ == "__main__":
#     main()