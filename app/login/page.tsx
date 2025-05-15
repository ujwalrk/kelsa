'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Box, TextField, Button, Typography } from '@mui/material'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    router.push('/')
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">Login</Typography>
      <TextField label="Email" fullWidth sx={{ mt: 2 }} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Password" fullWidth type="password" sx={{ mt: 2 }} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleLogin}>Login</Button>
    </Box>
  )
}
