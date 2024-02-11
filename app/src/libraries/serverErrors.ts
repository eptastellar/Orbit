import { ServerError } from "@/types"

export const resolveServerError = (error: ServerError): string => {
   let resolvedError = ""

   // Authentication errors
   if (error === "auth/expired-token")
      resolvedError = "Session expired. Please log back in."
   else if (error === "auth/invalid-token")
      resolvedError = "Invalid session token."
   else if (error === "auth/email-unverified")
      resolvedError = "Email address not verified. Check your inbox."
   else if (error === "auth/user-not-signed-up")
      resolvedError = "Profile not yet created."
   else if (error === "auth/user-already-exists")
      resolvedError = "A profile has already been created with this account."
   // Validation errors
   else if (error === "validation/username-too-long")
      resolvedError = "Username must have 24 characters at most."
   else if (error === "validation/username-too-short")
      resolvedError = "Username must have at least 6 characters."
   else if (error === "validation/invalid-username")
      resolvedError = "Username must only contain letters, numbers or the following symbols [. - _]."
   else if (error === "validation/username-already-in-use")
      resolvedError = "Username already taken."
   else if (error === "validation/invalid-birthdate")
      resolvedError = "Invalid birthdate."
   else if (error === "validation/too-young")
      resolvedError = "You must be at least 14 to use Orbit."
   else if (error === "validation/invalid-number-of-interests")
      resolvedError = "Interests amount must be from 1 to 5."
   else if (error === "validation/invalid-interests")
      resolvedError = "Interests must be selected from the list."
   else if (error === "validation/invalid-document-id")
      resolvedError = "Provided invalid document id."
   else if (error === "validation/malformed-input")
      resolvedError = "Invalid body, the request was aborted."
   // Server errors
   else if (error === "server/no-content")
      resolvedError = "No content for the requested resource."
   else if (error === "server/no-friends")
      resolvedError = "The requested user has no friends to fetch."
   else resolvedError = error

   return resolvedError
}
