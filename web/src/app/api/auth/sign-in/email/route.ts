
import { supabase } from "@/config/supabase"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (request: NextRequest) => {
   const { email, password } = await request.json()

   const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
   })

   if (!error) {
      return returnBearerToken( ).then((token) => {
         return NextResponse.json({ success: true, token: token }, { status: 200 })
      });
   }
   return NextResponse.json({ success: false, message: error.message }, { status: 400 })
}

async function returnBearerToken( ): Promise<string | null> {
   const { data, error } = await supabase.auth.getSession()

   if (data.session)
      return data.session.access_token
   return null
}
