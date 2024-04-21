"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { notifications } from "@/assets"
import { Cross, IconButton } from "@/assets/icons"
import { FilterButton, HeaderWithButton, InfiniteLoader, Navbar, Notification } from "@/components"
import { useUserContext } from "@/contexts"
import { resolveServerError } from "@/libraries/errors"
import { Notification as NotificationType } from "@/types"

import { fetchNotifications } from "./requests"

type Filter = "all" | "comments" | "followed"

const Notifications = () => {
   // Context hooks
   const { userProfile } = useUserContext()

   // Next router for navigation
   const router = useRouter()

   // Interaction states
   const [filter, setFilter] = useState<Filter>("all")

   const filterNotifications = (filter: Filter) => {
      // TODO: Implement filter logic
      setFilter(filter)
   }

   // Async query loading/error states
   const {
      data: fetchedNotificationsPages,
      error: notificationsError,
      fetchNextPage: fetchNextNotifications,
      hasNextPage: hasNextNotifications
   } = useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
         fetchNotifications(pageParam, userProfile?.sessionToken!),

      retry: false,

      initialPageParam: undefined,
      getNextPageParam: (prev) => prev.lastNotificationId
   })

   const fetchedNotifications: NotificationType[] | undefined = fetchedNotificationsPages?.pages
      .flatMap((page) => page.notifications.flatMap((notification) => notification))

   useEffect(() => {
      if (notificationsError) toast.error(resolveServerError(notificationsError.message))
   }, [notificationsError])

   return (
      <div className="flex flex-col center h-full w-full">
         <HeaderWithButton
            title="Notifications"
            icon={
               <IconButton
                  icon={<Cross height={24} />}
                  onClick={() => router.back()}
               />
            }
         />

         <div className="flex flex-grow flex-col items-center w-full overflow-scroll">
            <div className="flex flex-row start gap-2 w-full p-8 overflow-x-scroll">
               <FilterButton
                  title="All"
                  selected={filter === "all"}
                  onClick={() => filterNotifications("all")}
               />
               <FilterButton
                  title="Comments"
                  selected={filter === "comments"}
                  onClick={() => filterNotifications("comments")}
               />
               <FilterButton
                  title="Followed"
                  selected={filter === "followed"}
                  onClick={() => filterNotifications("followed")}
               />
            </div>

            <div className="flex flex-grow flex-col items-center w-full p-8 pt-0 overflow-scroll">
               {fetchedNotifications ?
                  fetchedNotifications.length > 0
                     // There are some notifications to be shown
                     ? <div className="flex flex-col start gap-4 w-full">
                        {fetchedNotifications.map((notification) =>
                           <Notification key={notification.id} notification={notification} />
                        )}
                        {hasNextNotifications
                           ? <InfiniteLoader onScreen={fetchNextNotifications} />
                           : <p className="mt-2 text-base font-semibold text-white">You're all caught up!</p>
                        }
                     </div>
                     // There are no notifications to be shown
                     : <div className="flex flex-col flex-grow center w-full">
                        <Image
                           src={notifications}
                           alt="There are no notifications to display"
                           className="w-2/3"
                        />
                        <p className="mt-4 text-center text-base font-semibold text-white">
                           You don't have any notification yet.
                        </p>
                     </div>
                  // The notifications are still being fetched
                  : <div className="flex flex-col start gap-4 w-full">
                     {Array.from(Array(10).keys()).map((index) =>
                        <div
                           key={`notification-${index}`}
                           className="h-16 w-full loader-pulse rounded-md"
                           style={{ animationDelay: `${index * 0.15}s` }}
                        />
                     )}
                  </div>
               }
            </div>
         </div>

         <Navbar />
      </div>
   )
}

export default Notifications
