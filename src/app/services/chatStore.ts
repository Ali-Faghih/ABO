import type { ChatConversation, ChatMessage } from "../types";

const CONVERSATIONS_KEY = "abo_conversations";
const MESSAGES_KEY = "abo_messages";

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Conversations ─────────────────────────────────────────────────────────────

export function getConversations(): ChatConversation[] {
  return read<ChatConversation>(CONVERSATIONS_KEY);
}

export function getConversationsForUser(userId: string): ChatConversation[] {
  return getConversations().filter((c) => c.participants.includes(userId));
}

export function getConversationById(id: string): ChatConversation | null {
  return getConversations().find((c) => c.id === id) ?? null;
}

export function getConversationByRequestAndParticipants(requestId: string, donorId: string, hospitalId: string): ChatConversation | null {
  return getConversations().find((c) => c.requestId === requestId && c.donorId === donorId && c.hospitalId === hospitalId) ?? null;
}

export function getConversationsByRequest(requestId: string): ChatConversation[] {
  return getConversations().filter((c) => c.requestId === requestId);
}

export function addConversation(conv: ChatConversation): void {
  const all = getConversations();
  all.push(conv);
  write(CONVERSATIONS_KEY, all);
}

export function updateConversation(id: string, updates: Partial<ChatConversation>): void {
  const all = getConversations();
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) { all[idx] = { ...all[idx], ...updates }; write(CONVERSATIONS_KEY, all); }
}

// ─── Messages ──────────────────────────────────────────────────────────────────

export function getMessages(conversationId: string): ChatMessage[] {
  return read<ChatMessage>(MESSAGES_KEY).filter((m) => m.conversationId === conversationId);
}

export function addMessage(msg: ChatMessage): void {
  const all = read<ChatMessage>(MESSAGES_KEY);
  all.push(msg);
  write(MESSAGES_KEY, all);
}

// ─── Seed ──────────────────────────────────────────────────────────────────────

function seed(): void {
  if (read<ChatConversation>(CONVERSATIONS_KEY).length > 0) return;

  const seedConvs: ChatConversation[] = [
    { id: "CONV-001", participants: ["seed-donor-001", "HOSP-001"], hospitalId: "HOSP-001", hospitalName: "بیمارستان امام خمینی", donorId: "seed-donor-001", donorName: "علی محمدی", requestId: "REQ-001", lastMessage: "ممنون. لطفاً کارت ملی و آزمایش اخیر همراه داشته باشید", lastMessageTime: "۱۰:۳۵", unread: 1 },
  ];

  write(CONVERSATIONS_KEY, seedConvs);

  const seedMessages: ChatMessage[] = [
    { id: "MSG-001", conversationId: "CONV-001", senderId: "HOSP-001", text: "سلام، آیا آمادگی اهدای خون دارید؟", timestamp: "۱۰:۰۰" },
    { id: "MSG-002", conversationId: "CONV-001", senderId: "seed-donor-001", text: "بله، گروه خونی O+ دارم و آماده‌ام", timestamp: "۱۰:۰۵" },
    { id: "MSG-003", conversationId: "CONV-001", senderId: "HOSP-001", text: "عالی! آیا فردا ساعت ۹ می‌توانید تشریف بیاورید؟", timestamp: "۱۰:۱۵" },
    { id: "MSG-004", conversationId: "CONV-001", senderId: "HOSP-001", text: "آدرس: خیابان ولیعصر، بیمارستان امام خمینی، طبقه اول", timestamp: "۱۰:۱۶" },
    { id: "MSG-005", conversationId: "CONV-001", senderId: "seed-donor-001", text: "بسیار خب، فردا ساعت ۹ حضور خواهم داشت", timestamp: "۱۰:۳۰" },
    { id: "MSG-006", conversationId: "CONV-001", senderId: "HOSP-001", text: "ممنون. لطفاً کارت ملی و آزمایش اخیر همراه داشته باشید", timestamp: "۱۰:۳۵" },
  ];

  write(MESSAGES_KEY, seedMessages);
}

seed();
