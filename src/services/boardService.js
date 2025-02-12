/* eslint-disable no-useless-catch */
// import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/fomatter'

const createNew = async (reqBody) => {
  try {
    // Xu ly logic du lieu dac thu cua du an
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Goi toi tang Model de xu ly luu ban ghi newBoard vao trong db

    // Lam them cac xu ly logic khac voi cac Collection khac tuy dac thu cua du an.... vvv
    // Ban email, notification ve cho admin khi co 1 board moi duoc tao

    // Tra ket qua ve, trong Service luon phai co return
    return newBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew
}