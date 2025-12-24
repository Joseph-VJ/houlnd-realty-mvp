export function maskPhoneE164(phoneE164: string) {
  const trimmed = phoneE164.trim();
  if (!trimmed) return "";

  // Keep leading '+' and country code-ish prefix, then mask middle.
  // Example: +919876543210 -> +91******10
  const plus = trimmed.startsWith("+");
  const digits = plus ? trimmed.slice(1) : trimmed;

  if (digits.length <= 4) {
    return plus ? `+${"*".repeat(digits.length)}` : "*".repeat(digits.length);
  }

  const prefixLen = Math.min(2, digits.length - 2);
  const suffixLen = 2;
  const prefix = digits.slice(0, prefixLen);
  const suffix = digits.slice(-suffixLen);
  const masked = `${prefix}${"*".repeat(Math.max(0, digits.length - prefixLen - suffixLen))}${suffix}`;
  return plus ? `+${masked}` : masked;
}
