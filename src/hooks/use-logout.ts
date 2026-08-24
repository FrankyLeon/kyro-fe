"use client";

import { useLogoutConfirm } from "@/context/logout-confirm-context";

export function useLogout() {
  const { requestLogout } = useLogoutConfirm();
  return requestLogout;
}
