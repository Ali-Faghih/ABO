import { Router } from "express";
import bcryptjs from "bcryptjs";
import { v4 as uuid } from "uuid";
import { getDb, saveDb, queryAll } from "../db.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password, type } = req.body;
  if (!username || !password || !type) {
    return res.status(400).json({ error: "username, password, and type required" });
  }
  const db = getDb();
  const rows = queryAll("SELECT id, username, password, type FROM users WHERE username = ? AND type = ?", [username, type]);
  if (!rows.length || !rows[0].values.length) {
    return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
  }
  const [id, uname, hash, uType] = rows[0].values[0];
  const valid = bcryptjs.compareSync(password, hash as string);
  if (!valid) {
    return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
  }
  const token = uuid();
  // store session in memory for now
  (global as any).__sessions = (global as any).__sessions || {};
  (global as any).__sessions[token] = { userId: id, type: uType, username: uname };
  res.json({ token, userId: id, type: uType });
});

router.post("/register/donor", async (req, res) => {
  const { nationalId, phone, firstName, lastName, province, city, address, bloodType, weight, height, gender, password } = req.body;
  if (!nationalId || !password) return res.status(400).json({ error: "کد ملی و رمز عبور الزامی است" });
  const db = getDb();
  const existing = queryAll("SELECT id FROM users WHERE username = ?", [nationalId]);
  if (existing.length && existing[0].values.length) return res.status(409).json({ error: "این کد ملی قبلاً ثبت نام کرده است" });
  const id = uuid();
  const hash = await bcryptjs.hash(password, 10);
  const today = new Date().toLocaleDateString("fa-IR");
  db.run("INSERT INTO users VALUES (?,?,?,?,?)", [id, "donor", nationalId, hash, today]);
  db.run(`INSERT INTO donor_profiles VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    id, firstName || "", lastName || "", phone || "", "", gender || "male",
    city || "", province || "", address || "",
    weight || 0, height || 0, bloodType || "O+", "", "", 0, null, 1, null, null, today, 0,
  ]);
  saveDb();
  res.json({ success: true, userId: id });
});

router.post("/register/hospital", async (req, res) => {
  const { hospitalId, name, hospitalType, province, city, address, phone, licenseNumber, managerFirstName, managerLastName, managerNationalId, managerPosition, managerPhone, password } = req.body;
  if (!hospitalId || !password) return res.status(400).json({ error: "کد بیمارستان و رمز عبور الزامی است" });
  const db = getDb();
  const existing = queryAll("SELECT id FROM users WHERE username = ?", [hospitalId]);
  if (existing.length && existing[0].values.length) return res.status(409).json({ error: "این بیمارستان قبلاً ثبت نام کرده است" });
  const id = uuid();
  const hash = await bcryptjs.hash(password, 10);
  const today = new Date().toLocaleDateString("fa-IR");
  db.run("INSERT INTO users VALUES (?,?,?,?,?)", [id, "hospital", hospitalId, hash, today]);
  db.run(`INSERT INTO hospital_profiles VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    id, hospitalId, name || "", hospitalType || "", city || "", province || "",
    address || "", phone || "", licenseNumber || "",
    managerFirstName || "", managerLastName || "", managerNationalId || "", managerPosition || "", managerPhone || "",
    0, 0, 0, 0, 0, "", 0, today,
  ]);
  saveDb();
  res.json({ success: true, userId: id });
});

router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token && (global as any).__sessions) delete (global as any).__sessions[token];
  res.json({ success: true });
});

router.get("/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const session = token && (global as any).__sessions?.[token];
  if (!session) return res.status(401).json({ error: "unauthorized" });
  res.json(session);
});

router.get("/check/:username", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT id, type, username FROM users WHERE username = ?", [req.params.username]);
  if (!rows.length || !rows[0].values.length) return res.status(404).json({ exists: false });
  const [id, type, username] = rows[0].values[0];
  res.json({ exists: true, userId: id, type, username });
});

export default router;
