import { IconButton, PaperPlane, Supernova } from "@/assets/icons"

const Header = () => (
   <div className="flex flex-row between gap-4 w-full px-8 py-4 text-white border-b border-gray-7">
      <p className="text-2xl leading-6 font-semibold">
         Orbit
      </p>

      <div className="flex flex-row gap-8">
         <IconButton
            icon={<Supernova height={24} />}
            href="/supernova"
         />
         <IconButton
            icon={<PaperPlane height={24} />}
            onClick={() => alert("Chats coming soon...")} // "/chats"
         />
      </div>
   </div>
)

export default Header
