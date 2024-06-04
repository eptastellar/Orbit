import { MetadataRoute } from "next"

const manifest = (): MetadataRoute.Manifest => ({
   name: "Orbit",
   short_name: "Orbit",
   description: "The new way to connect.",
   start_url: "/",
   display: "standalone",
   icons: [
      {
         src: "/icon.png",
         sizes: "256x256",
         type: "image/png",
      },
   ],
})

export default manifest
 