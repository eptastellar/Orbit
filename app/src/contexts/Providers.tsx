import { AuthProvider } from "./AuthContext"
import { UserProvider } from "./UserContext"

const Providers = ({ children }: { children: React.ReactNode }) => (
   <AuthProvider>
      <UserProvider>
         {children}
      </UserProvider>
   </AuthProvider>
)

export default Providers
