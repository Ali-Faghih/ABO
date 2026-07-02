const LIST_KEY = "abo_listed_hospitals";

function read(): string[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    localStorage.removeItem(LIST_KEY);
    return [];
  }
}

function write(data: string[]): void {
  localStorage.setItem(LIST_KEY, JSON.stringify(data));
}

export function getListedHospitalIds(): string[] {
  return read();
}

export function isHospitalListed(hospitalId: string): boolean {
  return read().includes(hospitalId);
}

export function addToListed(hospitalId: string): void {
  const list = read();
  if (!list.includes(hospitalId)) { list.push(hospitalId); write(list); }
}

export function removeFromListed(hospitalId: string): void {
  write(read().filter((id) => id !== hospitalId));
}

function seed(): void {
  if (read().length > 0) return;
  write(["HOSP-001", "HOSP-003", "HOSP-004", "HOSP-005"]);
}

seed();
