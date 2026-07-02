const COMPATIBILITY: Record<string, string[]> = {
  "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+":  ["O+", "A+", "B+", "AB+"],
  "A-":  ["A-", "A+", "AB-", "AB+"],
  "A+":  ["A+", "AB+"],
  "B-":  ["B-", "B+", "AB-", "AB+"],
  "B+":  ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export function canDonateTo(donorBloodType: string, recipientBloodType: string): boolean {
  const targets = COMPATIBILITY[donorBloodType];
  if (!targets) return false;
  return targets.includes(recipientBloodType);
}
