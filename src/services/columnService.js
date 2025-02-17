import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }

    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      // Update data before return for client
      getNewColumn.cards = []

      // Push columnId to last position of board's columnOrderIds
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) { throw error }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updatedBoard = await columnModel.update(columnId, updateData)

    return updatedBoard
  } catch (error) { throw error }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')

    // Xoa column
    await columnModel.deleteOneById(columnId)

    // Xoa tat ca card trong column
    await cardModel.deleteManyByColumnId(columnId)

    // Xoa columnId khoi board.columnOrderIds
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Column and its Card deleted successfully!' }
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}
