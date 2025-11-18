import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPageCard from "@/components/CheckoutPageCard";

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
    const createPaymentIntent = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/v1/payments/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount }),
          }
        );

        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
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
