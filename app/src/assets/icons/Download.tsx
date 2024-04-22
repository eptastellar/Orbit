type Props = {
   color?: string
   height: number
}

const Download = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={height}
      height={height}
      viewBox="0 0 200 200"
      className={color ?? "fill-current"}
   >
      <path
         d="M200 124v56a20 20 0 0 1-20 20H20a20 20 0 0 1-20-20v-56a11.998 11.998 0 0 1 12-12 11.998 11.998 0 0 1 12 12v52h152v-52c0-3.183 1.264-6.235 3.515-8.485a11.996 11.996 0 0 1 16.97 0A11.996 11.996 0 0 1 200 124Zm-108.49 8.49a12 12 0 0 0 17 0l40-40a12.022 12.022 0 0 0-8.5-20.52 12.02 12.02 0 0 0-8.5 3.52L112 95V12a11.998 11.998 0 0 0-12-12 12 12 0 0 0-12 12v83L68.49 75.51a12.02 12.02 0 0 0-17 17l40.02 39.98Z"
      />
   </svg>
)
export default Download
