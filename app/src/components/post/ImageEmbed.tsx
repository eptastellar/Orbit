import Image from "next/image"

type Props = {
   src: string
}

const ImageEmbed = ({ src }: Props) => (
   <div className="relative w-full mt-4 rounded-md overflow-hidden">
      <Image src={src} alt="Post image" height={1024} width={512} />
   </div>
)

export default ImageEmbed
