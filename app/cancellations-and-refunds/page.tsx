// app/cancellations-and-refunds/page.tsx
'use client'

import { Box, Typography, Button, Container } from "@mui/material";
import { DM_Sans } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const CancellationsAndRefundsPage = () => {
  const router = useRouter();
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
        <Box display="flex" gap={2}>
          <Link href="/contact-us" passHref>
            <Button variant="text" sx={{ color: '#fff' }}>Contact Us</Button>
          </Link>
          <Link href="/terms-and-conditions" passHref>
            <Button variant="text" sx={{ color: '#fff' }}>Terms & Conditions</Button>
          </Link>
          <Link href="/privacy-policy" passHref>
            <Button variant="text" sx={{ color: '#fff' }}>Privacy Policy</Button>
          </Link>
          <Link href="/cancellations-and-refunds" passHref>
            <Button variant="text" sx={{ color: '#fff' }}>Cancellations & Refunds</Button>
          </Link>
        </Box>
      </Box>

      {/* Page Content */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, color: '#212121' }}>
          Cancellations & Refunds
        </Typography>
        <Typography variant="h4" component="div" sx={{ color: '#666', lineHeight: 1.7, textAlign: 'center', mt: 4 }}>
          Coming Soon
        </Typography>
      </Container>
    </Box>
  );
};

export default CancellationsAndRefundsPage;
