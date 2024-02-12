"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useEffect } from "react"

import { homeEmpty } from "@/assets"
import { Header, InfiniteLoader, Navbar, Post } from "@/components"
import { useUserContext } from "@/contexts"
import { Post as PostType } from "@/types"

import { fetchPosts } from "./requests"

const Homepage = () => {
   // Context hooks
   const { userProfile } = useUserContext()

   const {
      data: fetchedPostPages,
      error: postsError,
      fetchNextPage: fetchNextPosts,
      hasNextPage: hasNextPosts
   } = useInfiniteQuery({
      queryKey: ["homepage", "posts"],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
         fetchPosts(pageParam, userProfile?.sessionToken),

      initialPageParam: undefined,
      getNextPageParam: (prev) => prev.lastPostId
   })

   const fetchedPosts: PostType[] | undefined = fetchedPostPages?.pages
      .flatMap((page) => page.posts.flatMap((post) => post))

   useEffect(() => {
      if (postsError) console.error(postsError)
   }, [postsError])

   return (
      <div className="flex flex-col center h-full w-full">
         <Header />

         <div className="flex flex-grow flex-col items-center w-full p-8 overflow-scroll">
            {fetchedPosts ?
               fetchedPosts.length > 0
                  // There are some posts available in the homepage
                  ? <div className="flex flex-col gap-4 items-center justify-start w-full">
                     {fetchedPosts.map((post) => <Post key={post.id} post={post} />)}
                     {hasNextPosts
                        ? <InfiniteLoader onScreen={fetchNextPosts} />
                        : <p className="mt-2 text-base font-semibold text-white">You're all caught up!</p>
                     }
                  </div>
                  // There are no posts in the homepage
                  : <div className="flex flex-col flex-grow center w-full">
                     <Image
                        src={homeEmpty}
                        alt="Homepage has no posts to display"
                        className="w-2/3"
                     />
                     <p className="mt-4 text-center text-base font-semibold text-white">
                        Your friends haven't posted anything yet.
                     </p>
                  </div>
               // The posts are still being fetched
               : <div className="flex flex-col gap-4 items-center justify-start w-full">
                  {["h-32", "h-40", "h-20", "h-52", "h-16", "h-28"].map((height, index) =>
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

export default Homepage
