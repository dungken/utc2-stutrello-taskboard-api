// https://github.com/getbrevo/brevo-node
const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY
// console.log('🚀 ~ env.BREVO_API_KEY:', env.BREVO_API_KEY)

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // Khoi tao mot cai sendSmtpEmail voi nhung thong tin can thiet
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // Tai khoan gui mail: la tao khoan tren Brevo
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Nhung tai khoan nhan email
  // 'to' la mot Array de sau co the tuy bien gui 1 email toi nhieu user
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // Tieu de cua email
  sendSmtpEmail.subject = customSubject

  // Noi dung cua email
  sendSmtpEmail.htmlContent = htmlContent

  // Goi hanh dong gui email
  // More info: thanh sendTransacEmail cua thu vien no se return mot Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
