"use client";

import { useEffect, useState } from "react";
import { fetchWithdrawDestinations } from "@/lib/api/wallet/withdraw-destinations";
import { FALLBACK_WITHDRAW_DESTINATIONS } from "@/lib/payment-methods";
import type { WithdrawDestinations } from "@/types/wallet";

export function useWithdrawDestinations() {
  const [destinations, setDestinations] = useState<WithdrawDestinations>(
    FALLBACK_WITHDRAW_DESTINATIONS
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchWithdrawDestinations();
        if (!cancelled) setDestinations(data);
      } catch {
        if (!cancelled) setDestinations(FALLBACK_WITHDRAW_DESTINATIONS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { destinations, loading };
}
