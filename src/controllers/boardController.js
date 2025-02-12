import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body:', req.body)
    // console.log('req.query:', req.query)
    // console.log('req.params:', req.params)
    // console.log('req.files:', req.files)
    // console.log('req.cookies:', req.cookies)
    // console.log('req.jwtDecoded:', req.jwtDecoded)

    // Dieu huong du lieu sang tang Service de xu ly
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Error from Controller: API create new board')

    // Sau khi xu ly xong, tra ve ket qua cho Client
    // res.status(StatusCodes.CREATED).json({ message: 'POST from Controller: API create new board' })
  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}
