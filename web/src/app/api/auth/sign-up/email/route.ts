
import { supabase } from '@/config/supabase'
import { isValidBirthday, isValidEmail, isValidName, isValidPassword, isValidPfp } from '@/helpers/validate'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
   const { email, password, name, bday, pfp, interests } = await request.json()
   if (
      isValidEmail(email) &&
      isValidPassword(password) &&
      isValidName(name) &&
      isValidBirthday(bday) &&
      isValidPfp(pfp)
      )
   {
      const { data, error } = await supabase.auth.signUp({
         email: email,
         password: password,
         options: {
            data: {
               name: name,
               bday: bday,
               pfp: pfp,
               interests: interests,
            }
         }
      })

      if (!error && data.user) {
         if (createNode(data.user.id, bday, interests))
            return NextResponse.json({ success: true, message: "Account created" }, { status: 201 })
         return NextResponse.json({ success: false, message: "Error while creating node" }, { status: 400 })
      }
      return NextResponse.json({ success: false, message: error })
   }
   return NextResponse.json({ success: false, message: "Bad input request" }, { status: 400 })
}

// TODO: @TheInfernalNick gli interessi sono un array di codici associati agli interessi
// bday è un array formato da [dd, mm, yy]
function createNode(userId: string, bday: number[], interests: string[]): boolean {
   return true;
}
