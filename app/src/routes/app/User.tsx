import { useState } from "react"
import ConfettiExplosion, { ConfettiProps } from "react-confetti-explosion"

import { Wrapper } from "@/hoc"

const User = () => {
   const [confetti] = useState<boolean>(localStorage.getItem("confetti") ? true : false)
   if (confetti) localStorage.removeItem("confetti")

   const deviceWidth = window.innerWidth

   const config: ConfettiProps = {
      particleCount: 150,
      particleSize: 14,
      duration: 3200,
      force: 0.7,
      width: deviceWidth + parseInt((deviceWidth / 10).toFixed(0))
   }

   return (
      <div className="relative h-screen w-screen">
         <p>User</p>

         {confetti && (<>
            <div id="confetti-left" className="absolute top-[40%] left-0"><ConfettiExplosion {...config} /></div>
            <div id="confetti-right" className="absolute top-[40%] right-0"><ConfettiExplosion {...config} /></div>
         </>)}
      </div>
   )
}

export default Wrapper({ children: <User /> })
