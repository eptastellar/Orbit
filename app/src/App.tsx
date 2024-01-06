// Preloading the main css file
import "@/App.css"

// Importing external modules from packages
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createBrowserRouter } from "react-router-dom"

// Importing and defining the routes for the router
import { Providers } from "@/contexts"
import { ErrorPage, ForgotPassword, Home, Interests, Signin, Signup, Welcome } from "@/routes"

const router = createBrowserRouter([
   {
      path: "/",
      element: <Home />,
      errorElement: <ErrorPage />
   },
   // Onboarding pages
   {
      path: "/onboarding",
      element: <Welcome />
   },
   {
      path: "/onboarding/signin",
      element: <Signin />
   },
   {
      path: "/onboarding/signup",
      element: <Signup />
   },
   {
      path: "/onboarding/interests",
      element: <Interests />
   },
   {
      path: "/onboarding/forgot-password",
      element: <ForgotPassword />
   }
])

// Creating the root element with the RouterProvider
createRoot(document.querySelector("#root")!).render(
   <StrictMode>
      <Providers>
         <RouterProvider router={router} />
      </Providers>
   </StrictMode>
)
