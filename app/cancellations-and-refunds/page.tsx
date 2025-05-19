// app/cancellations-and-refunds/page.tsx
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

const CancellationsAndRefundsPage = () => {
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
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, color: '#212121' }}>
          Cancellations and Refunds
        </Typography>
        <Typography variant="body1" component="div" sx={{ color: '#666', lineHeight: 1.7 }}>
          <h2>Cancellations</h2>
          <p>
            We understand that circumstances may change, and you might need to cancel your subscription.
            Here&apos;s our policy regarding cancellations:
          </p>
          <ol>
            <li>
              <strong>Subscription Cancellation:</strong> You can cancel your subscription at any time. Your cancellation will be
              effective at the end of your current billing period.
            </li>
            <li>
              <strong>Cancellation Process:</strong> To cancel your subscription, please visit your account settings page and
              follow the cancellation instructions. You may also contact our support team.
            </li>
            <li>
              <strong>No Prorated Refunds:</strong> We do not offer prorated refunds for canceled subscriptions. You will retain
              access to the service until the end of your paid term.
            </li>
          </ol>

          <h2>Refunds</h2>
          <p>
            We strive to provide a high-quality service. Refunds are handled on a case-by-case basis, in accordance with the
            following guidelines:
          </p>
          <ol>
            <li>
              <strong>Initial 30-Day Period:</strong> For new subscriptions, you may be eligible for a full refund if you cancel
              within the first 30 days of your initial purchase, if you are not satisfied.
            </li>
            <li>
              <strong>Service Issues:</strong> If you experience technical difficulties or service disruptions that prevent you
              from using Kelsa, please contact our support team. We will work to resolve the issue, and if we are unable to
              do so, you may be eligible for a partial or full refund.
            </li>
            <li>
              <strong>No Refunds After 30 Days:</strong> After the initial 30-day period, refunds are generally not provided.
            </li>
            <li>
              <strong>Abuse:</strong> Refunds will not be granted in cases where there is evidence of abuse of our platform or
              violation of our Terms of Service.
            </li>
          </ol>
          <h3>Additional Notes</h3>
          <ul>
            <li>All refund requests must be submitted in writing to our support team.</li>
            <li>Refunds will be processed to the original payment method. Please allow 5-7 business days for the refund to
              appear in your account.</li>
            <li>This policy is subject to change. Any updates will be posted on our website.</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default CancellationsAndRefundsPage;
