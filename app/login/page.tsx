'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { TextField, Button, Box, Typography, Paper } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) router.replace('/board')
    }
    checkUser()
  }, [router])

  const handleLogin = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/board')
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#f4f6fa' }}>
      <Paper sx={{ p: 4, width: 350 }} elevation={3}>
        <Typography variant="h4" mb={2} color="primary" fontWeight={700} align="center">Kelsa</Typography>
        <Typography variant="h6" mb={2} align="center">Sign In</Typography>
        <form onSubmit={handleLogin}>
          <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Sign In</Button>
        </form>
        <Button onClick={() => router.push('/register')} sx={{ mt: 2 }} fullWidth>Don't have an account? Sign Up</Button>
      </Paper>
    </Box>
  )
}
