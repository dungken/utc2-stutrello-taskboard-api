import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'

const Router = express.Router()

export const columnRoute = Router

Router.route('/')
  .post(columnValidation.createNew, columnController.createNew)

export const APIs_V1 = Router
