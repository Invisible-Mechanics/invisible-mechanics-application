"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { readSessionToken } from "@/lib/auth-client";
import { createCohortOrder, createClassOrder } from "@/lib/api-client";

type Kind = "cohort" | "class";

/**
 * Razorpay one-time checkout for either a cohort enrollment or a single class.
 * Server pages pass only serializable props (kind + id); the button itself
 * picks the right order endpoint and login redirect.
 */
export function CheckoutButton({
  kind,
  id,
  label,
}: {
  kind: Kind;
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginNext = `/${kind === "cohort" ? "cohorts" : "classes"}/${id}`;
  const createOrder = kind === "cohort" ? createCohortOrder : createClassOrder;

  async function onClick() {
    setError(null);

    if (!readSessionToken()) {
      router.push(`/login?next=${loginNext}`);
      return;
    }

    if (!scriptReady || typeof window.Razorpay === "undefined") {
      setError("Checkout is still loading — try again in a moment.");
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder(id);

      const rzp = new window.Razorpay({
        key: order.key_id,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: order.title,
        description: kind === "cohort" ? "Cohort enrollment" : "Lecture purchase",
        prefill: {
          name: order.prefill_name ?? undefined,
          email: order.prefill_email ?? undefined,
          contact: order.prefill_contact ?? undefined,
        },
        handler: async (resp) => {
          try {
            const { verifyPayment } = await import("@/lib/api-client");
            await verifyPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            router.refresh();
          } catch {
            setError(
              "Payment received but confirmation is pending. Refresh in a minute — if it doesn't clear, contact support.",
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start checkout.";
      if (msg === "unauthenticated") {
        router.push(`/login?next=${loginNext}`);
      } else if (msg === "already enrolled" || msg === "already have access") {
        router.refresh();
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <button onClick={onClick} disabled={loading} className="btn-primary w-full">
        {loading ? "Processing…" : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
