type Props = {
   color?: string
   height: number
}

const CaretDown = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.ceil(height * (200 / 115))}
      height={height}
      viewBox="0 0 200 115"
      className={color ?? "fill-current"}
   >
      <path
         d="m196.153 22.69-86.928 88.409a13.01 13.01 0 0 1-4.236 2.887 12.851 12.851 0 0 1-5 1.014c-1.716 0-3.415-.345-5-1.014a13.013 13.013 0 0 1-4.236-2.887L3.826 22.689A13.4 13.4 0 0 1 0 13.296a13.4 13.4 0 0 1 3.826-9.394 12.952 12.952 0 0 1 9.236-3.89c3.464 0 6.786 1.399 9.236 3.89L100 82.93 177.702 3.89A12.953 12.953 0 0 1 186.938 0c3.464 0 6.787 1.4 9.236 3.891A13.399 13.399 0 0 1 200 13.285c0 3.523-1.376 6.902-3.826 9.393l-.021.011Z"
      />
   </svg>
)
export default CaretDown
