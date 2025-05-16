// app/terms-and-conditions/page.tsx
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

const TermsAndConditionsPage = () => {
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
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, color: '#212121' }}>
          Terms and Conditions
        </Typography>
        <Typography variant="body1" component="div" sx={{ color: '#666', lineHeight: 1.7 }}>
          <ol>
            <li>
              <strong>Acceptance of Terms</strong>
              <p>
                By accessing and using Kelsa, you agree to be bound by these Terms and
                Conditions.
              </p>
            </li>
            <li>
              <strong>Use of the Platform</strong>
              <p>
                Kelsa provides a platform for [describe your platform&apos;s purpose, e.g.,
                project management, collaboration]. You agree to use the platform only
                for lawful purposes.
              </p>
            </li>
            <li>
              <strong>Account Registration</strong>
              <p>
                To use certain features, you may need to register an account. You are
                responsible for maintaining the confidentiality of your account
                information.
              </p>
            </li>
            <li>
              <strong>Content</strong>
              <p>
                Users may be able to submit content to the platform. You retain
                ownership of your content, but grant us a license to use it to
                provide the service.
              </p>
            </li>
            <li>
              <strong>Intellectual Property</strong>
              <p>
                The platform and its original content, features, and functionality are
                owned by [Your Company Name] and are protected by intellectual
                property laws.
              </p>
            </li>
            <li>
              <strong>Disclaimer of Warranties</strong>
              <p>
                The platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We
                make no warranties, express or implied.
              </p>
            </li>
            <li>
              <strong>Limitation of Liability</strong>
              <p>
                In no event shall [Your Company Name] be liable for any indirect,
                incidental, special, consequential, or punitive damages.
              </p>
            </li>
            <li>
              <strong>Governing Law</strong>
              <p>
                These Terms and Conditions shall be governed by the laws of [Your
                Country/State].
              </p>
            </li>
            <li>
              <strong>Changes to Terms</strong>
              <p>
                We reserve the right to modify these Terms and Conditions at any
                time.
              </p>
            </li>
             <li>
                <strong>Cancellation and Returns</strong>
                 <p>
                    We do not tolerate cancellations and returns.
                 </p>
              </li>
          </ol>
        </Typography>
      </Box>
    </Box>
  );
};

export default TermsAndConditionsPage;
