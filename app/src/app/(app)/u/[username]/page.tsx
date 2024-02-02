"use client"

import { useEffect, useState } from "react"

type Props = {
   params: {
      username: string
   }
}

const User = ({ params }: Props) => {
   // Dynamic route parameters
   const username = decodeURIComponent(params.username)

   // Fetching and async states
   const [loading, setLoading] = useState<boolean>(true)

   // Interaction states

   useEffect(() => {
      setLoading(false)
   }, [])

   return !loading && (
      <div className="relative flex center h-full w-full">
         <p className="text-white">User: {username}</p>

      </div>
   )
}

export default User
