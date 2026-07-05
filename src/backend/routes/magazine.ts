import { Router } from "express";
import { v4 as uuid } from "uuid";
import { getDb, saveDb, queryAll } from "../db.js";

const router = Router();

function mapArticle(row: any, cols: string[]) {
  const obj: any = {};
  cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
  try { obj.tags = JSON.parse(obj.tags || "[]"); } catch { obj.tags = []; }
  return obj;
}

router.get("/", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT * FROM articles WHERE status='published' ORDER BY publishDate DESC");
  const articles = rows.length ? rows[0].values.map((r: any) => mapArticle(r, rows[0].columns)) : [];
  res.json(articles);
});

router.get("/categories", (req, res) => {
  const db = getDb();
  const rows = db.exec("SELECT DISTINCT category FROM articles WHERE status='published' AND category!=''");
  const cats = rows.length ? rows[0].values.map((r: any) => r[0]) : [];
  res.json(cats);
});

router.get("/:id", (req, res) => {
  const db = getDb();
  db.run("UPDATE articles SET readCount=readCount+1 WHERE id=?", [req.params.id]);
  saveDb();
  const rows = queryAll("SELECT * FROM articles WHERE id=?", [req.params.id]);
  if (!rows.length || !rows[0].values.length) return res.status(404).json({ error: "not found" });
  res.json(mapArticle(rows[0].values[0], rows[0].columns));
});

export default router;
