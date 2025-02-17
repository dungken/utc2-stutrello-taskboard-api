import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'

const Router = express.Router()

export const columnRoute = Router

Router.route('/')
  .post(columnValidation.createNew, columnController.createNew)

Router.route('/:id')
  .put(columnValidation.update, columnController.update)

export const APIs_V1 = Router
