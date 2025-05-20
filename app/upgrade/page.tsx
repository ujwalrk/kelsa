'use client'
import { Box, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Alert, Snackbar } from '@mui/material';
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
  order_id?: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }) => void;
  prefill: {
    name: string;
    email: string | undefined;
  };
  theme: { color: string };
  modal: {
    ondismiss: () => void;
  };
}

export default function UpgradePage() {
  const router = useRouter();
  // Use the actual Razorpay key ID for client-side code
  const razorpayKey = "rzp_live_gTcPg2fRhuGcUS";
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined); // Added userEmail state
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });
  const [pendingPayment, setPendingPayment] = useState(false);

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

      // Check if user is already premium
      const checkPremiumStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
          const isPremiumUser = user.user_metadata?.premium || false;
          setIsPremium(isPremiumUser);
        } else {
          // Not logged in, redirect to login
          router.push('/login');
        }
      };

      checkPremiumStatus();
    }
  }, [router]);

  const handleUpgrade = async () => {
    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        setAlert({
          open: true,
          message: 'Payment gateway is still loading. Please try again in a moment.',
          severity: 'error'
        });
        return;
      }

      // Get user info
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAlert({
          open: true,
          message: 'You need to be logged in to upgrade.',
          severity: 'error'
        });
        return;
      }

      // Get the user's session to pass the user ID to the API route
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        console.error('Error fetching user session:', sessionError);
        setAlert({
          open: true,
          message: 'Could not retrieve user session. Please try logging in again.',
          severity: 'error'
        });
        return;
      }

      // First create order from the server
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 0.01, // 0.01 INR (1 paisa) for test
          userId: session.user.id, // Include user ID in the request body
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await response.json();
      setPendingPayment(true);

      // Then initialize Razorpay with the order data
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Kelsa Premium',
        description: 'Unlock More Features',
        order_id: orderData.id, // Use the order ID from the server
        handler: async function (response) {
          // Verify the payment on the server side
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            // Payment successful
            setPendingPayment(false);
            setAlert({
              open: true,
              message: 'Payment successful! You are now a premium user.',
              severity: 'success'
            });

            // Update local state and re-fetch user data
            setIsPremium(true);
            const { data: { user: updatedUser } } = await supabase.auth.getUser();
            if (updatedUser) {
              setUserEmail(updatedUser.email);
            }

            // Wait a bit before redirecting to make sure the user sees the success message
            setTimeout(() => {
              router.push('/board');
            }, 2000);
          } else {
            setPendingPayment(false);
            setAlert({
              open: true,
              message: 'Payment verification failed. Please contact support.',
              severity: 'error'
            });
          }
        },
        prefill: {
          name: user?.email?.split('@')[0] || 'Guest',
          email: user?.email,
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: function () {
            // Handle the case when user closes the Razorpay modal
            setPendingPayment(false);
            setAlert({
              open: true,
              message: 'Payment cancelled. You can try again later.',
              severity: 'info'
            });
          }
        }
      };

      // Initialize and open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      setPendingPayment(false);
      setAlert({
        open: true,
        message: 'Something went wrong. Please try again later.',
        severity: 'error'
      });
    }
  };

  const handleDowngrade = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { premium: false }
      });

      if (error) {
        throw new Error('Failed to downgrade account');
      }

      // Update the local state and re-fetch user data
      setIsPremium(false);
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUserEmail(updatedUser.email);
      }
      setAlert({
        open: true,
        message: 'You have been downgraded to a free account.',
        severity: 'success'
      });

      // Wait a bit before redirecting
      setTimeout(() => {
        router.push('/board');
      }, 2000);
    } catch (error) {
      console.error('Downgrade error:', error);
      setAlert({
        open: true,
        message: 'Failed to downgrade account. Please try again later.',
        severity: 'error'
      });
    }
  };

  const closeAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#f4f6fa' }}>
      <Paper sx={{ p: 4, minWidth: 400, maxWidth: 500 }} elevation={3}>
        {isPremium ? (
          <>
            <Typography variant="h4" mb={2} color="primary" fontWeight={700} align="center">Kelsa Premium</Typography>
            <Typography variant="body1" mb={3} align="center">You are currently enjoying premium features!</Typography>
            {userEmail && (  // Display user email
              <Typography variant="body2" mb={3} align="center">
                Logged in as: {userEmail}
              </Typography>
            )}
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
            <Button variant="outlined" color="warning" fullWidth sx={{ mt: 3 }} onClick={handleDowngrade}>
              Downgrade to Free
            </Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => router.push('/board')}>
              Back to Board
            </Button>
          </>
        ) : (
          <>
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
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleUpgrade} disabled={!razorpayReady || pendingPayment}>
              {!razorpayReady ? 'Loading...' : pendingPayment ? 'Processing...' : 'Upgrade Now'}
            </Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => router.push('/board')}>
              Maybe later
            </Button>
          </>
        )}
      </Paper>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
