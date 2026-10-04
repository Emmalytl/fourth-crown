// Deliberately gated until durable orders and verified Stripe webhook processing are implemented.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  return res.status(503).json({error:'Online card payment is not enabled. Please arrange payment with the restaurant.'});
}
