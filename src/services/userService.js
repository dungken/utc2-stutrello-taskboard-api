import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/fomatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'


const createNew = async (reqBody) => {
  try {
    // Kiem tra xem email da ton tai trong he thong chua
    const exitstUser = await userModel.findOneByEmail(reqBody.email)
    if (exitstUser) throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')

    // Tao data de luu va database
    // nameFromEmail: neu email la dungken@gmail.com thi nameFromEmail se la dungken
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 10), // tham so thu 2 la do phuc tap cua password
      username: nameFromEmail,
      displayName: nameFromEmail, // mac dinh la nameFromEmail, sau nay co the cap nhat
      verifyToken: uuidv4()
    }

    // Thuc hien luu thong tin user vao database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Gui mail cho nguoi dung xac thuc tai khoan
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'StuTrello TaskBoard: Please verify your email address before using our services!'
    const htmlContent = `
      <h3>Hi ${getNewUser.displayName},</h3>
      <p>Thank you for signing up with StuTrello TaskBoard. Please verify your email address by clicking the link below.</p>
      <a href="${verificationLink}" target="_blank">Verify my email address</a>
      <p>If you did not create an account with us, please ignore this email.</p>
      <p>Thank you!</p>
    `
    // Goi toi Provider de gui mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // Tra ve thong tin cho phia Controller
    return pickUser(getNewUser)
  } catch (error) { 
    console.log('🚀 ~ createNew ~ error:', error)
    throw error 
  }
}

export const userService = {
  createNew
}
