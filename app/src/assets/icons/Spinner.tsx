type Props = {
   color?: string
   height: number
}

const Spinner = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={height}
      height={height}
      viewBox="0 0 200 200"
      className={`${color ?? "fill-current"} animate-spin`}
   >
      <path
         clipRule="evenodd"
         fillRule="evenodd"
         opacity={0.2}
         d="M100 170c38.66 0 70-31.34 70-70s-31.34-70-70-70-70 31.34-70 70 31.34 70 70 70Zm0 30c55.228 0 100-44.772 100-100S155.228 0 100 0 0 44.772 0 100s44.772 100 100 100Z"
      />
      <path
         d="M0 100C0 44.772 44.772 0 100 0v30c-38.66 0-70 31.34-70 70H0Z"
      />
   </svg>
)
export default Spinner
