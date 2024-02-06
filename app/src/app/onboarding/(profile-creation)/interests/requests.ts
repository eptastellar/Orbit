export const fetchInterests = async (): Promise<string[]> => {
   const requestParams: RequestInit = { method: "GET" }

   type ResponseType = { interests: string[] }

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interests`, requestParams)
   const { interests }: ResponseType = await response.json()

   return interests
}
