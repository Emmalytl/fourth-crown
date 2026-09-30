import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Payment verification is not configured.' });
  const sessionId = req.query?.session_id;
  if (!sessionId) return res.status(400).json({ error: 'Missing session_id.' });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return res.status(200).json({
      paid: session.payment_status === 'paid',
      payment_status: session.payment_status,
      id: session.id,
      amount_total: session.amount_total,
      customer_email: session.customer_details?.email || session.customer_email || ''
    });
  } catch (error) {
    console.error('Stripe verification error:', error);
    return res.status(500).json({ error: 'Unable to verify this payment session.' });
  }
}
