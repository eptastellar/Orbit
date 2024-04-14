"use client"

import { useEffect, useRef } from "react"

import { useIsInViewport } from "@/hooks"

type Props = {
   onScreen: () => void
}

const InfiniteLoader = ({ onScreen }: Props) => {
   const ref = useRef<HTMLDivElement>(null)
   const isVisible = useIsInViewport(ref)

   useEffect(() => {
      if (isVisible) onScreen()
   }, [isVisible])

   return (
      <div ref={ref} className="flex flex-row center gap-2 w-full mt-2">
         {[0, 1, 2].map((index) =>
            <div
               key={`bouncer-${index}`}
               className="h-4 w-4 loader-bounce rounded-full"
               style={{ animationDelay: `${index * 0.15}s` }}
            />
         )}
      </div>
   )
}

export default InfiniteLoader
