"use client";

import { useEffect, useState } from "react";
import { fetchDepositDestinations } from "@/lib/api/wallet/deposit-destinations";
import { FALLBACK_DEPOSIT_DESTINATIONS } from "@/lib/payment-methods";
import type { DepositDestinations } from "@/types/deposit";

export function useDepositDestinations() {
  const [destinations, setDestinations] = useState<DepositDestinations>(
    FALLBACK_DEPOSIT_DESTINATIONS
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchDepositDestinations();
        if (!cancelled) setDestinations(data);
      } catch {
        if (!cancelled) setDestinations(FALLBACK_DEPOSIT_DESTINATIONS);
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
