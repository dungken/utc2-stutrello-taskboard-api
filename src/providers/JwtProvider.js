// https://www.npmjs.com/package/jsonwebtoken
import JWT from 'jsonwebtoken'
/**
 * Function tao moi mot token - Can 3 tham so dau vao
 * userInfo: Nhung thong tin muon dinh kem vao toekn
 * secretSignature: Chuoi bi mat de tao ra token
 * tokenLife: Thoi gian ton tai cua token
 */
const generateToken = (userInfo, secretSignature, tokenLife) => {
  try {
    // Ham sign() cua thu vien - Thuat toan mac dinh la HS256
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {throw new Error(error)}
}

/**
 * Function kiem tra 1 token co hop le hay khong
 * Hop le o day la cai token duoc tao ra co dung voi cai chu ky bi mat secretSignature
 * trong du an khong
 */
const verifyToken = (token, secretSignature) => {
  try {
    // Ham verify cua thu vien
    return JWT.verify(token, secretSignature)
  } catch (error) {throw new Error(error)}
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
