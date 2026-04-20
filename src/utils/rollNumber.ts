export function normalizeRollNumber(input: string) {
  // Remove ALL whitespace and uppercase
  return input.replace(/\s+/g, "").toUpperCase();
}

export function rollNumberToEmail(rollNumber: string) {
  return `${normalizeRollNumber(rollNumber)}@campus.local`.toLowerCase();
}

