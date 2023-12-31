// Preloading the main css file
import "@/App.css"

// Importing external modules from packages
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createBrowserRouter } from "react-router-dom"

// Importing and defining the routes for the router
import { Providers } from "@/contexts"
import { ErrorPage, Home, Welcome } from "@/routes"

const router = createBrowserRouter([
   {
      path: "/",
      element: <Home />,
      errorElement: <ErrorPage />
   },
   {
      path: "/onboarding",
      element: <Welcome />
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
