"use client";
declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open(): void; on(e: string, cb: (r: unknown) => void): void } } }

function load(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = () => resolve(); s.onerror = () => reject(new Error("razorpay_script"));
    document.body.appendChild(s);
  });
}
/** Opens Razorpay Checkout. Payment success is NEVER decided here: the verified webhook confirms the order. */
export async function openCheckout(o: { keyId: string; razorpayOrderId: string; amountPaise: number; name: string; email?: string; phone?: string; onDismiss: () => void; onSubmitted: () => void }) {
  await load();
  const rz = new window.Razorpay!({
    key: o.keyId, order_id: o.razorpayOrderId, amount: o.amountPaise, currency: "INR", name: "Milsen & Croft",
    prefill: { name: o.name, email: o.email, contact: o.phone },
    handler: () => o.onSubmitted(), modal: { ondismiss: o.onDismiss },
  });
  rz.open();
}
