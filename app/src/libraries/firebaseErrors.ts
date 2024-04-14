export const resolveFirebaseError = (error: string): string => {
   let resolvedError = ""

   if (error.includes("auth/email-already-in-use"))
      resolvedError = "The provided email address is already in use."
   else if (error.includes("auth/invalid-credential"))
      resolvedError = "The provided credentials are not valid."
   else if (error.includes("auth/invalid-email"))
      resolvedError = "Please provide a valid email address."
   else if (error.includes("auth/requires-recent-login"))
      resolvedError = "You are using an old session. Please log back in and try again."
   else if (error.includes("auth/too-many-requests"))
      resolvedError = "Access to this account has been temporarily disabled due to many failed login attempts. \
      You can immediately restore it by resetting your password or you can try again later."
   else if (error.includes("auth/user-not-found"))
      resolvedError = "The provided email address is not registered."
   else if (error.includes("auth/weak-password"))
      resolvedError = "Please provide a password that is at least 6 characters long."
   else if (error.includes("auth/wrong-password"))
      resolvedError = "The provided password is not valid for this account."
   else resolvedError = error

   return resolvedError
}
