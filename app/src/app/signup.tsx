import { router } from "expo-router"
import { Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native"

import { apple, google } from "@/assets"

const Signup = () => (
   <SafeAreaView className="h-screen w-screen bg-black">
      <View className="flex items-center justify-center h-screen w-screen pt-4 pb-8 px-8">
         <Text className="w-full text-4xl font-bold text-white">
            Signup
         </Text>

         <TextInput
            keyboardType="email-address"
            placeholder="Enter your email"
            placeholderTextColor="#FBFBFB"
            className="w-full mt-8 p-4 text-lg text-white border-2 border-white rounded-xl"
         />
         <TextInput
            secureTextEntry={true}
            placeholder="Enter your password"
            placeholderTextColor="#FBFBFB"
            className="w-full mt-4 p-4 text-lg text-white border-2 border-white rounded-xl"
         />

         <TouchableOpacity className="w-full mt-8 py-4 bg-primary rounded-xl">
            <Text className="text-center text-xl font-bold text-white">
               Create an account
            </Text>
         </TouchableOpacity>

         <View className="w-full my-10 border-b border-white" />

         <View className="flex gap-y-4 w-full">
            <TouchableOpacity className="flex flex-row items-center justify-center w-full py-4 bg-white rounded-xl">
               <Image
                  source={google}
                  className="h-[32px] w-[32px] mr-2"
               />
               <Text className="text-xl font-bold text-black">
                  Signup with Google
               </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex flex-row items-center justify-center w-full py-4 bg-white rounded-xl">
               <Image
                  source={apple}
                  className="h-[32px] w-[32px] mr-2"
               />
               <Text className="text-xl font-bold text-black">
                  Signup with Apple
               </Text>
            </TouchableOpacity>
         </View>

         <View className="flex flex-row justify-center w-full mt-8">
            <Text className="text-lg text-white">
               Already have an account? {""}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
               <Text className="text-lg font-bold text-accent">
                  Login Here.
               </Text>
            </TouchableOpacity>
         </View>
      </View>
   </SafeAreaView>
)

export default Signup
