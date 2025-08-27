export interface Bot {
  _id: string;
  title: string;
  status: 'active' | 'Disable' | 'training' | 'Enable';
  conversations: number;
  lastActive: string;
  responseTime: number;
  satisfaction: number;
  description?: string;
  greetingMessage : string,
  avatar?: string;
  color?: string;
  bg_color?: string;
  msg_agent_color?: string;
  user_msg_color?: string;
  msg_text_color?: string;
  uniqueBotId?:string;
}

export interface Chat {
  id: string;
  botID: string;
  botName: string;
  belongsTo: string;
  lastMessage: string;
  createdAt: string;
  unread: boolean;
  status: 'active' | 'resolved' | 'pending';
}

export interface Analytics {
  totalChats: number;
  activeChats: number;
  resolvedChats: number;
  averageResponseTime: number;
  satisfactionRate: number;
  totalBots: number;
  activeBots: number;
}

export interface Message {
  id: string;
  chatId: string;
  sender: 'user' | 'bot' | 'admin' | "Agent";
  content: string;
  timestamp: string;
}