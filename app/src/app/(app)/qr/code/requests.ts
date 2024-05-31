import { ServerError } from "@/types"

type ReturnType = {
   qrCode: string
   expireTime: number
}

export const generateQrCode = async (sessionToken: string): Promise<ReturnType> => {
   const requestParams: RequestInit = {
      method: "GET",
      headers: { "Authorization": "Bearer " + sessionToken }
   }

   type ResponseType = {
      message?: ServerError
      random_code: string
      expire_time: number
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/qr`, requestParams)
   const { message: error, ...result }: ResponseType = await response.json()

   if (!error) return {
      qrCode: result.random_code,
      expireTime: result.expire_time
   }

   throw new Error(error)
}
