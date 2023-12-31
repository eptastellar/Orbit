import { Wrapper } from "@/hoc"

const Home = () => (
   <div>Home</div>
)

export default Wrapper({ children: <Home />, needsAuth: true })
