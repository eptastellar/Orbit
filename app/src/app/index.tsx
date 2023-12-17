import { router } from "expo-router"
import { Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native"

import { logoWhite } from "@/assets"

const App = () => (
   <SafeAreaView className="h-screen w-screen bg-black">
      <View className="flex items-center justify-evenly h-screen w-screen pt-4 pb-8 px-8">
         <Text className="text-center text-4xl font-bold text-white">
            Welcome, to your personal orbit.
         </Text>

         <Image
            source={logoWhite["256px"]}
            className="h-[256px] w-[256px]"
         />

         <View className="flex gap-y-4 w-full">
            <TouchableOpacity
               className="py-4 bg-primary rounded-xl"
               onPress={() => router.push("/signup")}
            >
               <Text className="text-center text-xl font-bold text-white">
                  Signup
               </Text>
            </TouchableOpacity>

            <TouchableOpacity
               className="py-4 border-2 border-secondary rounded-xl"
               onPress={() => router.push("/login")}
            >
               <Text className="text-center text-xl font-bold text-white">
                  Login
               </Text>
            </TouchableOpacity>
         </View>
      </View>
   </SafeAreaView>
)

export default App
