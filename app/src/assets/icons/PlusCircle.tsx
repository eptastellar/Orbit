type Props = {
   color?: string
   height: number
   fill: boolean
}

const PlusCircle = ({ color, height, fill }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={height}
      height={height}
      viewBox="0 0 200 200"
      className={color ?? "fill-current"}
   >
      {fill
         ? <path
            d="M100 0a100 100 0 1 0 100 100A100.123 100.123 0 0 0 100 0Zm38.462 107.692h-30.77v30.77a7.69 7.69 0 0 1-13.131 5.439 7.693 7.693 0 0 1-2.253-5.439v-30.77h-30.77A7.69 7.69 0 0 1 56.1 94.561a7.692 7.692 0 0 1 5.44-2.253h30.769v-30.77a7.693 7.693 0 0 1 15.384 0v30.77h30.77a7.693 7.693 0 0 1 0 15.384Z"
         /> : <path
            d="M100 0a100 100 0 1 0 100 100A100.11 100.11 0 0 0 100 0Zm0 177.778a77.78 77.78 0 0 1-76.283-92.952A77.778 77.778 0 0 1 177.778 100 77.864 77.864 0 0 1 100 177.778ZM148.148 100a11.11 11.11 0 0 1-11.111 11.111h-25.926v25.926c0 2.947-1.171 5.773-3.254 7.857a11.115 11.115 0 0 1-15.714 0 11.112 11.112 0 0 1-3.254-7.857v-25.926H62.963A11.114 11.114 0 0 1 51.852 100a11.111 11.111 0 0 1 11.111-11.111h25.926V62.963a11.11 11.11 0 1 1 22.222 0v25.926h25.926A11.112 11.112 0 0 1 148.148 100Z"
         />
      }
   </svg>
)
export default PlusCircle