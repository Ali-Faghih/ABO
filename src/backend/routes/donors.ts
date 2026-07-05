import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getDb, saveDb, queryAll } from "../db.js";

const router = Router();

function getProfile(userId: string) {
  const db = getDb();
  const rows = queryAll("SELECT * FROM donor_profiles WHERE userId = ?", [userId]);
  if (!rows.length || !rows[0].values.length) return null;
  const cols = rows[0].columns;
  const vals = rows[0].values[0];
  const obj: any = {};
  cols.forEach((c: string, i: number) => { obj[c] = vals[i]; });
  return {
    ...obj,
    readinessAvailable: !!obj.readinessAvailable,
    eligible: !!obj.eligible,
  };
}

router.get("/", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT userId FROM donor_profiles ORDER BY joinDate DESC");
  const profiles = rows.length ? rows[0].values.map((r: any) => getProfile(r[0])).filter(Boolean) : [];
  res.json(profiles);
});

router.get("/:id", (req, res) => {
  const profile = getProfile(req.params.id);
  if (!profile) return res.status(404).json({ error: "not found" });
  res.json(profile);
});

router.put("/:id", (req, res) => {
  const db = getDb();
  const { firstName, lastName, phone, city, province, address, weight, height, bloodType, eligible, nextEligible, lastDonation, donations, gender, diseaseName, medicationName } = req.body;
  const sets: string[] = [];
  const params: any[] = [];
  if (firstName !== undefined) { sets.push("firstName=?"); params.push(firstName); }
  if (lastName !== undefined) { sets.push("lastName=?"); params.push(lastName); }
  if (phone !== undefined) { sets.push("phone=?"); params.push(phone); }
  if (city !== undefined) { sets.push("city=?"); params.push(city); }
  if (province !== undefined) { sets.push("province=?"); params.push(province); }
  if (address !== undefined) { sets.push("address=?"); params.push(address); }
  if (weight !== undefined) { sets.push("weight=?"); params.push(weight); }
  if (height !== undefined) { sets.push("height=?"); params.push(height); }
  if (bloodType !== undefined) { sets.push("bloodType=?"); params.push(bloodType); }
  if (eligible !== undefined) { sets.push("eligible=?"); params.push(eligible ? 1 : 0); }
  if (nextEligible !== undefined) { sets.push("nextEligible=?"); params.push(nextEligible); }
  if (lastDonation !== undefined) { sets.push("lastDonation=?"); params.push(lastDonation); }
  if (donations !== undefined) { sets.push("donations=?"); params.push(donations); }
  if (gender !== undefined) { sets.push("gender=?"); params.push(gender); }
  if (diseaseName !== undefined) { sets.push("diseaseName=?"); params.push(diseaseName); }
  if (medicationName !== undefined) { sets.push("medicationName=?"); params.push(medicationName); }
  if (!sets.length) return res.status(400).json({ error: "no fields to update" });
  params.push(req.params.id);
  db.run(`UPDATE donor_profiles SET ${sets.join(", ")} WHERE userId=?`, params);
  saveDb();
  res.json(getProfile(req.params.id));
});

// ─── Readiness ────────────────────────────────────────────────────────────────

router.put("/:id/readiness", (req, res) => {
  const { available } = req.body;
  const db = getDb();
  const date = available ? new Date().toLocaleDateString("fa-IR") : null;
  db.run("UPDATE donor_profiles SET readinessAvailable=?, readinessDate=? WHERE userId=?", [available ? 1 : 0, date, req.params.id]);
  saveDb();
  res.json(getProfile(req.params.id));
});

router.get("/available/list", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT userId FROM donor_profiles WHERE readinessAvailable=1 ORDER BY readinessDate DESC");
  const profiles = rows.length ? rows[0].values.map((r: any) => getProfile(r[0])).filter(Boolean) : [];
  const { bloodType, city } = req.query;
  const filtered = profiles.filter((p: any) => {
    if (bloodType && p.bloodType !== bloodType) return false;
    if (city && p.city !== city) return false;
    return true;
  });
  res.json(filtered);
});

// ─── Notifications ────────────────────────────────────────────────────────────

router.get("/:id/notifications", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM notifications WHERE userId=? ORDER BY time DESC", [req.params.id]);
  const notifs = rows.length ? rows[0].values.map((r: any, i: number) => {
    const cols = rows[0].columns;
    const obj: any = {};
    cols.forEach((c: string, j: number) => { obj[c] = r[j]; });
    obj.read = !!obj.read;
    return obj;
  }) : [];
  res.json(notifs);
});

router.post("/:id/notifications", (req, res) => {
  const { type, title, message } = req.body;
  const id = `NOTIF-${req.params.id}-${Date.now()}`;
  const time = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const db = getDb();
  db.run("INSERT INTO notifications VALUES (?,?,?,?,?,?,?)", [id, req.params.id, type || "system", title || "", message || "", time, 0]);
  saveDb();
  res.json({ id, time });
});

router.put("/:id/notifications/read-all", (req, res) => {
  const db = getDb();
  db.run("UPDATE notifications SET read=1 WHERE userId=?", [req.params.id]);
  saveDb();
  res.json({ success: true });
});

export default router;
