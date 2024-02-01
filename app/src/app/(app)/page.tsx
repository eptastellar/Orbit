import { Header, Navbar } from "@/components"

const Homepage = () => (
   <div className="flex flex-col center h-full w-full">
      <Header />

      <div className="flex flex-grow flex-col items-center w-full p-8 overflow-scroll">
         <p className="text-white">Homepage</p>
      </div>

      <Navbar />
   </div>
)

export default Homepage
