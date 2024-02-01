import { useEffect, useState } from "react"

type Return<T> = [T, React.Dispatch<React.SetStateAction<T>>]

function useLocalStorage<T>(key: string, initialValue: T): Return<T> {
   const [state, setState] = useState<T>(initialValue)

   useEffect(() => {
      try {
         const value = window.localStorage.getItem(key)
         setState(value ? JSON.parse(value) : initialValue)
      } catch (error) { console.log(error) }
   }, [])

   const setValue = (value: T | ((prevState: T) => T)) => {
      try {
         const valueToStore = value instanceof Function ? value(state) : value
         window.localStorage.setItem(key, JSON.stringify(valueToStore))
         setState(valueToStore)
      } catch (error) { console.log(error) }
   }

   return [state, setValue]
}

export default useLocalStorage
