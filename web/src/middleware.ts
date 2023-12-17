import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabase } from './config/supabase'


export async function middleware(request: NextRequest) {
   console.log('bearer authorization middleware')

   const token = request.headers.get('authorization')?.split(' ')[1]

   if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)

      if (user)
         return NextResponse.next()
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
   }
   return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
}

// TODO:
export const config = {
   matcher: [
      '/api/user/:path*'
   ]
}
