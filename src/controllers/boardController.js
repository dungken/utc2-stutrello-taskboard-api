import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // Dieu huong du lieu sang tang Service de xu ly
    const createdBoard = await boardService.createNew(req.body)

    // Sau khi xu ly xong, tra ve ket qua cho Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // Sau nay co  them userId vao req, de lay duoc board cua user do
    const board = await boardService.getDetails(req.params.id) // req.params.id la id cua board
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}


export const boardController = {
  createNew,
  getDetails
}
