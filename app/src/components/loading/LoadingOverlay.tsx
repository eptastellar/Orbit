import SpinnerText from "./SpinnerText"

const LoadingOverlay = () => (
   <div className="flex center h-screen w-screen bg-black z-50">
      <SpinnerText message="Loading..." />
   </div>
)

export default LoadingOverlay
