import Stripe from 'stripe';
const stripe = new Stripe('sk_test_your_secret_key');

export async function createSubscription(req, res) {
  try {
    const { paymentMethodId, priceId, plan } = req.body;
    const user = req.user; // Get from auth middleware

    // Create or get customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });
      // Save customer ID to your user record
      await updateUserStripeCustomerId(user.id, customer.id);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Return the client secret if payment needs confirmation
    const invoice = subscription.latest_invoice;
    const payment_intent = invoice.payment_intent;

    return res.json({
      subscriptionId: subscription.id,
      clientSecret: payment_intent.client_secret,
      requiresAction: payment_intent.status === 'requires_action',
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(400).json({ message: error.message });
  }
} 