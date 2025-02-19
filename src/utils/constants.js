import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  'https://trellox-web.vercel.app'
  // 'http://localhost:5173' // Khong can localhost nua vi o file/cors da luon cho phep moi truong dev (env.BUILD_MODE === 'dev')
  // sau khi deploy lên production thì domain sẽ thay đổi
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'prod')
  ? env.WEBSITE_DOMAIN_PRODUCTION
  : env.WEBSITE_DOMAIN_DEVELOPMENT
