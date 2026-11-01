"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AlertIcon, CheckIcon, WifiOffIcon } from "./icons";
import styles from "./Toast.module.css";

export type ToastTone = "positive" | "notice" | "critical" | "neutral";

export interface ToastOptions {
  /** Prefer this over onUndo when the action is not Undo. */
  onAction?: () => void;
  /** Defaults to Undo when onUndo is set, else Retry when tone is critical. */
  actionLabel?: string;
  /** @deprecated Prefer onAction + actionLabel. Kept for callers. */
  onUndo?: () => void;
  tone?: ToastTone;
  /** Leading glyph. Defaults from tone. Pass false to hide. */
  icon?: boolean;
  durationMs?: number;
}

type Show = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<Show>(() => {});

/** Something already happened, nothing is required. One at a time. */
export function useToast(): Show {
  return useContext(ToastContext);
}

type ToastState = {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
  tone: ToastTone;
  showIcon: boolean;
  shown: boolean;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({
    message: "",
    tone: "positive",
    showIcon: true,
    shown: false,
  });
  const timer = useRef<number | undefined>(undefined);
  const paused = useRef(false);
  const remaining = useRef(4000);
  const startedAt = useRef(0);
  const dragX = useRef(0);

  const clearTimer = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  };

  const hide = useCallback(() => {
    clearTimer();
    setState((s) => ({ ...s, shown: false }));
  }, []);

  const arm = useCallback(
    (ms: number) => {
      clearTimer();
      remaining.current = ms;
      startedAt.current = Date.now();
      paused.current = false;
      timer.current = window.setTimeout(hide, ms);
    },
    [hide],
  );

  const show = useCallback<Show>(
    (message, options) => {
      const tone = options?.tone ?? (options?.onUndo || options?.onAction ? "positive" : "positive");
      const onAction = options?.onAction ?? options?.onUndo;
      const actionLabel =
        options?.actionLabel ??
        (options?.onUndo ? "Undo" : tone === "critical" && onAction ? "Retry" : onAction ? "Undo" : undefined);
      const showIcon = options?.icon !== false && tone !== "neutral";
      const duration =
        options?.durationMs ?? (onAction ? 6000 : 4000);

      setState({
        message,
        onAction,
        actionLabel,
        tone,
        showIcon,
        shown: true,
      });
      arm(duration);
    },
    [arm],
  );

  useEffect(() => () => clearTimer(), []);

  const pause = () => {
    if (!state.shown || paused.current || !timer.current) return;
    clearTimer();
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    paused.current = true;
  };

  const resume = () => {
    if (!state.shown || !paused.current) return;
    arm(remaining.current || 1000);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    dragX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pause();
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const dx = e.clientX - dragX.current;
    if (Math.abs(dx) > 64) hide();
    else resume();
  };

  const Icon =
    state.tone === "critical"
      ? AlertIcon
      : state.tone === "notice"
        ? WifiOffIcon
        : CheckIcon;

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className={`${styles.wrap} ${state.shown ? styles.shown : ""}`}
        role={state.tone === "critical" ? "alert" : "status"}
        aria-live={state.tone === "critical" ? "assertive" : "polite"}
      >
        <div
          className={styles.toast}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={resume}
        >
          {state.showIcon && (
            <span className={`${styles.icon} ${styles[state.tone]}`}>
              <Icon strokeWidth={state.tone === "positive" ? 2.5 : 2} />
            </span>
          )}
          <span className={styles.message}>{state.message}</span>
          {state.onAction && state.actionLabel && (
            <button
              type="button"
              className={styles.undo}
              onClick={() => {
                state.onAction?.();
                hide();
              }}
            >
              {state.actionLabel}
            </button>
          )}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
