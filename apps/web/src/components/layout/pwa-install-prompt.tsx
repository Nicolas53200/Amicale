"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "desktop" | null;

function getPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function PwaInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => void } | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const detected = getPlatform();
    setPlatform(detected);

    const timer = setTimeout(() => setShow(true), 3000);

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt: () => void });
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  function handleDismiss() {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }

  function handleInstallAndroid() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      handleDismiss();
    } else {
      setStep(1);
    }
  }

  if (!show || !platform || platform === "desktop") return null;

  return (
    <div className="fixed inset-0 z-[9400] flex items-end justify-center">
      <div className="fixed inset-0 bg-black/40 animate-in fade-in" onClick={handleDismiss} />
      <div className="relative z-10 mx-3 mb-3 w-full max-w-md rounded-[20px] bg-surface-elevated shadow-lg animate-in slide-in-from-bottom-6 fade-in">
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-brand-400 to-brand-600 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-content-primary">
                  Installer Amicale
                </h2>
                <p className="text-[13px] text-content-secondary">
                  Accès rapide depuis votre écran
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-content-secondary hover:text-content-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {platform === "ios" && (
          <div className="px-6 pb-2">
            <div className="space-y-3">
              <Step
                number={1}
                text="Appuyez sur le bouton"
                highlight="Partager"
                icon={<ShareIcon />}
              />
              <Step
                number={2}
                text="Faites défiler et appuyez sur"
                highlight="Sur l'écran d'accueil"
                icon={<PlusSquareIcon />}
              />
              <Step
                number={3}
                text="Appuyez sur"
                highlight="Ajouter"
                icon={null}
              />
            </div>
            <p className="mt-3 text-center text-[11px] text-content-muted">
              Utilisez Safari pour cette fonctionnalité
            </p>
          </div>
        )}

        {platform === "android" && step === 0 && (
          <div className="px-6 pb-2">
            <p className="text-[13px] text-content-secondary mb-3">
              Installez l&apos;application pour un accès instantané, sans passer par le Play Store.
              Elle fonctionnera comme une app classique.
            </p>
            <button
              onClick={handleInstallAndroid}
              className="w-full rounded-[14px] bg-brand-500 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-700"
            >
              Installer l&apos;application
            </button>
          </div>
        )}

        {platform === "android" && step === 1 && (
          <div className="px-6 pb-2">
            <div className="space-y-3">
              <Step
                number={1}
                text="Appuyez sur le menu"
                highlight="⋮"
                icon={<MenuDotsIcon />}
              />
              <Step
                number={2}
                text="Appuyez sur"
                highlight="Installer l'application"
                icon={<DownloadIcon />}
              />
            </div>
          </div>
        )}

        <div className="px-6 pb-6 pt-3">
          <button
            onClick={handleDismiss}
            className="w-full rounded-[14px] bg-surface-secondary py-2.5 text-[13px] font-medium text-content-secondary transition-colors hover:bg-border-subtle"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  text,
  highlight,
  icon,
}: {
  number: number;
  text: string;
  highlight: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-[13px] font-bold text-brand-600 dark:text-brand-400">
        {number}
      </span>
      <p className="text-[13px] text-content-secondary">
        {text}{" "}
        <span className="inline-flex items-center gap-1 font-semibold text-content-primary">
          {icon}
          {highlight}
        </span>
      </p>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-primary">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function MenuDotsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-content-primary">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-primary">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
