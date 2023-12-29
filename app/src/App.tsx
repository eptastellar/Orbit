// Preloading the main css file
import "@/App.css"

// Importing external modules from packages
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

// Importing and defining the routes for the router
import { Root } from "@/routes"

const router = createBrowserRouter([
   {
      path: "/",
      element: <Root />
   }
])

// Creating the root element with the RouterProvider
createRoot(document.querySelector("#root")!).render(
   <StrictMode>
      <RouterProvider router={router} />
   </StrictMode>
)
