type Props = {
   color?: string
   height: number
}

const Trash = ({ color, height }: Props) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.ceil(height * (180 / 200))}
      height={height}
      viewBox="0 0 180 200"
      className={color ?? "fill-current"}
   >
      <path
         d="M169.2 36.364h-32.4v-10.91c0-6.75-2.655-13.225-7.381-17.999A25.074 25.074 0 0 0 111.6 0H68.4a25.073 25.073 0 0 0-17.82 7.455 25.586 25.586 0 0 0-7.38 18v10.909H10.8c-2.864 0-5.611 1.149-7.637 3.195A10.965 10.965 0 0 0 0 47.273c0 2.893 1.138 5.668 3.163 7.714a10.745 10.745 0 0 0 7.637 3.195h3.6v123.636c0 4.822 1.896 9.447 5.272 12.857A17.912 17.912 0 0 0 32.4 200h115.2c4.774 0 9.352-1.916 12.728-5.325a18.276 18.276 0 0 0 5.272-12.857V58.182h3.6c2.864 0 5.611-1.15 7.637-3.195A10.967 10.967 0 0 0 180 47.273c0-2.894-1.138-5.668-3.163-7.714a10.748 10.748 0 0 0-7.637-3.195ZM64.8 25.454c0-.964.38-1.889 1.054-2.57a3.582 3.582 0 0 1 2.546-1.066h43.2c.955 0 1.87.383 2.546 1.065a3.655 3.655 0 0 1 1.054 2.572v10.909H64.8v-10.91ZM144 178.183H36v-120h108v120Zm-64.8-90.91v58.183c0 2.893-1.138 5.668-3.163 7.713a10.746 10.746 0 0 1-7.637 3.196c-2.864 0-5.611-1.15-7.637-3.196a10.962 10.962 0 0 1-3.163-7.713V87.273c0-2.894 1.138-5.668 3.163-7.714a10.746 10.746 0 0 1 7.637-3.195c2.864 0 5.611 1.149 7.637 3.195a10.966 10.966 0 0 1 3.163 7.714Zm43.2 0v58.183c0 2.893-1.138 5.668-3.163 7.713a10.748 10.748 0 0 1-7.637 3.196c-2.864 0-5.611-1.15-7.637-3.196a10.964 10.964 0 0 1-3.163-7.713V87.273c0-2.894 1.138-5.668 3.163-7.714a10.748 10.748 0 0 1 7.637-3.195c2.864 0 5.611 1.149 7.637 3.195a10.967 10.967 0 0 1 3.163 7.714Z"
      />
   </svg>
)
export default Trash
