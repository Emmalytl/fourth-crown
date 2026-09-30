import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Online payment is not configured yet. Add STRIPE_SECRET_KEY in Vercel.' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { customer = {}, fulfillment = 'pickup', items = [], totals = {} } = req.body || {};
    if (!customer.name || !customer.phone || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'Customer details and at least one item are required.' });
    }

    // IMPORTANT: For production, replace client-supplied prices with a server-side
    // menu lookup from the restaurant database before creating the Stripe session.
    const line_items = items.map(item => ({
      quantity: Math.max(1, Number(item.quantity || 1)),
      price_data: {
        currency: 'usd',
        product_data: { name: item.addon ? `${item.name} — ${item.addon}` : item.name },
        unit_amount: Math.round(Number(item.price || 0) * 100)
      }
    }));

    if (fulfillment === 'delivery' && Number(totals.deliveryFee || 0) > 0) {
      line_items.push({ quantity: 1, price_data: { currency: 'usd', product_data: { name: 'Delivery fee' }, unit_amount: Math.round(Number(totals.deliveryFee) * 100) } });
    }
    if (Number(totals.tax || 0) > 0) {
      line_items.push({ quantity: 1, price_data: { currency: 'usd', product_data: { name: 'Tax' }, unit_amount: Math.round(Number(totals.tax) * 100) } });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: customer.email || undefined,
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        restaurant: 'FOURTH CROWN',
        fulfillment: String(fulfillment),
        customer_name: String(customer.name).slice(0, 500),
        customer_phone: String(customer.phone).slice(0, 100),
        delivery_address: String(customer.address || '').slice(0, 500)
      }
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    return res.status(500).json({ error: 'We could not start the secure payment session.' });
  }
}
