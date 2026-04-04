export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentData {
  key_id: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = (paymentData: RazorpayPaymentData) => {
  const rzp = new window.Razorpay(paymentData);
  rzp.open();
};

export const initializeRazorpayPayment = async (
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string,
  onSuccess: (paymentId: string, signature: string) => void,
  onError: (error: any) => void
) => {
  const scriptLoaded = await loadRazorpayScript();

  if (!scriptLoaded) {
    onError(new Error('Failed to load Razorpay'));
    return;
  }

  const paymentData: RazorpayPaymentData = {
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    order_id: orderId,
    name: 'FinOps Academy',
    description: 'Course Enrollment',
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: '#5b7afc',
    },
    handler: (response) => {
      onSuccess(response.razorpay_payment_id, response.razorpay_signature);
    },
  };

  try {
    openRazorpayCheckout(paymentData);
  } catch (error) {
    onError(error);
  }
};

export default {
  loadRazorpayScript,
  openRazorpayCheckout,
  initializeRazorpayPayment,
};
