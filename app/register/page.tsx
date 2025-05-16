'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { TextField, Button, Box, Typography, Paper } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) router.replace('/board')
    }
    checkUser()
  }, [router])

  const handleRegister = async (e: any) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else router.push('/login')
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#f4f6fa' }}>
      <Paper sx={{ p: 4, width: 350 }} elevation={3}>
        <Typography variant="h4" mb={2} color="primary" fontWeight={700} align="center">Kelsa</Typography>
        <Typography variant="h6" mb={2} align="center">Create an Account</Typography>
        <form onSubmit={handleRegister}>
          <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
          <TextField label="Confirm Password" type="password" fullWidth margin="normal" value={confirm} onChange={e => setConfirm(e.target.value)} />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Sign Up</Button>
        </form>
        <Button onClick={() => router.push('/login')} sx={{ mt: 2 }} fullWidth>Already have an account? Sign In</Button>
      </Paper>
    </Box>
  )
}
