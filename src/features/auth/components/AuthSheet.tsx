'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES, type Country } from '@/features/auth/utils/countries';
import {
  INVALID_NUMBER,
  cleanNational,
  detectCountry,
  findCountry,
  flagOf,
  formatNational,
  isValidNational,
  stripDial,
  toE164,
} from '@/features/auth/utils/phone';
import { holdKeyboard, releasePrimer } from '@/features/auth/utils/keyboard';
import styles from './AuthSheet.module.css';

export type PhoneNumber = {
  /** "+919876543210" */
  e164: string;
  /** "IN" */
  countryIso: string;
  /** "91" */
  dialCode: string;
  /** "9876543210" */
  nationalNumber: string;
};

export type VerifyResult =
  | { ok: false }
  /** isNewUser: true shows step 3 (name). Pass the stored name for returning users. */
  | { ok: true; isNewUser: boolean; name?: string };

export type AuthResult = {
  phone: PhoneNumber;
  isNewUser: boolean;
  name?: string;
};

export type AuthSheetProps = {
  open: boolean;
  /** Scrim tap, Escape, swipe down or Android back. */
  onClose: () => void;
  /** Send the OTP. Throw to show "Couldn't send the code. Try again". */
  onSendCode: (phone: PhoneNumber) => Promise<void>;
  /** { ok: false } for a wrong code. Throw for network errors. */
  onVerifyCode: (phone: PhoneNumber, code: string) => Promise<VerifyResult>;
  /** New accounts only. Throw to show "Couldn't save. Try again". */
  onSaveName: (phone: PhoneNumber, name: string) => Promise<void>;
  /** Signed in. Close the sheet and finish what the user tapped (Save, Call). */
  onSuccess: (result: AuthResult) => void;
  /** Button on the name step. Name the original action: "Save", "Call to book". Default "Done". */
  ctaLabel?: string;
  /** Heading on the phone, code and name steps. Default "Log in or sign up to discovr". */
  title?: string;
  termsHref: string;
  privacyHref: string;
  defaultCountry?: string;
  /** Move to the code step on the last valid digit. Default true. */
  autoAdvance?: boolean;
  /** Seconds before "Resend code" unlocks. Default 30. */
  resendSeconds?: number;
  codeLength?: number;
};

type Step = 'phone' | 'country' | 'otp' | 'name';

const SEND_FAILED = "Couldn't send the code. Try again";
const VERIFY_FAILED = "Couldn't check the code. Try again";
const WRONG_CODE = 'Wrong code. Try again';
const SAVE_FAILED = "Couldn't save. Try again";
const OPEN_MS = 180;
const CLOSE_MS = 120;

