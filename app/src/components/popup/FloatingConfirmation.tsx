type Props = {
   title: string
   text: string
   actionText: string
   actionColor?: string
   action: () => void
   closePopup: () => void
}

const FloatingConfirmation = ({ title, text, actionText, actionColor, action, closePopup }: Props) => {
   return (
      <div className="fixed flex center h-screen w-screen bg-black/50">
         <div className="flex flex-col center gap-4 w-2/3 py-4 bg-gray-7 rounded-xl">
            <p className="text-xl font-semibold text-white px-6">{title}</p>
            <p className="text-center text-base font-medium text-gray-5 px-6">{text}</p>

            <div className="flex flex-row w-full">
               <div className="w-1/2 border-r border-gray-5" onClick={closePopup}>
                  <p className="text-center text-base font-semibold text-gray-5">
                     Cancel
                  </p>
               </div>
               <div className="w-1/2" onClick={action}>
                  <p className={`text-center text-base font-semibold ${actionColor ? actionColor : "text-blue-5"}`}>
                     {actionText}
                  </p>
               </div>
            </div>
         </div>
      </div>
   )
}

export default FloatingConfirmation
