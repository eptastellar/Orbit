import { Stack } from "expo-router"

const Layout = () => (
   <Stack screenOptions={{
      animation: "slide_from_right",
      headerShown: false,
      orientation: "portrait_up",
      statusBarAnimation: "fade",
      statusBarColor: "#030303",
      statusBarStyle: "light",
   }} />
)

export default Layout
