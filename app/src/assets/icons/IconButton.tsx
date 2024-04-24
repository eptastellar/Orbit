"use client"

import Link from "next/link"

type Props = {
   icon: JSX.Element
} & ({
   href?: undefined
   onClick?: (event: React.PointerEvent<HTMLDivElement>) => void
} | {
   href: string
   onClick?: (event: React.PointerEvent<HTMLAnchorElement>) => void
})

const IconButton = ({ icon, href, onClick }: Props) => (
   href !== undefined ? (
      <Link href={href} onClick={onClick}>
         {icon}
      </Link>
   ) : (
      <div className="cursor-pointer" onClick={onClick}>
         {icon}
      </div>
   )
)

export default IconButton
