/* eslint-disable no-useless-catch */
// import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/fomatter'

const createNew = async (reqBody) => {
  try {
    // Xu ly logic du lieu dac thu cua du an
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Goi toi tang Model de xu ly luu ban ghi newBoard vao trong db
    const createdBoard = await boardModel.createNew(newBoard)

    // Lay ban ghi board sau khi goi (tuy muc tieu can lay hay khong)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Lam them cac xu ly logic khac voi cac Collection khac tuy dac thu cua du an.... vvv
    // Ban email, notification ve cho admin khi co 1 board moi duoc tao

    // Tra ket qua ve, trong Service luon phai co return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    return board
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails
}
