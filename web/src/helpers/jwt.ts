import { SignJWT, jwtVerify } from "jose";

export async function generateJWT(uid: string) {
   const payload = {
      'uid': uid,
   };

   const jwt = new SignJWT(payload);
   jwt.setProtectedHeader({ alg: 'HS256' });
   jwt.setIssuedAt();
   jwt.setExpirationTime('4w'); //create a jwt and set the expire time to 4 weeks

   const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
   const signedJwt = await jwt.sign(secret);

   return signedJwt;
}

export async function validateJWT(token: string) {
   try {
      const secret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
      const { payload } = await jwtVerify(token, secret);
      return payload; //validate the user token and return the user payload
   } catch (error) {
      console.error('Invalid token', error); //TODO: add the response error not the console.error
      return false;
   }
}
