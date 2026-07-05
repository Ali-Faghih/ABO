import { api } from "./api";
import type { ChatConversation, ChatMessage } from "../types";

function mapConv(c: any): ChatConversation {
  return {
    id: c.id,
    participants: c.participants || [],
    hospitalId: c.hospitalId,
    hospitalName: c.hospitalName || "",
    donorId: c.donorId,
    donorName: c.donorName || "",
    requestId: c.requestId || "",
    lastMessage: c.lastMessage || "",
    lastMessageTime: c.lastMessageTime || "",
    unread: c.unread || 0,
  };
}

export async function getConversations(): Promise<ChatConversation[]> {
  const convs = await api<any[]>("GET", "/chats");
  return convs.map(mapConv);
}

export async function getConversationsForUser(userId: string): Promise<ChatConversation[]> {
  const convs = await api<any[]>("GET", `/chats/user/${userId}`);
  return convs.map(mapConv);
}

export async function getConversationById(id: string): Promise<ChatConversation | null> {
  try {
    const c = await api<any>("GET", `/chats/${id}`);
    return mapConv(c);
  } catch {
    return null;
  }
}

export async function getConversationByRequestAndParticipants(
  requestId: string, donorId: string, hospitalId: string
): Promise<ChatConversation | null> {
  const convs = await getConversations();
  return convs.find((c) => c.requestId === requestId && c.donorId === donorId && c.hospitalId === hospitalId) || null;
}

export async function getConversationsByRequest(requestId: string): Promise<ChatConversation[]> {
  const convs = await getConversations();
  return convs.filter((c) => c.requestId === requestId);
}

export async function addConversation(conv: ChatConversation): Promise<void> {
  await api("POST", "/chats", {
    hospitalId: conv.hospitalId,
    donorId: conv.donorId,
    requestId: conv.requestId,
  });
}

export async function updateConversation(id: string, updates: Partial<ChatConversation>): Promise<void> {
  if (updates.unread !== undefined) {
    await api("PUT", `/chats/${id}/read`);
  }
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  return api<ChatMessage[]>("GET", `/chats/${conversationId}/messages`);
}

export async function addMessage(msg: ChatMessage): Promise<void> {
  await api("POST", `/chats/${msg.conversationId}/messages`, {
    senderId: msg.senderId,
    text: msg.text,
  });
}
