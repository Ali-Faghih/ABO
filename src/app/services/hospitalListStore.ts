import { getListedHospitalIds, isHospitalListed, setHospitalListed } from "../db/hospitals";

// ─── Re-exports (backward compat) ──────────────────────────────────────────────
export { getListedHospitalIds, isHospitalListed };

export function addToListed(hospitalId: string): void {
  setHospitalListed(hospitalId, true);
}

export function removeFromListed(hospitalId: string): void {
  setHospitalListed(hospitalId, false);
}