export function AuthSheet({
  open,
  onClose,
  onSendCode,
  onVerifyCode,
  onSaveName,
  onSuccess,
  ctaLabel = 'Done',
  title = 'Log in or sign up to discovr',
  termsHref,
  privacyHref,
  defaultCountry = 'IN',
  autoAdvance = true,
  resendSeconds = 30,
  codeLength = 6,
}: AuthSheetProps) {
  const uid = useId();
  const ids = {
    title: `${uid}-title`,
    phone: `${uid}-phone`,
    phoneErr: `${uid}-phone-err`,
    terms: `${uid}-terms`,
    country: `${uid}-country`,
    search: `${uid}-search`,
    otp: `${uid}-otp`,
    otpStatus: `${uid}-otp-status`,
    name: `${uid}-name`,
    nameErr: `${uid}-name-err`,
  };

  // Mount and animation state
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Flow state
  const [step, setStep] = useState<Step>('phone');
  const stepRef = useRef(step);
  stepRef.current = step;
  const [iso, setIso] = useState(defaultCountry);
  const [digits, setDigits] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [otpErr, setOtpErr] = useState('');
  const [checking, setChecking] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  // 0 until mount / send — Date.now() in useState breaks cacheComponents prerender.
  const [now, setNow] = useState(0);

  // Swipe to dismiss and keyboard offset
  const [dragY, setDragY] = useState(0);
  const [kbOffset, setKbOffset] = useState(0);

  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const proxyRef = useRef<HTMLInputElement>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sheetRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dragStart = useRef<number | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const sendingRef = useRef(false);
  const checkingRef = useRef(false);

  const country = findCountry(iso);
  const phone: PhoneNumber = {
    e164: toE164(digits, country),
    countryIso: country.iso,
    dialCode: country.dial,
    nationalNumber: digits,
  };
  const valid = isValidNational(digits, country);
  const canSend = valid;
  const nameOk = name.trim().length > 0;

  // ---------- open / close ----------
  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      setStep('phone');
      setCode('');
      setOtpErr('');
      setPhoneErr('');
      setInvalid(false);
      setChecking(false);
      setSending(false);
      setSaving(false);
      setName('');
      setNameErr('');
      setDragY(0);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    clearTimeout(advanceTimer.current);
    const t = setTimeout(() => {
      setMounted(false);
      returnFocus.current?.focus?.();
    }, CLOSE_MS);
    return () => clearTimeout(t);
  }, [open]);

  // Scroll lock
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Keep the sheet above the on-screen keyboard (iOS does not resize the layout viewport)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () => setKbOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [mounted]);

  // Put the cursor in each step's field so typing can start straight away.
  // Retries until the field is mounted; then hands focus over from the keyboard primer.
  useLayoutEffect(() => {
    if (!mounted) return;
    clearTimeout(focusTimer.current);
    let tries = 0;
    const attempt = () => {
      const el =
        step === 'phone' ? phoneRef.current : step === 'otp' ? otpRef.current : step === 'name' ? nameRef.current : searchRef.current;
      if (el) {
        el.focus({ preventScroll: true });
        if (el.type !== 'search') {
          const n = el.value.length;
          try {
            el.setSelectionRange(n, n);
          } catch {}
        }
      }
      if (el && document.activeElement === el) {
        releasePrimer();
        return;
      }
      if (++tries < 8) focusTimer.current = setTimeout(attempt, 40);
    };
    attempt();
    return () => clearTimeout(focusTimer.current);
  }, [mounted, step]);

  /** Step changes that are not taps: keep focus on an input so the mobile keyboard stays up. */
  const goTo = useCallback((next: Step) => {
    holdKeyboard(proxyRef.current);
    setStep(next);
  }, []);

  // Resend countdown
  useEffect(() => {
    if (step !== 'otp' || !open) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step, open]);

  useEffect(() => () => {
    clearTimeout(advanceTimer.current);
    releasePrimer();
  }, []);

  // ---------- actions ----------
  const sendCode = useCallback(
    async (target: PhoneNumber) => {
      if (sendingRef.current) return false;
      sendingRef.current = true;
      setSending(true);
      try {
        await onSendCode(target);
        setResendAt(Date.now() + resendSeconds * 1000);
        setNow(Date.now());
        return true;
      } catch {
        return false;
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [onSendCode, resendSeconds],
  );

  const submitPhone = useCallback(
    async (d: string = digits, c: Country = country) => {
      clearTimeout(advanceTimer.current);
      if (!isValidNational(d, c)) {
        setPhoneErr(INVALID_NUMBER);
        setInvalid(true);
        return;
      }
      setPhoneErr('');
      setInvalid(false);
      if (sendingRef.current) return;
      // Go to the code step now; the request runs behind it. If it fails we come back with the error.
      setCode('');
      setOtpErr('');
      setResendAt(Date.now() + resendSeconds * 1000);
      setNow(Date.now());
      goTo('otp');
      const ok = await sendCode({ e164: toE164(d, c), countryIso: c.iso, dialCode: c.dial, nationalNumber: d });
      if (!ok) {
        setResendAt(0);
        setPhoneErr(SEND_FAILED);
        // Only pull them back if they are still waiting on the code step.
        if (stepRef.current === 'otp') goTo('phone');
      }
    },
    [digits, country, sendCode, goTo, resendSeconds],
  );

  const verify = useCallback(
    async (value: string) => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      setChecking(true);
      setOtpErr('');
      try {
        const result = await onVerifyCode(phone, value);
        if (!result.ok) {
          setOtpErr(WRONG_CODE);
          setCode('');
        } else if (result.isNewUser) {
          setName('');
          goTo('name');
        } else {
          onSuccess({ phone, isNewUser: false, name: result.name });
        }
      } catch {
        setOtpErr(VERIFY_FAILED);
        setCode('');
      } finally {
        checkingRef.current = false;
        setChecking(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onVerifyCode, onSuccess, goTo, phone.e164],
  );

  // WebOTP: Android Chrome fills the code by itself.
  // The SMS must end with "@yourdomain.com #123456" on its own last line.
  useEffect(() => {
    if (step !== 'otp' || !open || typeof window === 'undefined' || !('OTPCredential' in window)) return;
    const ac = new AbortController();
    navigator.credentials
      .get({ otp: { transport: ['sms'] }, signal: ac.signal } as CredentialRequestOptions)
      .then((cred) => {
        const value = (cred as unknown as { code?: string } | null)?.code?.replace(/\D/g, '').slice(0, codeLength);
        if (value && value.length === codeLength) {
          setCode(value);
          verify(value);
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, [step, open, codeLength, verify, resendAt]);

  const onPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const found = detectCountry(raw, country);
    const c = found ?? country;
    const d = cleanNational(found ? stripDial(raw, found) : raw, c);
    const atMax = d.length === c.max;
    const ok = isValidNational(d, c);
    setIso(c.iso);
    setDigits(d);
    setPhoneErr(atMax && !ok ? INVALID_NUMBER : '');
    setInvalid(atMax && !ok);
    clearTimeout(advanceTimer.current);
    if (autoAdvance && atMax && ok) {
      advanceTimer.current = setTimeout(() => submitPhone(d, c), 350);
    }
  };

  const onPhoneBlur = () => {
    if (step !== 'phone' || phoneErr === SEND_FAILED) return;
    const bad = digits.length > 0 && !valid;
    setPhoneErr(bad ? INVALID_NUMBER : '');
    setInvalid(bad);
  };

  const onPhoneKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitPhone();
    }
  };

  const onCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (checking) return;
    const v = e.target.value.replace(/\D/g, '').slice(0, codeLength);
    setCode(v);
    setOtpErr('');
    if (v.length === codeLength) verify(v);
  };

  const resend = async () => {
    setCode('');
    setOtpErr('');
    const ok = await sendCode(phone);
    if (!ok) setOtpErr(SEND_FAILED);
    otpRef.current?.focus();
  };

  const submitName = async () => {
    const n = name.trim();
    if (!n || saving) return;
    setSaving(true);
    setNameErr('');
    try {
      await onSaveName(phone, n);
      onSuccess({ phone, isNewUser: true, name: n });
    } catch {
      setNameErr(SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const editNumber = () => {
    setStep('phone');
    setCode('');
    setOtpErr('');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.startsWith(q) || c.iso.toLowerCase() === q,
    );
  }, [query]);

  const pickCountry = (c: Country) => {
    setIso(c.iso);
    setDigits((d) => cleanNational(d, c));
    setPhoneErr('');
    setInvalid(false);
    setQuery('');
    setStep('phone');
  };

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[0]) pickCountry(filtered[0]);
    }
  };

  // Escape: picker goes back, otherwise close
  const onSheetKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    if (step === 'country') setStep('phone');
    else onClose();
  };

  // Simple focus trap
  const onTrapKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !sheetRef.current) return;
    const nodes = sheetRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Swipe down on the top strip to dismiss
  const onDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStart.current));
  };
  const onDragEnd = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (dragY > 80) onClose();
    setDragY(0);
  };

  if (!mounted || typeof document === 'undefined') return null;

  const secsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const stepNum = step === 'otp' ? 2 : step === 'name' ? 3 : 1;
  const activeBox = Math.min(code.length, codeLength - 1);
  const display = formatNational(digits, country);

  return createPortal(
    <div className={styles.root} data-state={visible ? 'open' : 'closed'}>
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={step === 'country' ? ids.country : ids.title}
        className={styles.sheet}
        style={{
          bottom: kbOffset,
          transform: visible ? `translateY(${dragY}px)` : 'translateY(110%)',
          transition: dragStart.current !== null
            ? 'none'
            : visible
              ? `transform ${OPEN_MS}ms cubic-bezier(0.2, 0, 0, 1)`
              : `transform ${CLOSE_MS}ms linear`,
        }}
        onKeyDown={(e) => {
          onSheetKey(e);
          onTrapKey(e);
        }}
      >
        <div
          className={styles.dragZone}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div className={styles.handle} aria-hidden="true" />
          <div
            className={styles.progress}
            role="progressbar"
            aria-label={`Step ${stepNum} of 3`}
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={stepNum}
          >
            <span className={styles.segment} data-on="true" />
            <span className={styles.segment} data-on={stepNum >= 2 ? 'true' : 'false'} />
            <span className={styles.segment} data-on={stepNum === 3 ? 'true' : 'false'} />
          </div>
        </div>

        <input
          ref={proxyRef}
          className={styles.proxy}
          aria-hidden="true"
          tabIndex={-1}
          inputMode="numeric"
          autoComplete="off"
          readOnly
        />

        {step !== 'country' && (
          <h2 id={ids.title} className={styles.title}>
            {title}
          </h2>
        )}

        {step === 'phone' && (
          <div className={styles.step} key="phone">
            <label htmlFor={ids.phone} className={styles.label}>
              Phone number
            </label>
            <div className={styles.field} data-error={invalid ? 'true' : 'false'}>
              <button
                type="button"
                className={styles.ccButton}
                onClick={() => {
                  clearTimeout(advanceTimer.current);
                  setStep('country');
                }}
                aria-label={`Country code, ${country.name} +${country.dial}. Change`}
              >
                <span className={styles.flag} aria-hidden="true">
                  {flagOf(country.iso)}
                </span>
                <span>+{country.dial}</span>
                <ChevronDown />
              </button>
              <span className={styles.divider} aria-hidden="true" />
              <input
                ref={phoneRef}
                id={ids.phone}
                className={styles.phoneInput}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                enterKeyHint="next"
                placeholder={country.iso === 'IN' ? '98765 43210' : 'Mobile number'}
                value={display}
                onChange={onPhoneChange}
                onBlur={onPhoneBlur}
                onKeyDown={onPhoneKey}
                aria-invalid={invalid}
                aria-describedby={phoneErr ? ids.phoneErr : undefined}
              />
              {valid && <Check className={styles.valid} label="Looks right" />}
            </div>
            {phoneErr && (
              <p id={ids.phoneErr} role="alert" className={styles.error}>
                <AlertIcon />
                <span>{phoneErr}</span>
              </p>
            )}
            <button
              type="button"
              className={styles.primary}
              aria-disabled={!canSend}
              aria-busy={sending}
              data-disabled={!canSend ? 'true' : 'false'}
              onClick={() => submitPhone()}
            >
              {sending ? <span className={styles.spinner} aria-label="Sending code" /> : 'Send code'}
            </button>
            <p className={styles.terms}>
              By continuing you agree to the{' '}
              <a href={termsHref} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Terms &amp; Conditions
              </a>{' '}
              and{' '}
              <a href={privacyHref} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Privacy Policy
              </a>
            </p>
          </div>
        )}

        {step === 'country' && (
          <div className={styles.step} key="country">
            <div className={styles.pickerHeader}>
              <button type="button" className={styles.iconButton} onClick={() => setStep('phone')} aria-label="Back to phone number">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eaebe7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <label id={ids.country} htmlFor={ids.search} className={styles.pickerTitle}>
                Country code
              </label>
            </div>
            <div className={styles.searchField}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#808886" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={searchRef}
                id={ids.search}
                className={styles.searchInput}
                type="search"
                autoComplete="off"
                enterKeyHint="search"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
              />
            </div>
            <div className={styles.list} role="listbox" aria-labelledby={ids.country}>
              {filtered.map((c) => (
                <button
                  key={c.iso}
                  type="button"
                  role="option"
                  aria-selected={c.iso === iso}
                  className={styles.row}
                  onClick={() => pickCountry(c)}
                >
                  <span className={styles.rowFlag} aria-hidden="true">
                    {flagOf(c.iso)}
                  </span>
                  <span className={styles.rowName}>{c.name}</span>
                  <span className={styles.rowDial}>+{c.dial}</span>
                  <span className={styles.rowCheck} aria-hidden="true">
                    {c.iso === iso && <Check stroke="#eaebe7" />}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && <p className={styles.empty}>No matches</p>}
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className={styles.step} key="otp">
            <div className={styles.otpLabelRow}>
              <label htmlFor={ids.otp} className={styles.otpLabel} data-ph-mask>
                Code sent to +{country.dial} {display}
              </label>
              <button type="button" className={styles.textButton} onClick={editNumber} aria-label="Edit phone number">
                Edit
              </button>
            </div>
            <div className={styles.otpWrap}>
              <div className={styles.otpGrid} aria-hidden="true" style={{ gridTemplateColumns: `repeat(${codeLength}, minmax(0, 1fr))` }}>
                {Array.from({ length: codeLength }, (_, i) => (
                  <div
                    key={i}
                    className={styles.otpBox}
                    data-error={otpErr ? 'true' : 'false'}
                    data-active={!otpErr && otpFocused && !checking && i === activeBox ? 'true' : 'false'}
                  >
                    {code.charAt(i)}
                  </div>
                ))}
              </div>
              <input
                ref={otpRef}
                id={ids.otp}
                className={styles.otpInput}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                enterKeyHint="done"
                maxLength={codeLength}
                value={code}
                onChange={onCodeChange}
                onFocus={() => setOtpFocused(true)}
                onBlur={() => setOtpFocused(false)}
                aria-invalid={!!otpErr}
                aria-describedby={ids.otpStatus}
              />
            </div>
            <div id={ids.otpStatus} className={styles.status} aria-live="polite">
              {otpErr && !checking ? (
                <p role="alert" className={styles.error} style={{ margin: 0 }}>
                  <AlertIcon />
                  <span>{otpErr}</span>
                </p>
              ) : checking ? (
                <span className={styles.checking}>
                  <span className={styles.smallSpinner} aria-hidden="true" />
                  Checking
                </span>
              ) : secsLeft > 0 ? (
                <span className={styles.resendWait}>Resend code in 0:{String(secsLeft).padStart(2, '0')}</span>
              ) : (
                <button type="button" className={styles.textButton} data-flush="true" onClick={resend} disabled={sending}>
                  Resend code
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'name' && (
          <div className={styles.step} key="name">
            <label htmlFor={ids.name} className={styles.label}>
              Your name
            </label>
            <div className={styles.textField} data-error={nameErr ? 'true' : 'false'}>
              <input
                ref={nameRef}
                id={ids.name}
                className={styles.textInput}
                type="text"
                autoComplete="given-name"
                autoCapitalize="words"
                enterKeyHint="done"
                maxLength={40}
                placeholder="First name is enough"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameErr('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitName();
                  }
                }}
                aria-describedby={nameErr ? ids.nameErr : undefined}
              />
            </div>
            {nameErr && (
              <p id={ids.nameErr} role="alert" className={styles.error}>
                <AlertIcon />
                <span>{nameErr}</span>
              </p>
            )}
            <button
              type="button"
              className={styles.primary}
              aria-disabled={!nameOk}
              aria-busy={saving}
              data-disabled={!nameOk ? 'true' : 'false'}
              onClick={submitName}
            >
              {saving ? <span className={styles.spinner} aria-label="Saving" /> : ctaLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ba3a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Check({ className, label, stroke = '#57d3a0' }: { className?: string; label?: string; stroke?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff7a63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
