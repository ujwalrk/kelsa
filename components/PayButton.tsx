'use client'
import { Button } from '@mui/material'

export const PayButton = () => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY
    const handlePayment = async () => {
    const res = await fetch('/api/payment', {
      method: 'POST',
      body: JSON.stringify({ amount: 500 }), // ₹500
    })

    const data = await res.json()

    const options = {
      key: razorpayKey,
      name: 'Kelsa Board',
      currency: data.currency,
      amount: data.amount,
      order_id: data.id,
      handler: function (response: any) {
        alert('Payment Successful: ' + response.razorpay_payment_id)
      },
      prefill: {
        name: 'Test User',
        email: 'test@example.com',
        contact: '9999999999',
      },
    }

    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  }

  return <Button variant="contained" onClick={handlePayment}>Pay ₹500</Button>
}
