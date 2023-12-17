import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest, context: { params: any }) => {
  const id = context.params.id

  return NextResponse.json({message: id})
}

export const PUT = async (request: NextRequest, context: { params: any }) => {
  const id = context.params.id

  return NextResponse.json({message: id})
}

export const PATCH = async (request: NextRequest, context: { params: any }) => {
  const id = context.params.id

  return NextResponse.json({message: id})
}

export const DELETE = async (request: NextRequest, context: { params: any }) => {
  const id = context.params.id

  return NextResponse.json({message: id})
}
