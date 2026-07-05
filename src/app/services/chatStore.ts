import { getChats, getChatById, getChatsForUser, getChatByRequestAndParticipants, getChatsByRequest, addChat, updateChat, addChatMessage, getChatMessages, clearChatDb } from "../db/chats";
import type { ChatConversation, ChatMessage } from "../types";

// ─── Re-export db functions as-is ──────────────────────────────────────────────
export { getChats, getChatById, getChatsForUser, getChatByRequestAndParticipants, getChatsByRequest, addChat, addChatMessage, getChatMessages };

export function getConversations(): ChatConversation[] {
  return getChats().map((c) => ({
    id: c.id,
    participants: c.participants,
    hospitalId: c.hospitalId,
    hospitalName: c.hospitalName,
    donorId: c.donorId,
    donorName: c.donorName,
    requestId: c.requestId,
    lastMessage: c.lastMessage,
    lastMessageTime: c.lastMessageTime,
    unread: c.unread,
  }));
}

export function getConversationsForUser(userId: string): ChatConversation[] {
  return getChatsForUser(userId).map((c) => ({
    id: c.id,
    participants: c.participants,
    hospitalId: c.hospitalId,
    hospitalName: c.hospitalName,
    donorId: c.donorId,
    donorName: c.donorName,
    requestId: c.requestId,
    lastMessage: c.lastMessage,
    lastMessageTime: c.lastMessageTime,
    unread: c.unread,
  }));
}

export function getConversationById(id: string): ChatConversation | null {
  const c = getChatById(id);
  if (!c) return null;
  return {
    id: c.id,
    participants: c.participants,
    hospitalId: c.hospitalId,
    hospitalName: c.hospitalName,
    donorId: c.donorId,
    donorName: c.donorName,
    requestId: c.requestId,
    lastMessage: c.lastMessage,
    lastMessageTime: c.lastMessageTime,
    unread: c.unread,
  };
}

export function getConversationByRequestAndParticipants(requestId: string, donorId: string, hospitalId: string): ChatConversation | null {
  const c = getChatByRequestAndParticipants(requestId, donorId, hospitalId);
  if (!c) return null;
  return {
    id: c.id,
    participants: c.participants,
    hospitalId: c.hospitalId,
    hospitalName: c.hospitalName,
    donorId: c.donorId,
    donorName: c.donorName,
    requestId: c.requestId,
    lastMessage: c.lastMessage,
    lastMessageTime: c.lastMessageTime,
    unread: c.unread,
  };
}

export function getConversationsByRequest(requestId: string): ChatConversation[] {
  return getChatsByRequest(requestId).map((c) => ({
    id: c.id,
    participants: c.participants,
    hospitalId: c.hospitalId,
    hospitalName: c.hospitalName,
    donorId: c.donorId,
    donorName: c.donorName,
    requestId: c.requestId,
    lastMessage: c.lastMessage,
    lastMessageTime: c.lastMessageTime,
    unread: c.unread,
  }));
}

export function addConversation(conv: ChatConversation): void {
  addChat({ ...conv, messages: [] });
}

export function updateConversation(id: string, updates: Partial<ChatConversation>): void {
  updateChat(id, updates);
}

export function getMessages(conversationId: string): ChatMessage[] {
  return getChatMessages(conversationId);
}

export function addMessage(msg: ChatMessage): void {
  addChatMessage(msg.conversationId, msg);
}

export function clearChatStore(): void {
  clearChatDb();
}
