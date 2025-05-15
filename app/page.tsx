'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Box, Typography, Button } from '@mui/material'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [premiumUnlocked, setPremiumUnlocked] = useState(false)
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY

  // Inject Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Check current logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  const handlePayment = async () => {
    console.log('Razorpay Key:', razorpayKey)
    const options = {
      key: razorpayKey,
      amount: 100, // 1 INR = 100 paise
      currency: 'INR',
      name: 'Kelsa',
      description: 'Unlock premium features',
      handler: function (response: any) {
        alert('Payment successful! ID: ' + response.razorpay_payment_id)
        setPremiumUnlocked(true) // unlock feature
        // OPTIONAL: Send payment ID to backend for verification/storage
      },
      prefill: {
        name: user?.email || 'Guest',
        email: user?.email,
        contact: '9999999999',
      },
      theme: {
        color: '#6366f1',
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  const handleRevokePremium = () => {
    setPremiumUnlocked(false)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Welcome to Kelsa</Typography>

      {user ? (
        <>
          <Typography>Logged in as {user.email}</Typography>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
              Logout
            </Button>

            {!premiumUnlocked ? (
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                onClick={handlePayment}
              >
                Unlock Premium
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                sx={{ ml: 2 }}
                onClick={handleRevokePremium}
              >
                Revoke Premium
              </Button>
            )}
          </Box>

          {premiumUnlocked && (
            <Box sx={{ mt: 4, p: 2, border: '1px dashed #ccc' }}>
              <Typography variant="h6">🔥 Premium Feature Enabled</Typography>
              <Typography>Access to advanced task board features!</Typography>
            </Box>
          )}
        </>
      ) : (
        <Typography>Please login or register.</Typography>
      )}
    </Box>
  )
}
