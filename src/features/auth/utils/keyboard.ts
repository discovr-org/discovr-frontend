/**
 * iOS Safari only opens the keyboard when an input is focused inside the user's own tap.
 * The sheet mounts a moment after that tap, so its fields would get the cursor but no keyboard.
 *
 * primeKeyboard() fixes this: call it synchronously in the click handler that opens the sheet.
 * It focuses an invisible input right away (keyboard opens), and the sheet then moves focus
 * to the phone field, which keeps the keyboard up. Harmless on Android and desktop.
 */
let primer: HTMLInputElement | null = null;

export function primeKeyboard(): void {
  if (typeof document === 'undefined') return;
  releasePrimer();
  const el = document.createElement('input');
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('tabindex', '-1');
  el.setAttribute('inputmode', 'numeric');
  el.setAttribute('autocomplete', 'off');
  // 16px stops iOS zooming; fixed + opacity 0 keeps it out of sight and out of layout.
  el.style.cssText = 'position:fixed;bottom:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;border:0;padding:0;';
  document.body.appendChild(el);
  el.focus({ preventScroll: true });
  primer = el;
  // Safety net if the sheet never opens.
  setTimeout(() => {
    if (primer === el && document.activeElement !== el) releasePrimer();
  }, 1500);
}

export function releasePrimer(): void {
  if (primer) {
    primer.remove();
    primer = null;
  }
}

/** Between steps: park focus on a hidden input so focus never drops and the keyboard stays open. */
export function holdKeyboard(proxy: HTMLInputElement | null): void {
  if (typeof document === 'undefined' || !proxy) return;
  const active = document.activeElement;
  if (active && active.tagName === 'INPUT') proxy.focus({ preventScroll: true });
}
