type Props = {
   color?: string
   height: number
}

const ThreeDotsVertical = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.ceil(height * (39 / 200))}
      height={height}
      viewBox="0 0 39 200"
      className={color ?? "fill-current"}
   >
      <path
         d="M0 19.048a19.048 19.048 0 1 1 38.095 0 19.048 19.048 0 0 1-38.095 0Zm19.048 61.904a19.047 19.047 0 1 0 0 38.095 19.047 19.047 0 0 0 0-38.095Zm0 80.953a19.047 19.047 0 1 0 0 38.095 19.047 19.047 0 0 0 0-38.095Z"
      />
   </svg>
)
export default ThreeDotsVertical
