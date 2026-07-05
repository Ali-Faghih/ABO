import { api } from "./api";

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  publishDate: string;
  readCount: number;
  status: string;
}

export async function getArticles(): Promise<Article[]> {
  return api<Article[]>("GET", "/magazine");
}

export async function getArticleById(id: string): Promise<Article> {
  return api<Article>("GET", `/magazine/${encodeURIComponent(id)}`);
}

export async function getArticleCategories(): Promise<string[]> {
  return api<string[]>("GET", "/magazine/categories");
}
