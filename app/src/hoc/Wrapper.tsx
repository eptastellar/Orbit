type Props = {
   children: JSX.Element
}

const Wrapper = ({ children }: Props) => function Wrapper() {
   return (
      <div className="h-screen w-screen bg-black">
         <div className="relative m-auto h-full max-w-[500px]">
            {children}
         </div>
      </div>
   )
}

export default Wrapper
