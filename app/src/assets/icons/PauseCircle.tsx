type Props = {
   color?: string
   height: number
}

const PauseCircle = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={height}
      height={height}
      viewBox="0 0 200 200"
      className={color ?? "fill-current"}
   >
      <path
         d="M100 0a100 100 0 1 0 100 100A100.108 100.108 0 0 0 100 0Zm0 184.615A84.613 84.613 0 0 1 17.01 83.492 84.616 84.616 0 0 1 184.615 100 84.708 84.708 0 0 1 100 184.615ZM84.615 69.231v61.538a7.69 7.69 0 0 1-13.131 5.439 7.69 7.69 0 0 1-2.253-5.439V69.231a7.692 7.692 0 1 1 15.384 0Zm46.154 0v61.538a7.69 7.69 0 1 1-15.384 0V69.231a7.69 7.69 0 0 1 13.131-5.44 7.69 7.69 0 0 1 2.253 5.44Z"
      />
   </svg>
)
export default PauseCircle
