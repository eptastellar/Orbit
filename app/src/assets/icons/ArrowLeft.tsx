type Props = {
   color?: string
   height: number
}

const ArrowLeft = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.ceil(height * (200 / 169))}
      height={height}
      viewBox="0 0 200 169"
      className={color ?? "fill-current"}
   >
      <path
         d="M200 84.007a11.997 11.997 0 0 1-11.999 12H41.007l51.518 51.507a12.018 12.018 0 0 1 0 16.999 12.022 12.022 0 0 1-17 0L3.53 92.516a12 12 0 0 1 0-16.999L75.526 3.521a12.02 12.02 0 0 1 17 16.999L41.007 72.007H188a11.997 11.997 0 0 1 11.999 12Z"
      />
   </svg>
)
export default ArrowLeft
