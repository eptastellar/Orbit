type Props = {
   color?: string
   height: number
}

const PlayCircle = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={height}
      height={height}
      viewBox="0 0 200 200"
      className={color ?? "fill-current"}
   >
      <path
         d="M100 0a100 100 0 1 0 100 100A100.108 100.108 0 0 0 100 0Zm0 184.615A84.613 84.613 0 0 1 17.01 83.492 84.616 84.616 0 0 1 184.615 100 84.708 84.708 0 0 1 100 184.615Zm35.038-91.019-46.153-30.77a7.692 7.692 0 0 0-11.962 6.405v61.538a7.69 7.69 0 0 0 11.962 6.404l46.153-30.769a7.686 7.686 0 0 0 2.519-10.036 7.68 7.68 0 0 0-2.519-2.772Zm-42.73 22.798v-32.74L116.904 100l-24.596 16.394Z"
      />
   </svg>
)
export default PlayCircle
