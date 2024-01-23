"use client"

import { useEffect, useState } from "react"
import ConfettiExplosion, { ConfettiProps } from "react-confetti-explosion"

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
   const [deviceWidth, setDeviceWidth] = useState<number>(0)
   const confetti = false // TODO: Uncomment once it gets support for Next 14
   // const [confetti] = useState<boolean>(localStorage.getItem("confetti") ? true : false)
   // if (confetti) localStorage.removeItem("confetti")

   useEffect(() => {
      setDeviceWidth(window.innerWidth)
      setLoading(false)
   }, [])

   const config: ConfettiProps = {
      particleCount: 150,
      particleSize: 14,
      duration: 3200,
      force: 0.7,
      width: deviceWidth + parseInt((deviceWidth / 10).toFixed(0))
   }

   return !loading && (
      <div className="relative flex center h-full w-full">
         <p className="text-white">User: {username}</p>

         {confetti && (<>
            <div id="confetti-left" className="absolute top-[40%] left-0"><ConfettiExplosion {...config} /></div>
            <div id="confetti-right" className="absolute top-[40%] right-0"><ConfettiExplosion {...config} /></div>
         </>)}
      </div>
   )
}

export default User
