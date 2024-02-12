import SpinnerText from "./SpinnerText"

const LoadingOverlay = () => (
   <div className="fixed top-0 left-0 flex center h-screen w-screen bg-black z-50">
      <SpinnerText message="Loading..." />
   </div>
)

export default LoadingOverlay
