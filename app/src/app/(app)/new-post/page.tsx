"use client"

import { randomBytes } from "crypto"
import { StorageReference, deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { Cross, IconButton, Images, Microphone, Trash } from "@/assets/icons"
import { AudioEmbed, HeaderWithButton, ImageEmbed, SpinnerText } from "@/components"
import { useUserContext } from "@/contexts"
import { resolveFirebaseError, resolveServerError } from "@/libraries/errors"
import { storage } from "@/libraries/firebase"
import { MediaType, ServerError } from "@/types"

type Content = {
   type: undefined
   data: undefined
   url: undefined
} | {
   type: MediaType
   data: string
   url: string
}

const NewPost = () => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Fetching and async states
   const [deleting, setDeleting] = useState<boolean>(false)
   const [posting, setPosting] = useState<boolean>(false)
   const [uploading, setUploading] = useState<boolean>(false)
   const [uploadProgress, setUploadProgress] = useState<number>(0)

   // Interaction states
   const [content, setContent] = useState<Content>({ type: undefined, data: undefined, url: undefined })
   const [dbRef] = useState<StorageReference>(ref(storage, `uploads/posts/${randomBytes(16).toString("hex")}`))
   const [text, setText] = useState<string>("")

   // Update the current time every second
   const [currentTime, setCurrentTime] = useState<string>(
      new Date().toLocaleString("en-US").replace(", ", " · ")
   )

   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentTime(new Date().toLocaleString("en-US").replace(", ", " · "))
      }, 1000)

      return () => clearInterval(interval)
   }, [])

   // Custom functions triggered by interactions
   const deleteMedia = () => {
      if (!deleting && content.data) {
         setDeleting(true)

         deleteObject(dbRef)
            .then(() => setContent({ type: undefined, data: undefined, url: undefined }))
            .catch((error: Error) => toast.error(resolveFirebaseError(error.message)))
            .finally(() => setDeleting(false))
      }
   }

   const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
      if (!uploading) {
         const file = event.target.files ? event.target.files[0] : null

         if (file && (
            (type === "audio" && ["audio/mp3", "audio/wav", "audio/x-m4a"].includes(file.type)) ||
            (type === "image" && ["image/gif", "image/jpeg", "image/png"].includes(file.type))
         )) {
            setUploading(true)

            // Create the upload task for the firebase upload
            const uploadTask = uploadBytesResumable(dbRef, file)

            uploadTask.on("state_changed",
               (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
               (error) => toast.error(resolveFirebaseError(error.message)),
               () => getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  setContent((prev) => ({
                     type: prev.type as MediaType,
                     data: prev.data as string,
                     url: downloadURL
                  }))
                  setUploading(false)
               })
            )

            // Read the media as a stream to avoid waiting for the upload
            const fileReader = new FileReader()

            fileReader.onload = (event) => setContent({
               type: type,
               data: event.target?.result as string,
               url: ""
            })

            fileReader.readAsDataURL(file)
         }
      }
   }

   const handlePost = async () => {
      if (!posting) {
         // Preliminary checks
         if (!text && !content.url)
            return toast.info("Please input some text or a media file.")

         // Send the post to the api endpoint
         setPosting(true)

         const requestBody = JSON.stringify({
            text: text ? text : undefined,
            type: content.type,
            content: content.url
         })

         const params: RequestInit = {
            method: "POST",
            headers: {
               "Authorization": "Bearer " + userProfile?.sessionToken!,
               "Content-Type": "application/json"
            },
            body: requestBody
         }

         type ResponseType = {
            error?: ServerError
            id: string
         }

         fetch(`${process.env.NEXT_PUBLIC_API_URL}/p`, params)
            .then((response) => response.json())
            .then(({ error, ...result }: ResponseType) => {
               if (!error) {
                  router.replace(`/p/${result.id}`)
               } else {
                  toast.error(resolveServerError(error))
                  setPosting(false)
               }
            })
      }
   }

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            title="New post"
            icon={
               <IconButton
                  icon={<Cross height={24} />}
                  href="/"
                  onClick={() => deleteMedia()}
               />
            }
         />

         <div className="flex flex-grow flex-col items-center w-full p-8 overflow-scroll">
            <div className="flex flex-col items-start justify-center w-full p-4 bg-gray-7/50 rounded-md">
               <div className="flex center gap-3 mb-4 cursor-pointer">
                  <div className="relative min-h-10 max-h-10 min-w-10 max-w-10 rounded-full overflow-hidden">
                     <Image
                        src={userProfile?.userData.profilePicture!}
                        alt="Profile picture"
                        fill className="object-cover"
                     />
                  </div>

                  <div className="flex flex-col items-start justify-center">
                     <p className="text-base font-semibold text-white">{userProfile?.userData.displayName}</p>
                     <p className="text-xs font-semibold text-gray-3">{userProfile?.userData.username}</p>
                  </div>
               </div>

               <textarea
                  rows={4}
                  placeholder="Describe your thoughts..."
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  className="w-full px-4 py-2 text-white placeholder-gray-3 ring-inset ring-1 ring-gray-5 bg-gray-7 rounded-md resize-none"
               />

               {!uploading && !content.data && <div className="flex flex-row gap-4 w-full mt-4">
                  <label className="flex center w-full py-4 text-white ring-1 ring-inset ring-blue-5 rounded-md cursor-pointer">
                     <Images height={16} />
                     <input
                        type="file"
                        accept="image/gif, image/jpeg, image/png"
                        onChange={(event) => handleMediaUpload(event, "image")}
                        disabled={uploading}
                        hidden
                     />
                  </label>
                  <label className="flex center w-full py-4 text-white ring-1 ring-inset ring-blue-5 rounded-md cursor-pointer">
                     <Microphone height={16} />
                     <input
                        type="file"
                        accept="audio/mp3, audio/x-m4a, audio/wav"
                        onChange={(event) => handleMediaUpload(event, "audio")}
                        disabled={uploading}
                        hidden
                     />
                  </label>
               </div>}

               {uploading && <div
                  className="h-2 w-full mt-4 rounded-full transition-all duration-500"
                  style={{ background: `linear-gradient(to right, #1D5C96 0%, #1D5C96 ${Math.floor(uploadProgress)}%, #585858 ${Math.floor(uploadProgress)}%)` }}
               />}

               {!uploading && content.type === "audio" && <AudioEmbed src={content.data} />}
               {!uploading && content.type === "image" && <ImageEmbed src={content.data} />}

               {!uploading && content.data &&
                  <div
                     className="flex flex-row center gap-2 w-full mt-4 py-2 text-white ring-1 ring-inset ring-red-5 rounded-md cursor-pointer"
                     onClick={deleteMedia}
                  >
                     {deleting
                        ? <SpinnerText message="Deleting..." />
                        : <p className="flex flex-row center gap-2 text-white">
                           <Trash height={12} />
                           <span>Delete the {content.type}</span>
                        </p>
                     }
                  </div>
               }

               <p className="mt-2 text-xs font-normal text-gray-3">
                  {currentTime}
               </p>
            </div>
         </div>

         <div className="flex flex-row between gap-4 w-full px-8 py-4 text-white border-t border-gray-7">
            <p className="text-xs font-normal text-gray-5">Visible to your friends only!</p>

            <div
               className="min-w-fit px-6 py-1 bg-white rounded-full cursor-pointer"
               onClick={handlePost}
            >
               <p className="text-sm font-bold text-black">
                  {posting ? "Posting..." : "Post"}
               </p>
            </div>
         </div>
      </div>
   )
}

export default NewPost
