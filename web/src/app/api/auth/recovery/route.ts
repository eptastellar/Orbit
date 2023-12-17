import { supabase } from "@/config/supabase";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
   const { email } = await request.json()

   const { data, error } = await supabase.auth.resetPasswordForEmail(email)

   if (!error)
      return NextResponse.json({ success: true, message: "Email sent!" }, { status: 200 })
   return NextResponse.json({ success: false, message: error.message }, { status: 400 })
}
