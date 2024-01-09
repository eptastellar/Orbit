type Props = {
   btnType: "ring" | "transparent" | "white"
   image?: string
   text: string
   onClick: () => void
}

const WelcomeButton = ({ btnType, image, text, onClick }: Props) => (
   <div
      className={`flex gap-2 center w-full p-3 rounded-md cursor-pointer ${btnType === "ring" ? "ring-inset ring-2 ring-blue-5" : btnType === "transparent" ? "" : "bg-white"}`}
      onClick={onClick}
   >
      {image && <img src={image} alt="Icon" height={28} width={28} />}
      <p className={`text-center text-xl ${btnType !== "transparent" ? "font-bold" : ""} ${btnType === "white" ? " text-black" : " text-white"}`}>
         {text}
      </p>
   </div>
)

export default WelcomeButton
