// app/privacy-policy/page.tsx
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

const PrivacyPolicyPage = () => {
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
        </Box>
      </Box>

      {/* Page Content */}
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, color: '#212121' }}>
          Privacy Policy
        </Typography>
        <Typography variant="body1" component="div" sx={{ color: '#666', lineHeight: 1.7 }}>
          <ol>
            <li>
              <strong>Introduction</strong>
              <p>
                Your privacy is important to us. This Privacy Policy explains how we
                collect, use, and disclose your personal information.
              </p>
            </li>
            <li>
              <strong>Information We Collect</strong>
              <p>
                We collect information you provide directly to us, such as when you
                create an account, and information collected automatically, such as
                your IP address and browsing behavior.
              </p>
            </li>
            <li>
              <strong>How We Use Your Information</strong>
              <p>
                We use your information to provide and improve our services, to
                communicate with you, and for marketing purposes.
              </p>
            </li>
            <li>
              <strong>Information Sharing and Disclosure</strong>
              <p>
                We may share your information with third-party service providers,
                business partners, and for legal reasons.
              </p>
            </li>
            <li>
              <strong>Data Security</strong>
              <p>
                We take reasonable measures to protect your information from
                unauthorized access, use, or disclosure.
              </p>
            </li>
            <li>
              <strong>Your Choices</strong>
              <p>
                You may have choices about how your information is collected and
                used. You can access, correct, or delete your personal information in your account settings.
              </p>
            </li>
            <li>
              <strong>International Data Transfers</strong>
              <p>
                Your information may be transferred to and maintained on computers
                located outside of your state, province, country or other governmental
                jurisdiction.
              </p>
            </li>
            <li>
              <strong>Changes to This Privacy Policy</strong>
              <p>
                We may update this Privacy Policy from time to time. We will notify
                you of any material changes.
              </p>
            </li>
          </ol>
        </Typography>
      </Box>
    </Box>
  );
};

export default PrivacyPolicyPage;

