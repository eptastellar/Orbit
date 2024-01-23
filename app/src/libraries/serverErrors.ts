export const resolveServerError = (error: string): string => {
   let resolvedError = ""

   // Authentication errors
   if (error.includes("auth/expired-token"))
      resolvedError = "Session expired. Please log back in."
   else if (error.includes("auth/invalid-token"))
      resolvedError = "Invalid session token."
   else if (error.includes("auth/email-unverified"))
      resolvedError = "Email address not verified. Check your inbox."
   else if (error.includes("auth/user-not-signed-up"))
      resolvedError = "Profile not created."
   // Validation errors
   else if (error.includes("validation/username-too-long"))
      resolvedError = "Username must have 24 characters at most."
   else if (error.includes("validation/username-too-short"))
      resolvedError = "Username must have at least 6 characters."
   else if (error.includes("validation/invalid-username"))
      resolvedError = "Username must only contain letters, numbers or the following symbols [. - _]."
   else if (error.includes("validation/username-already-in-use"))
      resolvedError = "Username already taken."
   else if (error.includes("validation/invalid-birthdate"))
      resolvedError = "Invalid birthdate."
   else if (error.includes("validation/too-young"))
      resolvedError = "You must be at least 14 to use Orbit."
   else if (error.includes("validation/invalid-number-of-interests"))
      resolvedError = "Interests amount must be from 1 to 5."
   else if (error.includes("validation/invalid-interests"))
      resolvedError = "Interests must be selected from the list."
   else resolvedError = error

   return resolvedError
}
