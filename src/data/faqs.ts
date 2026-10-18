export interface FAQItem {
  id: string;
  question: string;
  category: "Booking" | "Cancellation & Refund" | "Payment" | "Travel Information";
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    question: "How do I book a ferry ticket?",
    category: "Booking",
    answer:
      "You can search your departure island, destination, date, and passenger count directly on our home or routes page. Select your preferred speedboat or catamaran trip, fill in your passenger details, and pay securely online to get your instant QR e-ticket."
  },
  {
    id: "faq-2",
    question: "How can I change my booking?",
    category: "Booking",
    answer:
      "You can modify your travel date or time up to 2 hours before departure directly through your 'Manage Booking' portal or by contacting our 24/7 passenger support team."
  },
  {
    id: "faq-3",
    question: "What is the cancellation policy?",
    category: "Cancellation & Refund",
    answer:
      "Cancellations made more than 24 hours prior to departure are eligible for a 100% full refund. Cancellations between 2 and 24 hours receive an 80% refund. If a trip is cancelled by the operator due to sea warnings or rough weather, you receive an immediate 100% refund."
  },
  {
    id: "faq-4",
    question: "How do I request a refund?",
    category: "Cancellation & Refund",
    answer:
      "Go to 'Manage Booking' with your booking reference (e.g. FRY24821) and email, click 'Cancel Trip', and select 'Request Refund'. Refunds are credited back to your original payment method within 3-5 business days."
  },
  {
    id: "faq-5",
    question: "Which payment methods do you accept?",
    category: "Payment",
    answer:
      "We accept all major Visa, Mastercard, American Express, Apple Pay, Google Pay, and localized Maldivian Bank debit cards through our secure payment gateway."
  },
  {
    id: "faq-6",
    question: "What should I do if my payment failed?",
    category: "Payment",
    answer:
      "Ensure your card details and 3D Secure OTP are entered accurately. If the issue persists, try an alternate card or contact our phone support at +960 333 1234."
  },
  {
    id: "faq-7",
    question: "Can I travel with a vehicle or bicycle?",
    category: "Travel Information",
    answer:
      "Speedboats can accommodate foldable bicycles and surfboards if declared in advance. Full-sized vehicles are only accommodated on large public MTCC Ro-Ro ferries between Malé and select regional hub islands."
  },
  {
    id: "faq-8",
    question: "What time should I arrive at the terminal?",
    category: "Travel Information",
    answer:
      "We strongly recommend arriving at your designated pier or harbor terminal at least 20-30 minutes before your scheduled departure time to ensure smooth luggage tagging and boarding."
  }
];
