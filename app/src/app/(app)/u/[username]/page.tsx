"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { profile } from "@/assets"
import { Gear, IconButton, ThreeDotsVertical } from "@/assets/icons"
import { HeaderWithButton, InfiniteLoader, InterestButton, Navbar, Post } from "@/components"
import { useUserContext } from "@/contexts"
import { Post as PostType } from "@/types"

import { fetchPosts, fetchProfile } from "./requests"

type Props = {
   params: {
      username: string
   }
}

const User = ({ params }: Props) => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Dynamic route parameters
   const username = decodeURIComponent(params.username)

   const { data: fetchedUser, error: profileError } = useQuery({
      queryKey: ["user", username],
      queryFn: () => fetchProfile(username, userProfile?.sessionToken)
   })

   const {
      data: fetchedPostPages,
      error: postsError,
      fetchNextPage: fetchNextPosts,
      hasNextPage: hasNextPosts
   } = useInfiniteQuery({
      queryKey: ["user", "posts", username],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
         fetchPosts(username, pageParam, userProfile?.sessionToken),

      initialPageParam: undefined,
      getNextPageParam: (prev) => prev.lastPostId
   })

   const fetchedPosts: PostType[] | undefined = fetchedPostPages?.pages
      .flatMap((page) => page.posts.flatMap((post) => post))

   useEffect(() => {
      if (profileError) console.error(profileError)
      if (postsError) console.error(postsError)
   }, [profileError, postsError])

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            icon={fetchedUser?.isPersonal ?? userProfile!.username === username
               ? <IconButton
                  icon={<Gear height={24} />}
                  onClick={() => router.push("/settings")}
               />
               : <IconButton
                  icon={<ThreeDotsVertical height={24} />}
                  onClick={() => router.push("/chats")}
               />
            }
         />

         <div className="flex flex-grow flex-col items-center w-full p-8 overflow-scroll">
            {
               fetchedUser?.isPersonal ?? userProfile!.username === username
                  // The visited page is the user itself
                  ? <div className="relative min-h-32 max-h-32 min-w-32 max-w-32 rounded-full overflow-hidden">
                     <Image
                        src={fetchedUser?.profilePicture ?? userProfile!.profilePicture}
                        alt="Profile picture"
                        fill className="object-cover"
                     />
                  </div>
                  : fetchedUser
                     // The visited page is not the user
                     ? <div className="relative min-h-32 max-h-32 min-w-32 max-w-32 rounded-full overflow-hidden">
                        <Image
                           src={fetchedUser?.profilePicture}
                           alt="Profile picture"
                           fill className="object-cover"
                        />
                     </div>
                     // The image is still being fetched
                     : <div className="min-h-32 max-h-32 min-w-32 max-w-32 loader-pulse rounded-full" />
            }


            <div className="flex flex-col center mt-8">
               {fetchedUser?.displayName
                  ? <p className="text-2xl font-semibold text-white">{fetchedUser.displayName}</p>
                  : <div className="h-6 w-48 my-1 loader-pulse rounded-md" />
               }

               <p className="text-base font-semibold text-gray-3">{username}</p>
            </div>

            <div className="flex flex-col center w-full mt-6 bg-gray-7/50 border border-gray-7 rounded-md">
               <div className="flex flex-row center w-full py-4 border-b border-gray-7">
                  <div className="flex flex-col center w-1/3">
                     {fetchedUser?.counters.postCount !== undefined ?
                        <p className="text-xl font-semibold text-white">
                           {fetchedUser.counters.postCount}
                        </p>
                        : <div className="h-5 w-2/3 my-1 loader-pulse rounded-md" />
                     }
                     <p className="text-base font-semibold text-gray-3">POSTS</p>
                  </div>
                  <div className="flex flex-col center w-1/3 border-x border-gray-7">
                     {fetchedUser?.counters.friendCount !== undefined ?
                        <p className="text-xl font-semibold text-white">
                           {fetchedUser.counters.friendCount}
                        </p>
                        : <div className="h-5 w-2/3 my-1 loader-pulse rounded-md" />
                     }
                     <p className="text-base font-semibold text-gray-3">FRIENDS</p>
                  </div>
                  <div className="flex flex-col center w-1/3">
                     {fetchedUser?.counters.meteorCount !== undefined ?
                        <p className="text-xl font-semibold text-white">
                           {fetchedUser.counters.meteorCount}
                        </p>
                        : <div className="h-5 w-2/3 my-1 loader-pulse rounded-md" />
                     }
                     <p className="text-base font-semibold text-gray-3">METEORS</p>
                  </div>
               </div>
               <div className="flex flex-row gap-2 items-center justify-start w-full p-4 overflow-x-scroll">
                  {fetchedUser?.interests ?
                     fetchedUser.interests.map((interest) => <InterestButton key={interest} interest={interest} />)
                     : ["w-1/4", "w-1/2", "w-1/3"].map((width) =>
                        <div key={`interest-${width}`} className={`h-6 ${width} loader-pulse rounded-full`} />
                     )
                  }
               </div>
            </div>

            {fetchedUser && fetchedPosts ?
               fetchedPosts.length > 0
                  // The user has posted something
                  ? <div className="flex flex-col gap-4 items-center justify-start w-full mt-6">
                     {fetchedPosts.map((post) => <Post key={post.id} post={post} />)}
                     {hasNextPosts
                        ? <InfiniteLoader onScreen={fetchNextPosts} />
                        : <p className="mt-2 text-base font-semibold text-white">You're all caught up!</p>
                     }
                  </div>
                  // The user has not posted anything
                  : <div className="flex flex-col flex-grow center w-full mt-6">
                     <Image
                        src={profile}
                        alt="User has no posts to display"
                        className="w-2/3"
                     />
                     <p className="mt-4 text-center text-base font-semibold text-white">
                        {fetchedUser?.isPersonal
                           ? "You haven't posted anything yet."
                           : "This user hasn't posted anything yet."
                        }
                     </p>
                  </div>
               // The posts are still being fetched
               : <div className="flex flex-col gap-4 items-center justify-start w-full mt-6">
                  {["h-28", "h-40", "h-20"].map((height, index) =>
                     <div
                        key={`post-${height}`}
                        className={`${height} w-full loader-pulse rounded-md`}
                        style={{ animationDelay: `${index * 0.15}s` }}
                     />
                  )}
               </div>
            }
         </div>

         <Navbar />
      </div>
   )
}

export default User
