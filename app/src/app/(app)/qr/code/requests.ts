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
      error?: ServerError
      message: string
      expireTime: number
   }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/u/qr`, requestParams)
   const { error, ...result }: ResponseType = await response.json()

   if (!error) return {
      qrCode: result.message,
      expireTime: result.expireTime
   }

   throw new Error(error)
}
