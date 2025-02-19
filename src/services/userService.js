import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/fomatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

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
      <a href="${verificationLink}" target="_blank">Verify my email address: ${verificationLink}</a>
      <p>If you did not create an account with us, please ignore this email.</p>
      <p>Thank you!</p>
    `
    // Goi toi Provider de gui mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // Tra ve thong tin cho phia Controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user tu database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Cac buoc kiem tra can thiet
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account has been activated!')
    if (existUser.verifyToken !== reqBody.token) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid token!')

    // Neu nhu moi thu ok thi chung ta bat dau update lai thong tin user de verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    // Thuc hien update thong tin user
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    // Query user tu database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Cac buoc kiem tra can thiet
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Password is incorrect!')

    // Neu moi thu ok thi bat dau tao Tokens dang nhap de tra ve phia FE
    // Thong tin de dinh kem trong JWT Token bao gom _id va email cua user
    const userInfo = { _id: existUser._id, email: existUser.email }

    // Tao ra 2 loai token, access token va refresh token de tra ve phia FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15
      env.REFRESH_TOKEN_LIFE
    )

    // Tra ve thong tin cua user kem theo 2 loai token
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Bước 01: Thực hiện giải mã refreshToken xem nó có hợp lệ hay là không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // console.log('🚀 ~ refreshToken ~ refreshTokenDecoded:', refreshTokenDecoded)

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới.
    const userInfo = { _id: refreshTokenDecoded._id, email: refreshTokenDecoded.email }

    // Bước 02: Tạo ra cái accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 giây
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody) => {
  try {
    // Query User và kiểm tra cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    // Khởi tạo kết quả updated User ban đầu là empty
    let updatedUser = {}

    // Trường hợp change password
    if (reqBody.current_password && reqBody.new_password) {
      // Kiểm tra xem cái current_password có đúng hay không
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Current Password is incorrect!')
      }
      // Nếu như current_password là đúng thì chúng ta sẽ hash một cái mật khẩu mới và update lại vào DB:
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    }
    //  else if (userAvatarFile) {
    //   // Trường hợp upload file lên Cloud Storage, cụ thể là Cloudinary
    //   const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
    //   // console.log('uploadResult: ', uploadResult)

    //   // Lưu lại url (secure_url) của cái file ảnh vào trong Database
    //   updatedUser = await userModel.update(existUser._id, {
    //     avatar: uploadResult.secure_url
    //   })
    // }
    else {
      // Trường hợp update các thông tin chung, ví dụ như displayName
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
