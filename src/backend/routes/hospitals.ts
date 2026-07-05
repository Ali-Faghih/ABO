import { Router } from "express";
import { getDb, saveDb, queryAll } from "../db.js";

const router = Router();

function getProfile(userId: string) {
  const db = getDb();
  const rows = queryAll("SELECT * FROM hospital_profiles WHERE userId = ?", [userId]);
  if (!rows.length || !rows[0].values.length) return null;
  const cols = rows[0].columns;
  const vals = rows[0].values[0];
  const obj: any = {};
  cols.forEach((c: string, i: number) => { obj[c] = vals[i]; });
  return { ...obj, isListed: !!obj.isListed };
}

router.get("/", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT userId FROM hospital_profiles ORDER BY joinDate DESC");
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
  const fields = ["name","hospitalType","city","province","address","phone","licenseNumber","managerFirstName","managerLastName","managerNationalId","managerPosition","managerPhone","activeRequests","totalDonors","totalDonations","rating","beds","founded"];
  const sets: string[] = [];
  const params: any[] = [];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) { sets.push(`${f}=?`); params.push(req.body[f]); }
  });
  if (!sets.length) return res.status(400).json({ error: "no fields to update" });
  params.push(req.params.id);
  db.run(`UPDATE hospital_profiles SET ${sets.join(", ")} WHERE userId=?`, params);
  saveDb();
  res.json(getProfile(req.params.id));
});

// ─── Listing ──────────────────────────────────────────────────────────────────

router.get("/listed/ids", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT hospitalId FROM hospital_profiles WHERE isListed=1");
  const ids = rows.length ? rows[0].values.map((r: any) => r[0]) : [];
  res.json(ids);
});

router.put("/:id/listing", (req, res) => {
  const { listed } = req.body;
  const db = getDb();
  db.run("UPDATE hospital_profiles SET isListed=? WHERE userId=?", [listed ? 1 : 0, req.params.id]);
  saveDb();
  res.json(getProfile(req.params.id));
});

export default router;
