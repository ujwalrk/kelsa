'use client'
import { Box, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

// Declare Razorpay globally for TypeScript
declare global {
  interface Window {
    Razorpay: { // Define the structure of the Razorpay constructor
      new (options: RazorpayOptions): {
        open(): void;
        // You can add other methods or properties if used, e.g.:
        // on(event: string, callback: (response: any) => void): void;
      };
    };
  }
}

// Define the type for Razorpay options for better type safety
interface RazorpayOptions {
  key: string | undefined;
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
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    // Only append the script if it's not already there and we are in a browser environment
    // Use a refined type assertion for window only when checking for dynamic global properties
    if (typeof window !== 'undefined' && !(window as typeof window & { Razorpay?: Window['Razorpay'] }).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayReady(true);
      document.body.appendChild(script);
    } else if (typeof window !== 'undefined' && (window as typeof window & { Razorpay?: Window['Razorpay'] }).Razorpay) {
      setRazorpayReady(true);
    }
  }, []);

  const handleUpgrade = async () => {
    // Now, window.Razorpay is typed correctly due to declare global, no 'any' needed here
    if (!window.Razorpay) {
      alert('Payment gateway is still loading. Please try again in a moment.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();

    const options: RazorpayOptions = { // Explicitly type options
      key: razorpayKey,
      amount: 100, // 1 INR for test
      currency: 'INR',
      name: 'Kelsa Premium',
      description: 'Unlock unlimited columns and advanced features',
      handler: async function (/* response */) { // Removed unused 'response' parameter from handler
        // You might want to send this response to your backend for verification
        // console.log("Razorpay Response:", response); // If you uncomment, remove /* */ around response
        await supabase.auth.updateUser({ data: { premium: true } });
        router.push('/board');
      },
      prefill: {
        name: user?.email || 'Guest',
        email: user?.email,
      },
      theme: { color: '#6366f1' },
    };
    // Use the globally declared Razorpay constructor
    const rzp = new window.Razorpay(options);
    rzp.open();
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