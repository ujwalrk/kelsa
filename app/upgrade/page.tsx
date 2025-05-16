'use client'
import { Box, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

// Declare Razorpay globally for TypeScript
declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        open(): void;
      };
    };
  }
}

// Define the type for Razorpay options for better type safety
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }) => void;
  prefill: {
    name: string;
    email: string | undefined;
  };
  theme: { color: string };
}

export default function UpgradePage() {
  const router = useRouter();
  // Use the actual Razorpay key ID for client-side code
  const razorpayKey = "rzp_live_gTcPg2fRhuGcUS";
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    // Load Razorpay script if it's not already loaded
    if (typeof window !== 'undefined') {
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayReady(true);
        document.body.appendChild(script);
      } else {
        setRazorpayReady(true);
      }
    }
  }, []);

  const handleUpgrade = async () => {
    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        alert('Payment gateway is still loading. Please try again in a moment.');
        return;
      }

      // Get user info
      const { data: { user } } = await supabase.auth.getUser();
      
      // First create order from the server
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1, // 1 INR for test
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const orderData = await response.json();
      
      // Then initialize Razorpay with the order data
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Kelsa Premium',
        description: 'Unlock unlimited columns and advanced features',
        //order_id: orderData.id, // Use the order ID from the server
        handler: async function(response) {
          // Verify the payment on the server side
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }),
          });
          
          if (verifyResponse.ok) {
            // Update user to premium
            await supabase.auth.updateUser({ data: { premium: true } });
            router.push('/board');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.email?.split('@')[0] || 'Guest',
          email: user?.email,
        },
        theme: { color: '#6366f1' },
      };

      // Initialize and open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again later.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#f4f6fa' }}>
      <Paper sx={{ p: 4, minWidth: 400, maxWidth: 500 }} elevation={3}>
        <Typography variant="h4" mb={2} color="primary" fontWeight={700} align="center">Upgrade to Kelsa Premium</Typography>
        <Typography variant="body1" mb={3} align="center">Unlock the full power of Kelsa for just ₹1 (test)!</Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Unlimited columns on your boards" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Priority support" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Early access to new features" />
          </ListItem>
        </List>
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleUpgrade} disabled={!razorpayReady}>
          {razorpayReady ? 'Upgrade Now' : 'Loading...'}
        </Button>
        <Button fullWidth sx={{ mt: 1 }} onClick={() => router.push('/board')}>
          Maybe later
        </Button>
      </Paper>
    </Box>
  );
}