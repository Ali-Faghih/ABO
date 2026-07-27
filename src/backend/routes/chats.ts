import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getDb, saveDb, queryAll } from "../db.js";

const router = Router();

function getHospitalUserId(hospitalCode: string): string | null {
  const db = getDb();
  const rows = queryAll("SELECT id FROM users WHERE username=? AND type='hospital'", [hospitalCode]);
  return (rows.length && rows[0].values.length) ? rows[0].values[0][0] as string : null;
}

function mapConversation(row: any, cols: string[]) {
  const obj: any = {};
  cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
  return obj;
}

function enrichConversation(conv: any) {
  try {
    if (conv.hospitalId) {
      const h = queryAll("SELECT name FROM hospital_profiles WHERE hospitalId=?", [conv.hospitalId]);
      if (h.length && h[0].values.length) conv.hospitalName = h[0].values[0][0] as string;
    }
    if (conv.donorId) {
      const d = queryAll("SELECT firstName, lastName FROM donor_profiles WHERE userId=?", [conv.donorId]);
      if (d.length && d[0].values.length) conv.donorName = `${d[0].values[0][0]} ${d[0].values[0][1]}`;
    }
  } catch {}
  return conv;
}

router.get("/", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT * FROM conversations ORDER BY lastMessageTime DESC");
  const convs = rows.length ? rows[0].values.map((r: any) => enrichConversation(mapConversation(r, rows[0].columns))) : [];
  res.json(convs);
});

router.get("/user/:userId", (req, res) => {
  const db = getDb();
  const usernameRow = queryAll("SELECT username FROM users WHERE id=?", [req.params.userId]);
  const username = (usernameRow.length && usernameRow[0].values.length) ? usernameRow[0].values[0][0] as string : null;
  const params = username ? [req.params.userId, username, req.params.userId, username] : [req.params.userId, req.params.userId, req.params.userId, req.params.userId];
  const rows = queryAll("SELECT * FROM conversations WHERE hospitalId IN (?, ?) OR donorId IN (?, ?) ORDER BY lastMessageTime DESC", params);
  const convs = rows.length ? rows[0].values.map((r: any) => enrichConversation(mapConversation(r, rows[0].columns))) : [];
  res.json(convs);
});

router.get("/:id", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM conversations WHERE id=?", [req.params.id]);
  if (!rows.length || !rows[0].values.length) return res.status(404).json({ error: "not found" });
  res.json(enrichConversation(mapConversation(rows[0].values[0], rows[0].columns)));
});

router.get("/:id/messages", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM messages WHERE conversationId=? ORDER BY timestamp ASC", [req.params.id]);
  const msgs = rows.length ? rows[0].values.map((r: any, i: number) => {
    const obj: any = {};
    rows[0].columns.forEach((c: string, j: number) => { obj[c] = r[j]; });
    return obj;
  }) : [];
  res.json(msgs);
});

router.post("/", (req, res) => {
  const { hospitalId, donorId, requestId } = req.body;
  const id = `CONV-${Date.now()}`;
  const db = getDb();
  db.run("INSERT INTO conversations VALUES (?,?,?,?,?,?,?)", [id, hospitalId, donorId, requestId || "", "", "", 0]);
  saveDb();
  const conv = queryAll("SELECT * FROM conversations WHERE id=?", [id]);
  res.json(enrichConversation(mapConversation(conv[0].values[0], conv[0].columns)));
});

router.post("/:id/messages", (req, res) => {
  const { senderId, text } = req.body;
  const id = `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const db = getDb();
  db.run("INSERT INTO messages VALUES (?,?,?,?,?)", [id, req.params.id, senderId, text, timestamp]);
  db.run("UPDATE conversations SET lastMessage=?, lastMessageTime=?, unread=unread+1 WHERE id=?", [text, timestamp, req.params.id]);
  // Notify the other participant
  const conv = queryAll("SELECT * FROM conversations WHERE id=?", [req.params.id]);
  if (conv.length && conv[0].values.length) {
    const cols = conv[0].columns;
    const vals = conv[0].values[0];
    const convObj: any = {};
    cols.forEach((c: string, i: number) => { convObj[c] = vals[i]; });
    // Determine recipient: compare senderId against hospital's UUID (resolved from code)
    const hospitalUserId = getHospitalUserId(convObj.hospitalId);
    const isSenderHospital = senderId === hospitalUserId;
    const notifUserId = isSenderHospital ? convObj.donorId : (hospitalUserId || convObj.hospitalId);
    const nid = `NOTIF-${notifUserId}-${Date.now()}`;
    const shortText = text.length > 80 ? text.slice(0, 80) + "..." : text;
    db.run("INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?)", [nid, notifUserId, "message", "پیام جدید", shortText, timestamp, 0, "conversation", req.params.id]);
    saveDb();
  }
  saveDb();
  res.json({ id, conversationId: req.params.id, senderId, text, timestamp });
});

router.put("/:id/read", (req, res) => {
  const db = getDb();
  db.run("UPDATE conversations SET unread=0 WHERE id=?", [req.params.id]);
  saveDb();
  res.json({ success: true });
});

export default router;
