import { Router } from "express";
import { getDb, saveDb, queryAll } from "../db.js";

const router = Router();

// ─── Registry Donors ──────────────────────────────────────────────────────────

router.get("/donors", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT * FROM registry_donors ORDER BY lastName, firstName");
  const donors = rows.length ? rows[0].values.map((r: any, i: number) => {
    const obj: any = {};
    rows[0].columns.forEach((c: string, j: number) => { obj[c] = r[j]; });
    return obj;
  }) : [];
  res.json(donors);
});

router.get("/donors/:nationalId", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM registry_donors WHERE nationalId=?", [req.params.nationalId]);
  if (!rows.length || !rows[0].values.length) return res.status(404).json({ error: "not found" });
  const obj: any = {};
  rows[0].columns.forEach((c: string, i: number) => { obj[c] = rows[0].values[0][i]; });
  res.json(obj);
});

router.post("/donors", (req, res) => {
  const { nationalId, firstName, lastName, birthDate, phone, gender } = req.body;
  if (!nationalId) return res.status(400).json({ error: "nationalId required" });
  const db = getDb();
  db.run("INSERT OR REPLACE INTO registry_donors VALUES (?,?,?,?,?,?)", [nationalId, firstName || "", lastName || "", birthDate || "", phone || "", gender || ""]);
  saveDb();
  res.json({ nationalId, firstName, lastName, birthDate, phone, gender });
});

router.put("/donors/:nationalId", (req, res) => {
  const db = getDb();
  const fields = ["firstName","lastName","birthDate","phone","gender"];
  const sets = fields.filter((f) => req.body[f] !== undefined).map((f) => `${f}=?`);
  const params = fields.filter((f) => req.body[f] !== undefined).map((f) => req.body[f]);
  if (!sets.length) return res.status(400).json({ error: "no fields" });
  params.push(req.params.nationalId);
  db.run(`UPDATE registry_donors SET ${sets.join(", ")} WHERE nationalId=?`, params);
  saveDb();
  const rows = queryAll("SELECT * FROM registry_donors WHERE nationalId=?", [req.params.nationalId]);
  const obj: any = {};
  rows[0].columns.forEach((c: string, i: number) => { obj[c] = rows[0].values[0][i]; });
  res.json(obj);
});

router.delete("/donors/:nationalId", (req, res) => {
  const db = getDb();
  db.run("DELETE FROM registry_donors WHERE nationalId=?", [req.params.nationalId]);
  saveDb();
  res.json({ success: true });
});

// ─── Registry Hospitals ───────────────────────────────────────────────────────

router.get("/hospitals", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT * FROM registry_hospitals ORDER BY city, name");
  const hospitals = rows.length ? rows[0].values.map((r: any, i: number) => {
    const obj: any = {};
    rows[0].columns.forEach((c: string, j: number) => { obj[c] = r[j]; });
    return obj;
  }) : [];
  res.json(hospitals);
});

router.get("/hospitals/:hospitalId", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM registry_hospitals WHERE hospitalId=?", [req.params.hospitalId]);
  if (!rows.length || !rows[0].values.length) return res.status(404).json({ error: "not found" });
  const obj: any = {};
  rows[0].columns.forEach((c: string, i: number) => { obj[c] = rows[0].values[0][i]; });
  res.json(obj);
});

router.post("/hospitals", (req, res) => {
  const { hospitalId, name, type, city, province, licenseNumber, address } = req.body;
  if (!hospitalId) return res.status(400).json({ error: "hospitalId required" });
  const db = getDb();
  db.run("INSERT OR REPLACE INTO registry_hospitals VALUES (?,?,?,?,?,?,?)", [hospitalId, name || "", type || "", city || "", province || "", licenseNumber || "", address || ""]);
  saveDb();
  res.json({ hospitalId, name, type, city, province, licenseNumber, address });
});

router.put("/hospitals/:hospitalId", (req, res) => {
  const db = getDb();
  const fields = ["name","type","city","province","licenseNumber","address"];
  const sets = fields.filter((f) => req.body[f] !== undefined).map((f) => `${f}=?`);
  const params = fields.filter((f) => req.body[f] !== undefined).map((f) => req.body[f]);
  if (!sets.length) return res.status(400).json({ error: "no fields" });
  params.push(req.params.hospitalId);
  db.run(`UPDATE registry_hospitals SET ${sets.join(", ")} WHERE hospitalId=?`, params);
  saveDb();
  const rows = queryAll("SELECT * FROM registry_hospitals WHERE hospitalId=?", [req.params.hospitalId]);
  const obj: any = {};
  rows[0].columns.forEach((c: string, i: number) => { obj[c] = rows[0].values[0][i]; });
  res.json(obj);
});

router.delete("/hospitals/:hospitalId", (req, res) => {
  const db = getDb();
  db.run("DELETE FROM registry_hospitals WHERE hospitalId=?", [req.params.hospitalId]);
  saveDb();
  res.json({ success: true });
});

export default router;
