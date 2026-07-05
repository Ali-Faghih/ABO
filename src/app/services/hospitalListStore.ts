import { api } from "./api";

export async function getListedHospitalIds(): Promise<string[]> {
  return api<string[]>("GET", "/hospitals/listed/ids");
}

export async function isHospitalListed(hospitalId: string): Promise<boolean> {
  const ids = await getListedHospitalIds();
  return ids.includes(hospitalId);
}

export async function addToListed(hospitalUserId: string): Promise<void> {
  await api("PUT", `/hospitals/${hospitalUserId}/listing`, { listed: true });
}

export async function removeFromListed(hospitalUserId: string): Promise<void> {
  await api("PUT", `/hospitals/${hospitalUserId}/listing`, { listed: false });
}
