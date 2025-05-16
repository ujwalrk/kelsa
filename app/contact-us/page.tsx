// app/contact-us/page.tsx
'use client'
import { Box, Typography, Button } from "@mui/material";
import { DM_Sans } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const ContactUsPage = () => {
    const router = useRouter();
  return (
    <Box sx={{ bgcolor: '#fafaff', minHeight: '100vh', fontFamily: dmSans.style.fontFamily }}>
      {/* Navigation Bar */}
      <Box
        sx={{
          bgcolor: '#3f51b5',
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
      <Box sx={{ p: 4, textAlign: "center", maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, color: '#212121' }}>
          Contact Us
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: '#666' }}>
          For any inquiries, please contact us at:
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold', color: '#3f51b5' }}>
          ujwal.png@gmail.com
        </Typography>
        {/* Add more contact information as needed (e.g., email, form) */}
      </Box>
    </Box>
  );
};

export default ContactUsPage;