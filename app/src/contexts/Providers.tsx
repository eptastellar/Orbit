import { AuthProvider } from "./AuthContext"

const Providers = ({ children }: { children: React.ReactNode }) => (
   <AuthProvider>
      {children}
   </AuthProvider>
)

export default Providers
