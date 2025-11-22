import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPageCard from "@/components/CheckoutPageCard";
import { createPaymentIntent } from "@/services/payments";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("VITE_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(stripePublicKey);

interface StripeCheckoutSectionProps {
  amount: number; // in smallest unit, e.g. 78800 = ฿788.00
}

const CheckoutSection: React.FC<StripeCheckoutSectionProps> = ({ amount }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const data = await createPaymentIntent(amount);
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [amount]);

  if (loading) {
    return <div>Initializing payment…</div>;
  }

  if (!clientSecret) {
    return <div>Failed to initialize payment. Please try again.</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe" },
      }}
    >
      <CheckoutPageCard amount={amount} />
    </Elements>
  );
};

export default CheckoutSection;
