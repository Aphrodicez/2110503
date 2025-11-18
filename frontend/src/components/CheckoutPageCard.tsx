import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import React, { useState } from "react";

const CheckoutPageCard = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      // TODO: show success UI / redirect
      console.log("Payment success!");
    }

    setLoading(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md bg-white p-4 shadow">
      <PaymentElement />

      {errorMessage && (
        <div className="mt-2 text-sm text-red-500">{errorMessage}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-4 w-full rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay ฿${amount / 100}`}
      </button>
    </form>
  );
};

export default CheckoutPageCard;
