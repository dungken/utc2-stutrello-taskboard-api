/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'

const START_SERVER = () => {
  const app = express()

  // Fix cái vụ Cache from disk của ExpressJS
  // https://stackoverflow.com/a/53240717/8324172
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Config cookie parser
  app.use(cookieParser())

  // Handle CORS
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs V1
  app.use('/v1', APIs_V1)

  // Middleware xu ly loi tap trung
  app.use(errorHandlingMiddleware)

  // Moi truong production (hien tai dang support boi Render.com)
  if (env.BUILD_MODE === 'prod') {
    app.listen(process.env.PORT, () => {
      console.log(`3. Production: Hello ${env.AUTHOR}, Backend server is running successfully at Port: ${process.env.PORT}`)
    })
  } else {
    // Moi truong local dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local Dev: Hello ${env.AUTHOR}, I am running at http://${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

  // Thuc hien cac tac vu cleanup truoc khi dung server
  // Doc them: https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
  exitHook(() => {
    console.log('4. Server is shutting down...')
    CLOSE_DB()
    console.log('5. Closed MongoDB connection successfully!')
  })
}

// Chi khi ket noi voi MongoDB thanh cong thi moi bat dau chay server
// IIFE (Immediately Invoked Function Expression)
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB successfully!')
    // Sau khi ket noi thanh cong voi MongoDB thi moi bat dau chay server
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// Chi khi ket noi voi MongoDB thanh cong thi moi bat dau chay server
// console.log('1. Connecting to MongoDB Cloud Atlas...')
// CONNECT_DB()
//   .then(() => console.log('2. Connected to MongoDB successfully!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })
