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
    
    // Get Razorpay key secret for verification
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    // Compare signatures to verify payment
    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: 'Payment verification failed'
      }, { status: 400 });
    }

    // Initialize Supabase client to interact with database
    const supabase = createRouteHandlerClient({ cookies });

    // Find the transaction record using the order_id
    const { data: transaction, error: transactionFetchError } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('order_id', razorpay_order_id)
      .single();

    if (transactionFetchError || !transaction) {
      console.error('Error fetching transaction or transaction not found:', transactionFetchError);
      return NextResponse.json({
        success: false,
        message: 'Transaction not found or error fetching transaction'
      }, { status: 404 });
    }
    
    const userId = transaction.user_id;

    // Update the transaction record status
    const { error: updateTransactionError } = await supabase
      .from('transactions')
      .update({ payment_id: razorpay_payment_id, status: 'success' })
      .eq('order_id', razorpay_order_id);

    if (updateTransactionError) {
      console.error('Error updating transaction record:', updateTransactionError);
      // Still continue to update user to premium
    }

    // Update user metadata to include premium flag using the retrieved user_id
    const { error: updateUserError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { premium: true } }
    );
    
    if (updateUserError) {
      console.error('Failed to update user status:', updateUserError);
      return NextResponse.json({
        success: false,
        message: 'Failed to update user status'
      }, { status: 500 });
    }
    
    console.log("User successfully verified and status updated for user ID:", userId);
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully, user status updated'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    // Add more specific error detail if available
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({
      success: false,
      message: `Server error during verification: ${errorMessage}`,
    }, { status: 500 });
  }
}