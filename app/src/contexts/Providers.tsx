"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { AuthProvider } from "./AuthContext"
import { UserProvider } from "./UserContext"

const Providers = ({ children }: { children: React.ReactNode }) => {
   const queryClient = new QueryClient()

   return (
      <QueryClientProvider client={queryClient}>
         <AuthProvider>
            <UserProvider>
               {children}
            </UserProvider>
         </AuthProvider>
      </QueryClientProvider>
   )
}

export default Providers
