/**
 * API エンドポイント設定
 * 環境変数から取得、デフォルト値は開発環境のローカルIP
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * API エンドポイント
 */
export const API_ENDPOINTS = {
  ANALYZE: `${API_BASE_URL}/analyze`,
} as const;
