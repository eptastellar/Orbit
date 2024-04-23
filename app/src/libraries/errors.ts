import { ServerError } from "@/types"

export const resolveFirebaseError = (error: string): string => {
   let resolvedError = ""

   if (error.includes("auth/email-already-in-use"))
      resolvedError = "The provided email address is already in use."
   else if (error.includes("auth/invalid-credential"))
      resolvedError = "The provided credentials are not valid."
   else if (error.includes("auth/invalid-email"))
      resolvedError = "Please provide a valid email address."
   else if (error.includes("auth/invalid-password"))
      resolvedError = "Please provide a valid password string."
   else if (error.includes("auth/requires-recent-login"))
      resolvedError = "You are using an old session. Please log back in and try again."
   else if (error.includes("auth/too-many-requests"))
      resolvedError = "Access to this account has been temporarily disabled due to many failed login attempts. \
      You can immediately restore it by resetting your password or you can try again later."
   else if (error.includes("auth/user-not-found"))
      resolvedError = "The provided user is not registered."
   else if (error.includes("auth/weak-password"))
      resolvedError = "Please provide a password that is at least 6 characters long."
   else if (error.includes("auth/wrong-password"))
      resolvedError = "The provided password is not valid for this account."
   else resolvedError = error

   return resolvedError
}

export const resolveServerError = (error: ServerError | string): string => {
   let resolvedError = ""

   // Authentication errors
   if (error === "auth/expired-token")
      resolvedError = "Your session has expired. Please log back in."
   else if (error === "auth/invalid-token")
      resolvedError = "The provided session token is invalid."
   else if (error === "auth/email-unverified")
      resolvedError = "Your email address is not verified. Please check your inbox."
   else if (error === "auth/user-not-signed-up")
      resolvedError = "You don't currently have a profile associated with this account."
   else if (error === "auth/user-already-exists")
      resolvedError = "A profile has already been created with this account."
   // Validation errors
   else if (error === "validation/username-too-long")
      resolvedError = "The username must have 24 characters at most."
   else if (error === "validation/username-too-short")
      resolvedError = "The username must have at least 6 characters."
   else if (error === "validation/invalid-username")
      resolvedError = "The username must only contain letters, numbers or the following symbols [. - _]."
   else if (error === "validation/username-already-in-use")
      resolvedError = "The provided username is already taken. Please choose another one."
   else if (error === "validation/invalid-birthdate")
      resolvedError = "The provided birthdate is invalid."
   else if (error === "validation/too-young")
      resolvedError = "You must be at least 14 to use Orbit. 🤓"
   else if (error === "validation/invalid-number-of-interests")
      resolvedError = "Please provide 1 to 5 interests."
   else if (error === "validation/invalid-interests")
      resolvedError = "Please provide interests from the given list."
   else if (error === "validation/invalid-document-id")
      resolvedError = "The provided document id is invalid."
   else if (error === "validation/malformed-input")
      resolvedError = "An error occurred while processing the request's parameters."
   // Server errors
   else if (error === "server/no-content")
      resolvedError = "The requested resource has no contents."
   else if (error === "server/no-friends")
      resolvedError = "The requested user has no friends."
   else resolvedError = error

   return resolvedError
}
