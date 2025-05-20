import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Interface for the request body
interface VerifyRequestBody {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as VerifyRequestBody;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    // --- Input Validation ---
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: 'Missing required payment verification parameters.'
      }, { status: 400 });
    }

    // Get Razorpay key secret for verification
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error('Environment variable RAZORPAY_KEY_SECRET is not set for verification.');
      return NextResponse.json(
        { error: 'Server configuration error: Razorpay secret missing.' },
        { status: 500 }
      );
    }

    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare signatures to verify payment
    if (generated_signature !== razorpay_signature) {
      console.warn('Payment verification failed: Signatures do not match.');
      return NextResponse.json({
        success: false,
        message: 'Payment verification failed: Invalid signature.'
      }, { status: 400 }); // 400 Bad Request is appropriate for invalid input (signature)
    }

    // Initialize Supabase client to interact with database
    const supabase = createRouteHandlerClient({ cookies });

    // Find the transaction record using the order_id
    const { data: transaction, error: transactionFetchError } = await supabase
      .from('transactions')
      .select('user_id, status') // Also fetch status to prevent double-processing
      .eq('order_id', razorpay_order_id)
      .single();

    if (transactionFetchError || !transaction) {
      console.error('Error fetching transaction or transaction not found for order_id:', razorpay_order_id, transactionFetchError);
      return NextResponse.json({
        success: false,
        message: 'Transaction record not found in database for this order ID.'
      }, { status: 404 }); // 404 Not Found is appropriate
    }

    // Prevent double-processing (optional but recommended)
    if (transaction.status === 'success') {
        console.warn('Attempt to verify an already successful transaction for order_id:', razorpay_order_id);
        return NextResponse.json({
            success: true, // Already verified, so report success
            message: 'Payment already verified and processed.'
        });
    }

    const userId = transaction.user_id;

    // Update the transaction record status
    const { error: updateTransactionError } = await supabase
      .from('transactions')
      .update({ payment_id: razorpay_payment_id, status: 'success' })
      .eq('order_id', razorpay_order_id);

    if (updateTransactionError) {
      console.error('Error updating transaction record to "success":', updateTransactionError);
      // IMPORTANT: Even if transaction update fails, the payment was verified.
      // You need a robust way to handle this:
      // 1. Log extensively.
      // 2. Potentially trigger an alert for manual intervention.
      // 3. Decide if you still update user premium status (risky if transaction isn't marked).
      // For now, we proceed to update user premium, but this state is inconsistent.
      // Consider retries or a separate job for such updates.
    }

    // Update is_premium flag in the profiles table
    const { error: updateUserError } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId);

    if (updateUserError) {
      console.error('Failed to update user premium status for user ID:', userId, updateUserError);
      // This is a critical failure. The payment is verified, but the user didn't get premium.
      return NextResponse.json({
        success: false,
        message: 'Payment verified, but failed to update user premium status. Please contact support.',
      }, { status: 500 });
    }

    console.log("Payment successfully verified and user status updated for user ID:", userId);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully, user status updated.'
    });

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Unhandled server error during payment verification:', err.message, err.stack);
    return NextResponse.json({
      success: false,
      message: `Internal server error during verification.`,
      details: err.message,
    }, { status: 500 });
  }
}