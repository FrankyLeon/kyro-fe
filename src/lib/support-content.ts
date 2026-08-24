import type { FaqItem } from "@/types/support";
import { SITE_BRAND } from "@/lib/site-copy";

export const SUPPORT_FAQ: FaqItem[] = [
  {
    id: "faq-1",
    category: "general",
    question: "How do I play a game?",
    answer:
      "Browse Games, pick a title, and click Play now. You must be signed in. Games open instantly in your browser.",
  },
  {
    id: "faq-2",
    category: "deposit",
    question: "How do deposits work?",
    answer:
      "Go to Wallet → Deposit, enter an amount, choose a payment method, and confirm. Funds are added to your balance for betting.",
  },
  {
    id: "faq-3",
    category: "deposit",
    question: "Which payment methods are supported?",
    answer:
      "Card, PayPal, and cryptocurrency (Bitcoin, Ethereum, and USDC). Available methods may vary by region.",
  },
  {
    id: "faq-4",
    category: "account",
    question: "I forgot my password. What should I do?",
    answer:
      "Use the contact form and select Account as the category. Our team can help reset access to your account.",
  },
  {
    id: "faq-6",
    category: "games",
    question: "Do I need to download anything?",
    answer:
      "No. All games run instantly in your browser — no install required.",
  },
  {
    id: "faq-7",
    category: "technical",
    question: "The game will not load",
    answer:
      "Make sure you are signed in and have an active session. Try refreshing the page or signing out and back in.",
  },
  {
    id: "faq-8",
    category: "general",
    question: "Are wallet balances refundable?",
    answer:
      "See our Refund Policy. Generally, unused deposits may be eligible for review within 14 days.",
  },
];

export const SUPPORT_EMAIL = SITE_BRAND.supportEmail;
