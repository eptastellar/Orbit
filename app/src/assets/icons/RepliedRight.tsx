type Props = {
   color?: string
   height: number
}

const RepliedRight = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.ceil(height * (200 / 155))}
      height={height}
      viewBox="0 0 200 155"
      className={color ?? "fill-current"}
   >
      <path
         d="m196.737 107.844-44.442 44.283a11.148 11.148 0 0 1-7.869 3.248 11.148 11.148 0 0 1-7.87-3.248 11.068 11.068 0 0 1-3.26-7.842c0-2.941 1.172-5.762 3.26-7.842l25.47-25.361H99.993c-26.51-.029-51.927-10.536-70.673-29.215C10.574 63.187.03 37.862 0 11.446a11.05 11.05 0 0 1 3.254-7.828A11.13 11.13 0 0 1 11.11.375a11.13 11.13 0 0 1 7.857 3.243 11.05 11.05 0 0 1 3.254 7.828 77.438 77.438 0 0 0 22.803 54.773c14.58 14.528 34.35 22.7 54.97 22.722h62.032l-25.48-25.38a11.07 11.07 0 0 1-3.259-7.842 11.07 11.07 0 0 1 3.259-7.841 11.151 11.151 0 0 1 7.87-3.249 11.15 11.15 0 0 1 7.87 3.249l44.442 44.282A11.064 11.064 0 0 1 200 100c.001 1.457-.287 2.9-.847 4.246a11.07 11.07 0 0 1-2.416 3.598Z"
      />
   </svg>
)
export default RepliedRight
