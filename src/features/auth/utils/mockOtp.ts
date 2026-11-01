import type { PhoneNumber } from "@/features/auth/components/AuthSheet";

/** Prototype only — no SMS. Any 6-digit code works. Replace with a real OTP API. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockSendCode(_phone: PhoneNumber): Promise<void> {
  await delay(400);
}

export async function mockVerifyCode(
  _phone: PhoneNumber,
  code: string,
): Promise<boolean> {
  await delay(400);
  return /^\d{6}$/.test(code);
}
