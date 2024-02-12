type Props = {
   color?: string
   height: number
}

const Comment = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={height}
      height={height}
      viewBox="0 0 200 200"
      className={color ?? "fill-current"}
   >
      <path
         d="M100 0A100.11 100.11 0 0 0 0 100v84.33A15.692 15.692 0 0 0 15.67 200H100a100.003 100.003 0 0 0 100-100A100.003 100.003 0 0 0 100 0Zm0 184H16v-84a84 84 0 1 1 84 84Zm12-80c0 2.373-.704 4.693-2.022 6.667a12.002 12.002 0 0 1-21.065-11.26A12 12 0 0 1 112 104Zm-44 0a12.003 12.003 0 0 1-7.408 11.087 12.002 12.002 0 0 1-15.679-15.68A12 12 0 0 1 68 104Zm88 0c0 2.373-.704 4.693-2.022 6.667A12.001 12.001 0 1 1 144 92a11.998 11.998 0 0 1 12 12Z"
      />
   </svg>
)
export default Comment
