import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'

const Router = express.Router()

export const cardRoute = Router

Router.route('/')
  .post(cardValidation.createNew, cardController.createNew)

export const APIs_V1 = Router
