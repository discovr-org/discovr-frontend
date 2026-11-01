"use client";

import { useEffect, useState } from "react";
import { installPromptStyles } from "@/shared/styles/installPrompt";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Android / desktop Chromium only. iOS has no beforeinstallprompt —
 * show Add to Home Screen copy after a successful booking, not here.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div style={installPromptStyles.bar} role="region" aria-label="Install app">
      <p className="body" style={installPromptStyles.copy}>
        Add discovr to your home screen. Faster next time you&apos;re out.
      </p>
      <div style={installPromptStyles.actions}>
        <button
          type="button"
          className="label"
          style={installPromptStyles.secondary}
          onClick={() => setDismissed(true)}
        >
          Not now
        </button>
        <button
          type="button"
          className="label"
          style={installPromptStyles.primary}
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
