type Props = {
   color?: string
   height: number
}

const PaperPlaneUp = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.ceil(height * (200 / 180))}
      height={height}
      viewBox="0 0 200 180"
      className={color ?? "fill-current"}
   >
      <path
         d="m197.788 154.21-.052-.078L114.91 8.79a17.268 17.268 0 0 0-6.322-6.432 17.194 17.194 0 0 0-17.379 0 17.278 17.278 0 0 0-6.322 6.432L2.2 154.21a17.36 17.36 0 0 0 1.839 19.59 17.231 17.231 0 0 0 8.644 5.561 17.18 17.18 0 0 0 10.262-.356l77.049-26.119 77.049 26.119a17.18 17.18 0 0 0 5.768.995 17.203 17.203 0 0 0 8.56-2.315 17.284 17.284 0 0 0 6.283-6.277 17.361 17.361 0 0 0 .134-17.198Zm-87.447-19.741V86.532c0-2.754-1.091-5.395-3.031-7.343a10.326 10.326 0 0 0-7.316-3.042 10.327 10.327 0 0 0-7.317 3.042 10.405 10.405 0 0 0-3.03 7.343v47.937l-64.909 22.008 75.16-132.204 75.334 132.196-64.891-22Z"
      />
   </svg>
)
export default PaperPlaneUp
