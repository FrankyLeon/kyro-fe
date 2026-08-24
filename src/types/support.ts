export type SupportCategory =
  | "account"
  | "deposit"
  | "games"
  | "technical"
  | "other";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: SupportCategory | "general";
}

export interface ContactTicketInput {
  name: string;
  email: string;
  category: SupportCategory;
  subject: string;
  message: string;
  userId?: string;
}

export interface ContactTicketResult {
  ticketId: string;
  createdAt: string;
  message: string;
}
