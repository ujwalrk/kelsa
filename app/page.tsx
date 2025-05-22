// app/page.tsx
'use client'
import { supabase } from '../lib/supabase'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import NextLink from 'next/link';
import { DM_Sans } from 'next/font/google';
import Container from '@mui/material/Container';
import { Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import SpeedIcon from '@mui/icons-material/Speed';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function HomePage() {
  const router = useRouter()
  const [pricingLoading, setPricingLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
    }
    checkUser()
  }, [])

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
    handleClose()
  }

  const getUserInitial = () => {
    if (!user?.email) return ''
    return user.user_metadata.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()
  }

  const handleGetStarted = async () => {
    if (user) router.push('/board')
    else router.push('/login')
  }

  const features = [
    {
      title: 'Task Management',
      description: 'Organize and track all your assignments in one place',
      icon: <AssignmentIcon sx={{ color: 'primary.main', fontSize: 40 }} />,
    },
    {
      title: 'Group Collaboration',
      description: 'Work seamlessly with your team on group projects',
      icon: <GroupIcon sx={{ color: 'primary.main', fontSize: 40 }} />,
    },
    {
      title: 'Fast & Efficient',
      description: 'Stay on top of deadlines with our intuitive interface',
      icon: <SpeedIcon sx={{ color: 'primary.main', fontSize: 40 }} />,
    },
  ]

  return (
    <Box sx={{ bgcolor: '#fafaff', minHeight: '100vh', fontFamily: dmSans.style.fontFamily }}>
      {/* Navigation Bar */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          py: 2,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => router.push('/')}
        >
          Kelsa
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <NextLink href="/contact-us" passHref>
            <Button variant="text" sx={{ color: '#fff' }}>Contact Us</Button>
          </NextLink>
          <NextLink href="/terms-and-conditions" passHref>
            <Button variant="text" sx={{ color: '#fff' }}>Terms & Conditions</Button>
          </NextLink>
          <NextLink href="/privacy-policy" passHref>
            <Button variant="text" sx={{ color: '#fff' }}>Privacy Policy</Button>
          </NextLink>
          <NextLink href="/cancellations-and-refunds" passHref>
            <Button variant="text" sx={{ color: '#fff' }}>Cancellations & Refunds</Button>
          </NextLink>
          {user && (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }}
                >
                  {getUserInitial()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 2
                }}
              >
                {user ? `Welcome Back, ${user.user_metadata.full_name || user.email?.split('@')[0]}` : 'The Ultimate Student Task Board'}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  opacity: 0.9,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}
              >
                {user ? 'Ready to organize your tasks?' : 'Organize your academic life with a beautiful, intuitive board'}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                {user ? 'Go to Board' : 'Get Started Free'}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}