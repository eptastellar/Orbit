import { Notification } from "@/types"

// TODO: Implement notifications fetching
export const fetchNotifications = async (
   reqLastNotificationId: string | undefined,
   sessionToken: string
): Promise<{ notifications: Notification[], lastNotificationId: string | undefined }> => {
   // NOTE: This is a temporary fake fetch request to simulate the fetch time
   await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interests`, { method: "GET" })

   return {
      notifications: [],
      lastNotificationId: undefined
   }
}
