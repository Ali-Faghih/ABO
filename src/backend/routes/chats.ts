import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getDb, saveDb, queryAll } from "../db.js";

const router = Router();

function mapConversation(row: any, cols: string[]) {
  const obj: any = {};
  cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
  return obj;
}

router.get("/", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT * FROM conversations ORDER BY lastMessageTime DESC");
  const convs = rows.length ? rows[0].values.map((r: any) => mapConversation(r, rows[0].columns)) : [];
  res.json(convs);
});

router.get("/user/:userId", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM conversations WHERE hospitalId=? OR donorId=? ORDER BY lastMessageTime DESC", [req.params.userId, req.params.userId]);
  const convs = rows.length ? rows[0].values.map((r: any) => mapConversation(r, rows[0].columns)) : [];
  res.json(convs);
});

router.get("/:id", (req, res) => {
  const db = getDb();
  const rows = queryAll("SELECT * FROM conversations WHERE id=?", [req.params.id]);
  if (!rows.length || !rows[0].values.length) return res.status(404).json({ error: "not found" });
  res.json(mapConversation(rows[0].values[0], rows[0].columns));
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
  res.json({ id, hospitalId, donorId, requestId: requestId || "", lastMessage: "", lastMessageTime: "", unread: 0 });
});

router.post("/:id/messages", (req, res) => {
  const { senderId, text } = req.body;
  const id = `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  const db = getDb();
  db.run("INSERT INTO messages VALUES (?,?,?,?,?)", [id, req.params.id, senderId, text, timestamp]);
  db.run("UPDATE conversations SET lastMessage=?, lastMessageTime=?, unread=unread+1 WHERE id=?", [text, timestamp, req.params.id]);
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
