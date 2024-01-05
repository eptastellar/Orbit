export const resolveFirebaseError = (error: string): string => {
   let resolvedError = ""

   if (error.includes("auth/email-already-in-use"))
      resolvedError = "Email address already in use."
   else if (error.includes("auth/invalid-email"))
      resolvedError = "Provided invalid email address."
   else if (error.includes("auth/requires-recent-login"))
      resolvedError = "Old session. Please relog and try again."
   else if (error.includes("auth/too-many-requests"))
      resolvedError = "Access to this account has been temporarily disabled due to many failed login attempts. \
      You can immediately restore it by resetting your password or you can try again later."
   else if (error.includes("auth/user-not-found"))
      resolvedError = "Email address not found."
   else if (error.includes("auth/weak-password"))
      resolvedError = "Password must be at least 6 characters."
   else if (error.includes("auth/wrong-password"))
      resolvedError = "Provided wrong password."
   else resolvedError = error

   return resolvedError
}
