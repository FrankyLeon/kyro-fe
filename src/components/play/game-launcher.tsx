"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LogOut,
  Maximize,
  Minimize,
  Play,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import type { Game } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DepositFlow } from "@/components/deposit/deposit-flow";
import { kickGame, launchGame } from "@/lib/api/games";
import { useAuth } from "@/context/auth-context";
import { resolveGameImage } from "@/lib/game-image";
import { SITE_CTA } from "@/lib/site-copy";
import { getMinBalanceToPlayCents } from "@/lib/wallet-config";
import { cn, formatBalance } from "@/lib/utils";

interface GameLauncherProps {
  game: Game;
}

interface GameSessionProps {
  game: Game;
  gameUrl?: string | null;
  onExit: () => void;
}

async function safeExitFullscreen(element: HTMLElement | null) {
  if (!element || document.fullscreenElement !== element) return;

  try {
    await document.exitFullscreen();
  } catch {
    // Document may not be active during unmount or navigation.
  }
}

function GameSession({ game, gameUrl, onExit }: GameSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement === container) {
        await safeExitFullscreen(container);
      } else {
        await container.requestFullscreen();
      }
    } catch {
      // Browser may reject fullscreen without a user gesture.
    }
  }, []);

  const handleExit = useCallback(async () => {
    await safeExitFullscreen(containerRef.current);
    onExit();
  }, [onExit]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "animate-fade-in-up overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-black/50 ring-1 ring-white/5",
        isFullscreen && "flex h-screen flex-col rounded-none border-0 ring-0"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-zinc-700/50">
            <Image
              src={resolveGameImage(game.coverImage, game.slug)}
              alt=""
              fill
              className="object-cover"
              sizes="28px"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="truncate text-sm font-medium text-zinc-200">
                {game.title}
              </span>
            </div>
            <p className="truncate text-xs text-zinc-500">
              {game.developer}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-3.5 w-3.5" />
            ) : (
              <Maximize className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => void handleExit()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative aspect-video overflow-hidden bg-zinc-950",
          isFullscreen && "min-h-0 flex-1"
        )}
      >
        <Image
          src={resolveGameImage(game.bannerImage, `${game.slug}-banner`)}
          alt=""
          fill
          className="object-cover opacity-40"
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
        <div className="absolute inset-0 bg-zinc-950/50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(9,9,11,0.65)_100%)]" />
        {gameUrl ? (
          <iframe
            src={gameUrl}
            title={game.title}
            className="absolute inset-0 z-10 h-full w-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
          />
        ) : (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl">
              {game.title}
            </p>
            <p className="max-w-md text-center text-sm text-zinc-200/90">
              Connecting to game server…
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="gold">Session active</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GameLauncher({ game }: GameLauncherProps) {
  const { user, refreshBalance } = useAuth();
  const [launching, setLaunching] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const launchAfterDepositRef = useRef(false);

  const minBalanceCents = getMinBalanceToPlayCents();
  const lowBalance =
    user != null && user.balanceCents < minBalanceCents;

  async function startGame() {
    setLaunching(true);
    setLaunchError(null);

    try {
      const returnUrl =
        typeof window !== "undefined" ? window.location.href : undefined;
      const result = await launchGame(game.slug, returnUrl);
      setGameUrl(result.gameUrl);
      setPlaying(true);
      setShowDeposit(false);
      await refreshBalance();
    } catch (err) {
      setLaunchError(
        err instanceof Error ? err.message : "Could not start the game."
      );
    } finally {
      setLaunching(false);
    }
  }

  async function handleLaunch() {
    setLaunchError(null);

    if (!user) {
      setLaunchError("Sign in to launch a game.");
      return;
    }

    if (user.balanceCents < minBalanceCents) {
      launchAfterDepositRef.current = true;
      setShowDeposit(true);
      return;
    }

    await startGame();
  }

  async function handleDepositSuccess() {
    try {
      await refreshBalance();
    } catch {
      // Deposit already succeeded; launch can still proceed.
    }

    setShowDeposit(false);

    if (launchAfterDepositRef.current) {
      launchAfterDepositRef.current = false;
      await startGame();
    }
  }

  if (playing) {
    return (
      <GameSession
        game={game}
        gameUrl={gameUrl}
        onExit={() => {
          void kickGame()
            .catch(() => {
              // Session may already be closed on the provider side.
            })
            .finally(() => {
              void refreshBalance();
            });
          setPlaying(false);
          setGameUrl(null);
        }}
      />
    );
  }

  if (showDeposit) {
    return (
      <div className="animate-fade-in-up space-y-5">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-2xl shadow-black/30 ring-1 ring-white/5 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  Deposit required
                </span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100">
                Add funds to play
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                You need at least{" "}
                {formatBalance(minBalanceCents, user?.currency || "USD")} to
                start {game.title}. Complete a deposit to continue.
              </p>
              {user ? (
                <p className="mt-3 text-sm text-zinc-500">
                  Current balance:{" "}
                  <span className="font-medium text-amber-400">
                    {formatBalance(user.balanceCents, user.currency)}
                  </span>
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                launchAfterDepositRef.current = false;
                setShowDeposit(false);
              }}
              className="rounded-lg border border-zinc-700/60 p-2 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
              aria-label="Close deposit"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {launchError ? (
            <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {launchError}
            </p>
          ) : null}

          <div className="mx-auto max-w-[420px]">
            <DepositFlow onSuccess={() => void handleDepositSuccess()} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 shadow-2xl shadow-black/30 ring-1 ring-white/5 backdrop-blur-sm">
        <div className="relative h-28 overflow-hidden sm:h-32">
          <Image
            src={resolveGameImage(game.bannerImage, `${game.slug}-banner`)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgb(245_158_11_/_0.12),_transparent_70%)]" />
        </div>

        <div className="pointer-events-none absolute -right-10 top-20 h-36 w-36 rounded-full bg-amber-500/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-emerald-500/6 blur-3xl" />

        <div className="relative px-6 pb-8 pt-2 text-center sm:px-10 sm:pb-10">
          <div className="relative -mt-10 mx-auto mb-5 h-[5.5rem] w-[5.5rem] overflow-hidden rounded-2xl border-2 border-zinc-800 shadow-xl shadow-black/40 ring-2 ring-zinc-950 sm:-mt-12">
            <Image
              src={resolveGameImage(game.coverImage, game.slug)}
              alt={game.title}
              fill
              className="object-cover"
              sizes="88px"
            />
          </div>

          <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-500/80" />
            <span className="text-shimmer">Ready to play</span>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-zinc-100">
            Instant play
          </h3>
          <p className="mx-auto mb-4 max-w-sm text-sm leading-relaxed text-zinc-500">
            No download required. Your session runs securely in the browser.
          </p>

          <div className="mb-8 flex items-center justify-center gap-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1">
              {game.developer}
            </span>
          </div>

          {lowBalance && user ? (
            <p className="mx-auto mb-5 max-w-md rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300/90">
              Balance{" "}
              <span className="font-medium text-amber-400">
                {formatBalance(user.balanceCents, user.currency)}
              </span>{" "}
              is below the{" "}
              {formatBalance(minBalanceCents, user.currency)} minimum. You&apos;ll
              be asked to deposit before playing.
            </p>
          ) : null}

          {launchError ? (
            <p className="mx-auto mb-5 max-w-md rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {launchError}
            </p>
          ) : null}

          <div className="mx-auto flex w-full max-w-md justify-center">
            <Button
              size="lg"
              onClick={() => void handleLaunch()}
              isLoading={launching}
              className="h-12 min-w-0 flex-1 whitespace-nowrap px-6 shadow-lg shadow-amber-500/25 transition-shadow hover:shadow-amber-500/40 sm:min-w-[11.5rem]"
            >
              {launching ? null : lowBalance ? (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-950/20">
                  <Wallet className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-950/20">
                  <Play className="h-4 w-4 fill-current" />
                </span>
              )}
              <span>{lowBalance ? "Deposit & play" : SITE_CTA.playNow}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
