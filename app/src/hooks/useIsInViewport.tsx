import { RefObject, useEffect, useMemo, useState } from "react"

function useIsInViewport(ref: RefObject<HTMLElement>) {
   const [inViewport, setInViewport] = useState<boolean>(false)

   const observer = useMemo(
      () => new IntersectionObserver(([entry]) =>
         setInViewport(entry.isIntersecting)
      ), []
   )

   useEffect(() => {
      observer.observe(ref.current!)
      return () => observer.disconnect()
   }, [ref, observer])

   return inViewport
}

export default useIsInViewport
