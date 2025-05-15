'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Box, TextField, Button, Typography } from '@mui/material'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return alert(error.message)
    alert('Account created. Please check your email to confirm.')
    router.push('/login')
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">Register</Typography>
      <TextField label="Email" fullWidth sx={{ mt: 2 }} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Password" fullWidth type="password" sx={{ mt: 2 }} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleRegister}>Register</Button>
    </Box>
  )
}
