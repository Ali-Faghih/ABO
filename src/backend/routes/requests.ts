import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getDb, saveDb, queryAll } from "../db.js";

const router = Router();

const VALID_REQ_STATUS = new Set(["active", "matched", "completed", "cancelled"]);
const ALLOWED_REQ_TRANSITIONS: Record<string, Set<string>> = {
  active: new Set(["matched", "cancelled"]),
  matched: new Set(["completed", "cancelled"]),
  completed: new Set([]),
  cancelled: new Set([]),
};
const VALID_APPT_TRANSITIONS: Record<string, Set<string>> = {
  pending: new Set(["confirmed", "cancelled"]),
  invited: new Set(["confirmed", "cancelled"]),
  confirmed: new Set(["completed", "cancelled"]),
  completed: new Set([]),
  cancelled: new Set([]),
};

function mapRequest(row: any, cols: string[]) {
  const obj: any = {};
  cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
  return obj;
}

// ─── Requests ─────────────────────────────────────────────────────────────────

router.get("/", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT * FROM requests ORDER BY createdAt DESC");
  const requests = rows.length ? rows[0].values.map((r: any) => mapRequest(r, rows[0].columns)) : [];
  res.json(requests);
});

router.get("/active", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT * FROM requests WHERE status='active' OR status='matched' ORDER BY createdAt DESC");
  const requests = rows.length ? rows[0].values.map((r: any) => mapRequest(r, rows[0].columns)) : [];
  res.json(requests);
});

router.get("/hospital/:hospitalId", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM requests WHERE hospitalId=? ORDER BY createdAt DESC", [req.params.hospitalId]);
  const requests = rows.length ? rows[0].values.map((r: any) => mapRequest(r, rows[0].columns)) : [];
  res.json(requests);
});

router.get("/:id", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM requests WHERE id=?", [req.params.id]);
  if (!rows.length || !rows[0].values.length) return res.status(404).json({ error: "not found" });
  res.json(mapRequest(rows[0].values[0], rows[0].columns));
});

router.post("/", (req, res) => {
  const { hospitalId, hospitalName, bloodType, units, urgency, deadline, city, notes } = req.body;
  if (!hospitalId || !bloodType) return res.status(400).json({ error: "hospitalId and bloodType required" });
  const id = `REQ-${Date.now()}`;
  const now = new Date().toLocaleDateString("fa-IR");
  const db = getDb();
  db.run("INSERT INTO requests VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [
    id, hospitalId, hospitalName || "", bloodType, units || 1, urgency || "معمولی",
    deadline || "", "active", 0, city || "", now, notes || "",
  ]);
  saveDb();
  res.json({ id, hospitalId, hospitalName, bloodType, units: units || 1, urgency: urgency || "معمولی", deadline: deadline || "", status: "active", matched: 0, city: city || "", createdAt: now, notes: notes || "" });
});

router.put("/:id", (req, res) => {
  const db = getDb();
  const existing = queryAll("SELECT * FROM requests WHERE id=?", [req.params.id]);
  if (!existing.length || !existing[0].values.length) return res.status(404).json({ error: "not found" });
  const prev = mapRequest(existing[0].values[0], existing[0].columns);

  const updates: any = {};
  if (req.body.units !== undefined) updates.units = req.body.units;
  if (req.body.urgency !== undefined) updates.urgency = req.body.urgency;
  if (req.body.deadline !== undefined) updates.deadline = req.body.deadline;
  if (req.body.notes !== undefined) updates.notes = req.body.notes;
  if (req.body.matched !== undefined) updates.matched = req.body.matched;
  if (req.body.status) {
    const allowed = ALLOWED_REQ_TRANSITIONS[prev.status];
    if (!allowed || !allowed.has(req.body.status)) return res.status(400).json({ error: "invalid status transition" });
    updates.status = req.body.status;
  }

  const sets = Object.keys(updates).map((k) => `${k}=?`);
  const params = Object.values(updates);
  if (!sets.length) return res.status(400).json({ error: "no fields to update" });
  params.push(req.params.id);
  db.run(`UPDATE requests SET ${sets.join(", ")} WHERE id=?`, params);
  saveDb();

  const fresh = queryAll("SELECT * FROM requests WHERE id=?", [req.params.id]);
  res.json(fresh.length ? mapRequest(fresh[0].values[0], fresh[0].columns) : prev);
});

router.delete("/:id", (req, res) => {
  const db = getDb();
  db.run("UPDATE requests SET status='cancelled' WHERE id=?", [req.params.id]);
  saveDb();
  res.json({ success: true });
});

// ─── Appointments ─────────────────────────────────────────────────────────────

function mapAppointment(row: any, cols: string[]) {
  const obj: any = {};
  cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
  return obj;
}

router.get("/:requestId/appointments", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM appointments WHERE requestId=?", [req.params.requestId]);
  const appts = rows.length ? rows[0].values.map((r: any) => mapAppointment(r, rows[0].columns)) : [];
  res.json(appts);
});

router.get("/appointments/donor/:donorId", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM appointments WHERE donorId=? ORDER BY createdAt DESC", [req.params.donorId]);
  const appts = rows.length ? rows[0].values.map((r: any) => mapAppointment(r, rows[0].columns)) : [];
  res.json(appts);
});

router.get("/appointments/hospital/:hospitalId", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM appointments WHERE hospitalId=? ORDER BY createdAt DESC", [req.params.hospitalId]);
  const appts = rows.length ? rows[0].values.map((r: any) => mapAppointment(r, rows[0].columns)) : [];
  res.json(appts);
});

