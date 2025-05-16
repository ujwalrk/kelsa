import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const payment_capture = 1
  const amount = body.amount * 100 // Convert to paisa

  const options = {
    amount: amount,
    currency: 'INR',
    receipt: 'receipt_order_74394',
    payment_capture,
  }

  try {
    const response = await razorpay.orders.create(options)
    return NextResponse.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Razorpay order failed' }, { status: 500 })
  }
}
