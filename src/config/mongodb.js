import { env } from '~/config/environment'
const { MongoClient, ServerApiVersion } = require('mongodb')

// Khoi tao mot doi tuong trelloDatabaseInstance la null de thao tac voi database (vi chua ket noi)
let trelloDatabaseInstance = null

// Khoi tao mot doi tuong mongoClientInstance de ket noi voi MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Luu y: serverApi phai duoc cung cap de su dung cac tinh nang moi nhat cua MongoDB
  // Doc them: https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Ket noi toi Database
export const CONNECT_DB = async () => {
  // Goi ket noi toi MongoDB Atlas voi URI da khai bao trong than cua mongoClientInstance
  await mongoClientInstance.connect()

  // Ket noi thanh cong thi lay ra Database theo ten va gan nguoc no lai vao bien trelloDatabaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// Dong ket noi toi Database
export const CLOSE_DB = async () => {
  // Dong ket noi voi MongoDB
  await mongoClientInstance.close()
}

// Function GET_DB (khong async) de lay ra doi tuong trelloDatabaseInstance sau khi da ket noi thanh cong voi MongoDB de co the su dung trong cac file khac
// Luu y: Phai ket noi voi MongoDB truoc khi su dung ham nay
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to database first!')
  return trelloDatabaseInstance
}
