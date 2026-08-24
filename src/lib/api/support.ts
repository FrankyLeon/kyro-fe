import type { ContactTicketInput, ContactTicketResult } from "@/types/support";
import {
  mapScorpioContactResult,
  type ScorpioContactResultRaw,
} from "./adapters/scorpio";
import { apiFetch } from "./client";
import { getApiConfig } from "./config";

export async function submitContactTicket(
  input: ContactTicketInput
): Promise<ContactTicketResult> {
  if (!input.name.trim() || !input.email.trim() || !input.message.trim()) {
    throw new Error("Please fill in all required fields.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error("Enter a valid email address.");
  }

  const { endpoints } = getApiConfig();
  const raw = await apiFetch<ScorpioContactResultRaw>(endpoints.supportContact, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapScorpioContactResult(raw);
}
