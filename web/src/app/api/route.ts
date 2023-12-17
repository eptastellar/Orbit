import { NextResponse } from 'next/server'

export const GET = () => {
   return NextResponse.json({
      'status': 200,
      'time': Date.now()
   })
}
