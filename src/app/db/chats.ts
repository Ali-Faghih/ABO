import type { ChatConversation, ChatMessage } from "../types";
import { SEED_HOSPITALS } from "../services/registryDb";

const DB_KEY = "abo_db_chats";

export interface DbChat {
  id: string;
  participants: string[];
  hospitalId: string;
  hospitalName: string;
  donorId: string;
  donorName: string;
  requestId: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: ChatMessage[];
}

function read(): DbChat[] {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DbChat[];
  } catch {
    return [];
  }
}

function write(data: DbChat[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function migrateFromOldStorage(): void {
  const convKey = "abo_conversations";
  const msgKey = "abo_messages";
  if (!localStorage.getItem(convKey)) return;
  try {
    const convs: ChatConversation[] = JSON.parse(localStorage.getItem(convKey) || "[]");
    const msgs: ChatMessage[] = JSON.parse(localStorage.getItem(msgKey) || "[]");
    if (!Array.isArray(convs)) return;
    const chats: DbChat[] = convs.map((c) => ({
      ...c,
      messages: msgs.filter((m) => m.conversationId === c.id),
    }));
    if (chats.length > 0) write(chats);
    localStorage.removeItem(convKey);
    localStorage.removeItem(msgKey);
  } catch { /* skip migration */ }
}

migrateFromOldStorage();

function seedDemoChat(): void {
  if (read().length > 0) return;
  const h = SEED_HOSPITALS;
  const messages: ChatMessage[] = [
    { id: "MSG-001", conversationId: "CONV-001", senderId: h[0].hospitalId, text: "سلام، آیا آمادگی اهدای خون دارید؟", timestamp: "۱۰:۰۰" },
    { id: "MSG-002", conversationId: "CONV-001", senderId: "seed-donor-001", text: "بله، گروه خونی O+ دارم و آماده‌ام", timestamp: "۱۰:۰۵" },
    { id: "MSG-003", conversationId: "CONV-001", senderId: h[0].hospitalId, text: "عالی! آیا فردا ساعت ۹ می‌توانید تشریف بیاورید؟", timestamp: "۱۰:۱۵" },
    { id: "MSG-004", conversationId: "CONV-001", senderId: h[0].hospitalId, text: "آدرس: خیابان ولیعصر، بیمارستان امام خمینی، طبقه اول", timestamp: "۱۰:۱۶" },
    { id: "MSG-005", conversationId: "CONV-001", senderId: "seed-donor-001", text: "بسیار خب، فردا ساعت ۹ حضور خواهم داشت", timestamp: "۱۰:۳۰" },
    { id: "MSG-006", conversationId: "CONV-001", senderId: h[0].hospitalId, text: "ممنون. لطفاً کارت ملی و آزمایش اخیر همراه داشته باشید", timestamp: "۱۰:۳۵" },
  ];

  const chat: DbChat = {
    id: "CONV-001",
    participants: ["seed-donor-001", h[0].hospitalId],
    hospitalId: h[0].hospitalId,
    hospitalName: h[0].name,
    donorId: "seed-donor-001",
    donorName: "علی محمدی",
    requestId: "REQ-001",
    lastMessage: "ممنون. لطفاً کارت ملی و آزمایش اخیر همراه داشته باشید",
    lastMessageTime: "۱۰:۳۵",
    unread: 1,
    messages,
  };

  write([chat]);
}

seedDemoChat();

// ─── API ───────────────────────────────────────────────────────────────────────

export function getChats(): DbChat[] {
  return read();
}

export function getChatById(id: string): DbChat | null {
  return read().find((c) => c.id === id) ?? null;
}

export function getChatsForUser(userId: string): DbChat[] {
  return read().filter((c) => c.participants.includes(userId));
}

export function getChatByRequestAndParticipants(requestId: string, donorId: string, hospitalId: string): DbChat | null {
  return read().find((c) => c.requestId === requestId && c.donorId === donorId && c.hospitalId === hospitalId) ?? null;
}

export function getChatsByRequest(requestId: string): DbChat[] {
  return read().filter((c) => c.requestId === requestId);
}

export function addChat(chat: DbChat): void {
  const all = read();
  all.push(chat);
  write(all);
}

export function updateChat(id: string, updates: Partial<DbChat>): void {
  const all = read();
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) { all[idx] = { ...all[idx], ...updates }; write(all); }
}

export function addChatMessage(chatId: string, msg: ChatMessage): void {
  const all = read();
  const idx = all.findIndex((c) => c.id === chatId);
  if (idx < 0) return;
  all[idx].messages.push(msg);
  all[idx].lastMessage = msg.text;
  all[idx].lastMessageTime = msg.timestamp;
  write(all);
}

export function getChatMessages(chatId: string): ChatMessage[] {
  const c = getChatById(chatId);
  return c ? c.messages : [];
}

export function clearChatDb(): void {
  localStorage.removeItem(DB_KEY);
}