router.post("/:requestId/appointments", (req, res) => {
  const { donorId, donorName, hospitalId, hospitalName, bloodType, date, time } = req.body;
  const id = `APT-${Date.now()}`;
  const now = new Date().toLocaleDateString("fa-IR");
  const db = getDb();
  db.run("INSERT INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [id, req.params.requestId, donorId, donorName || "", hospitalId, hospitalName || "", bloodType || "", date, time, "pending", now, "donor"]);
  saveDb();
  res.json({ id, requestId: req.params.requestId, donorId, donorName, hospitalId, hospitalName, bloodType, date, time, status: "pending", createdAt: now, initiator: "donor" });
});

router.put("/appointments/:appointmentId", (req, res) => {
  const db = getDb();
  const existing = queryAll("SELECT * FROM appointments WHERE id=?", [req.params.appointmentId]);
  if (!existing.length || !existing[0].values.length) return res.status(404).json({ error: "not found" });
  const prev = mapAppointment(existing[0].values[0], existing[0].columns);

  if (req.body.status) {
    const allowed = VALID_APPT_TRANSITIONS[prev.status];
    if (!allowed || !allowed.has(req.body.status)) return res.status(400).json({ error: "invalid status transition" });
    db.run("UPDATE appointments SET status=? WHERE id=?", [req.body.status, req.params.appointmentId]);
    saveDb();
  }

  const fresh = queryAll("SELECT * FROM appointments WHERE id=?", [req.params.appointmentId]);
  res.json(fresh.length ? mapAppointment(fresh[0].values[0], fresh[0].columns) : prev);
});

// ─── Hospital-initiated invitations ─────────────────────────────────────────
router.post("/appointments/invite", (req, res) => {
  const { requestId, donorId, donorName, hospitalId, hospitalName, bloodType, date, time } = req.body;
  if (!requestId || !donorId || !hospitalId || !date || !time) return res.status(400).json({ error: "missing required fields" });
  const id = `INV-${Date.now()}`;
  const now = new Date().toLocaleDateString("fa-IR");
  const db = getDb();
  db.run("INSERT INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [id, requestId, donorId, donorName || "", hospitalId, hospitalName || "", bloodType || "", date, time, "invited", now, "hospital"]);
  saveDb();
  // Create notification for donor
  const notifId = `NOTIF-${donorId}-${Date.now()}`;
  const notifTime = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  db.run("INSERT INTO notifications VALUES (?,?,?,?,?,?,?)", [notifId, donorId, "appointment", "دعوتنامه نوبت", `بیمارستان ${hospitalName} از شما برای تاریخ ${date} ساعت ${time} دعوت به اهدای خون کرده است.`, notifTime, 0]);
  saveDb();
  res.json({ id, requestId, donorId, donorName, hospitalId, hospitalName, bloodType, date, time, status: "invited", createdAt: now, initiator: "hospital" });
});

router.get("/invitations/donor/:donorId", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM appointments WHERE donorId=? AND initiator='hospital' AND status='invited' ORDER BY createdAt DESC", [req.params.donorId]);
  const appts = rows.length ? rows[0].values.map((r: any) => mapAppointment(r, rows[0].columns)) : [];
  res.json(appts);
});

router.put("/appointments/invitation/:id/respond", (req, res) => {
  const { status } = req.body; // "confirmed" or "cancelled"
  if (!status || !["confirmed", "cancelled"].includes(status)) return res.status(400).json({ error: "status must be confirmed or cancelled" });
  const db = getDb();
  const existing = queryAll("SELECT * FROM appointments WHERE id=? AND initiator='hospital'", [req.params.id]);
  if (!existing.length || !existing[0].values.length) return res.status(404).json({ error: "invitation not found" });
  const prev = mapAppointment(existing[0].values[0], existing[0].columns);
  if (prev.status !== "invited") return res.status(400).json({ error: "invitation already responded" });

  db.run("UPDATE appointments SET status=? WHERE id=?", [status, req.params.id]);
  saveDb();

  // Notify hospital of response
  const notifId = `NOTIF-${prev.hospitalId}-${Date.now()}`;
  const notifTime = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const title = status === "confirmed" ? "دعوتنامه تأیید شد" : "دعوتنامه رد شد";
  const msg = status === "confirmed"
    ? `داوطلب ${prev.donorName} دعوت شما برای تاریخ ${prev.date} ساعت ${prev.time} را پذیرفت.`
    : `داوطلب ${prev.donorName} دعوت شما برای تاریخ ${prev.date} را رد کرد.`;
  db.run("INSERT INTO notifications VALUES (?,?,?,?,?,?,?)", [notifId, prev.hospitalId, "appointment", title, msg, notifTime, 0]);
  saveDb();

  const fresh = queryAll("SELECT * FROM appointments WHERE id=?", [req.params.id]);
  res.json(fresh.length ? mapAppointment(fresh[0].values[0], fresh[0].columns) : prev);
});

router.get("/booked-slots/:hospitalId", (req, res) => {
  const db = getDb();
  const date = req.query.date as string;
  if (!date) return res.status(400).json({ error: "date query parameter required" });
  const rows = queryAll("SELECT time FROM appointments WHERE hospitalId=? AND date=? AND status!='cancelled'", [req.params.hospitalId, date]);
  const slots = rows.length ? rows[0].values.map((r: any) => r[0]) : [];
  res.json(slots);
});

export default router;
