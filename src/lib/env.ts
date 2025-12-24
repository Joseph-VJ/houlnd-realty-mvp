export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function getUnlockFeeInr() {
  const raw = process.env.UNLOCK_FEE_INR;
  const parsed = raw ? Number(raw) : 99;
  if (!Number.isFinite(parsed) || parsed <= 0) return 99;
  return Math.trunc(parsed);
}

export function isRazorpayEnabled() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
