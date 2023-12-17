import { compare, genSalt, hash } from "bcrypt-ts";

export async function encrypt(input: string): Promise<string> {
   const WORK_FACTOR = Number(process.env.WORK_FACTOR)
   const salt = await genSalt(WORK_FACTOR);
   return await hash(input, salt);
}

export async function analyze(input: string, hashedInput: string): Promise<boolean> {
   return await compare(input, hashedInput);
}


// return Promise.all([encrypt(email), encrypt(password)])
//    .then(async ([hashedEmail, hashedPassword]) => {
//    })
//    .catch(error => {
//       console.error(error);
//    });
