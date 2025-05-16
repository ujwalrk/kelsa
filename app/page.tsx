'use client'
import { supabase } from '../lib/supabase'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [pricingLoading, setPricingLoading] = useState(false)

  const handleGetStarted = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) router.push('/board');
    else router.push('/login');
  };

  const handleFree = () => router.push('/register');
  const handlePremium = () => {
    setPricingLoading(true);
    router.push('/register?plan=premium');
  };

  return (
    <Box sx={{ bgcolor: '#fafaff', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <Box
        sx={{
          bgcolor: '#3f51b5', // Blue theme color for the navbar
          py: 2, // Vertical padding
          px: 4, // Horizontal padding
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start', // Left align content
        }}
      >
        <Typography
          variant="h6" // Adjust font size as needed
          sx={{
            fontWeight: 700,
            color: '#fff', // White color for the logo text
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => router.push('/')} // Make it clickable to go to home
        >
          Kelsa
        </Typography>
      </Box>

      {/* Hero Section */}
      <Box sx={{ pt: 10, pb: 6, px: 2, maxWidth: 900, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h2" fontWeight={800} color="primary" gutterBottom>
          Kelsa: The Ultimate Student Task Board
        </Typography>
        <Typography variant="h5" color="text.secondary" mb={3}>
          Stay on top of assignments, deadlines, and projects. Organize your academic life with a beautiful, intuitive board.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleGetStarted}
          sx={{ px: 5, py: 1.5, fontWeight: 700, fontSize: 18 }}
        >
          Get Started Free
        </Button>
      </Box>

      {/* Benefits Section */}
      <Box
        sx={{
          maxWidth: 1100,
          mx: 'auto',
          mt: 8,
          mb: 6,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {[
          {
            title: "Never Miss a Deadline",
            description: "Visualize all your assignments and due dates in one place. Move tasks as you progress and always know what's next."
          },
          {
            title: "Perfect for Group Projects",
            description: "Collaborate by organizing project tasks, tracking progress, and ensuring everyone is on the same page."
          },
          {
            title: "Simple, Fast, and Free",
            description: "Start with all the essentials for free. Upgrade for more power as your needs grow."
          }
        ].map((benefit, idx) => (
          <Box key={idx} flex="1 1 300px" maxWidth="350px">
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {benefit.title}
              </Typography>
              <Typography color="text.secondary">
                {benefit.description}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* For Students Section */}
      <Box sx={{ bgcolor: '#f3f4f6', py: 6, mb: 6 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
            Why Students Love Kelsa
          </Typography>
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 3
            }}
          >
            {[
              {
                title: "Assignment Tracker",
                description: "See all your assignments, exams, and deadlines at a glance. Never miss a due date again."
              },
              {
                title: "Personal & Academic Boards",
                description: "Separate your personal to-dos from your academic work. Stay organized in every area of life."
              },
              {
                title: "Mobile Friendly",
                description: "Access your boards from anywhere, on any device. Stay productive on the go."
              }
            ].map((item, idx) => (
              <Box key={idx} flex="1 1 250px" maxWidth="300px">
                <Paper sx={{ p: 3 }}>
                  <Typography fontWeight={600}>{item.title}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 10 }}>
        <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
          Simple Pricing
        </Typography>
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4
          }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px solid #a78bfa',
              boxShadow: 3,
              flex: '1 1 300px',
              maxWidth: '350px'
            }}
          >
            <Typography variant="h6" fontWeight={700} color="primary">Free</Typography>
            <Typography variant="h3" fontWeight={800} color="primary" mb={1}>₹0</Typography>
            <Typography color="text.secondary" mb={2}>
              Up to 3 columns per board. All core features. Perfect for getting started.
            </Typography>
            <Button variant="outlined" size="large" onClick={handleFree} sx={{ fontWeight: 700, px: 4 }}>
              Start for Free
            </Button>
          </Paper>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px solid #a78bfa',
              boxShadow: 3,
              bgcolor: '#f3f0fa',
              flex: '1 1 300px',
              maxWidth: '350px'
            }}
          >
            <Typography variant="h6" fontWeight={700} color="primary">Premium</Typography>
            <Typography variant="h3" fontWeight={800} color="primary" mb={1}>₹1</Typography>
            <Typography color="text.secondary" mb={2}>
              Unlimited columns, priority support, and more. Just ₹1 for early access!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handlePremium}
              sx={{ fontWeight: 700, px: 4 }}
              disabled={pricingLoading}
            >
              {pricingLoading ? 'Loading...' : 'Go Premium'}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}