import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';

function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: amount * 100, // in paisa
      currency: 'INR',
      receipt: `receipt_order_${uuidv4()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount, // Note: could be string or number
    });
  } catch (err) {
    console.error('Razorpay Order Creation Error:', err);
    return NextResponse.json(
      { error: 'Razorpay order creation failed' },
      { status: 500 }
    );
  }
}
