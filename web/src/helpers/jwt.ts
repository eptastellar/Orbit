import { JWTPayload, SignJWT, jwtVerify } from "jose";

export async function generateJWT(uid: string) {
   const payload = { 'uid': uid };

   const jwt = new SignJWT(payload);
   jwt.setProtectedHeader({ alg: 'HS256' });
   jwt.setIssuedAt();
   jwt.setExpirationTime('4w'); //create a jwt and set the expire time to 4 weeks

   const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
   const signedJwt = await jwt.sign(secret);

   return signedJwt;
}

export async function validateJWT(token: string): Promise<JWTPayload> { //need to use the then catch to invoke this function
   return new Promise(async (resolve, reject) => {
      try {
         const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
         const { payload } = await jwtVerify(token, secret); //validate the user token and return the user payload
         resolve(payload);
      } catch (error) {
         reject(new Error('Invalid token'))
      }
   })
}
