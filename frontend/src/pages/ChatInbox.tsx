import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MessageSquare, User } from 'lucide-react';
import { Chat, Message } from '../types';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const ChatInbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'resolved'>('all');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [newMessage, setNewMessage] = useState("");


  const { socket } = useSocket();
useEffect(() => {
  if (!socket) return;

  // Handler to add listeners after connection
  const onConnect = () => {
    console.log('Socket connected ✅');

    socket.on('update-newchat', (data: { chatId: string; message: Message }) => {
      console.log('update-newchat received:', data);
      setMessages(prev => [
      ...prev,
      {
        id: "9554",
        content: `${data.message}`,
        sender: 'user',
        chatId: "asd",
        timestamp: new Date().toLocaleString(),
      }
    ]);
    });

    socket.on('chat_status_update', (data: { chatId: string; status: Chat['status'] }) => {
      setChats(prev =>
        prev.map(chat =>
          chat.id === data.chatId ? { ...chat, status: data.status } : chat
        )
      );
    });
  };

  // Attach connect listener
  socket.on('connect', onConnect);

  // If already connected before this effect runs, call handler immediately
  if (socket.connected) {
    onConnect();
  }

  // Cleanup
  return () => {
    socket.off('connect', onConnect);
    socket.off('update-newchat');
    socket.off('chat_status_update');
  };
}, [socket]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/chats`);
        const rawData = response.data;

        const chatsArray =
          [rawData, rawData?.chats, rawData?.data].find(Array.isArray) || [];

        const formattedChats = chatsArray.map(c => ({
          ...c,
          timestamp: new Date(c.timestamp).toLocaleString(),
        }));

        setChats(formattedChats);
      } catch (err) {
        setError('Failed to load chats');
        console.error(err);
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);


  const handleSendMessage = () => {

    setMessages(prev => [
      ...prev,
      {
        id: "9554",
        content: newMessage,
        sender: 'Agent',
        chatId: "asd",
        timestamp: new Date().toLocaleString(),
      }
    ]);

    socket?.emit("agent-message", {
      msg: newMessage,
      uuid: selectedChat?.belongsTo,
      chatID: selectedChat?.id,
      timestamp: new Date().toISOString()

    })

    setNewMessage("");
  };

  // Inside your component
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleMessageChange = (e: any) => {
    setNewMessage(e.target.value);
  }

  const filteredChats = Array.isArray(chats)
    ? chats.filter(chat => {
      const matchesSearch =
        chat.belongsTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.botName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterStatus === 'all' || chat.status === filterStatus;

      return matchesSearch && matchesFilter;
    })
    : [];

  const totalPages = Math.ceil(filteredChats.length / pageSize);
  const paginatedChats = filteredChats.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const unreadCount = Array.isArray(chats) ? chats.filter(chat => chat.unread).length : 0;

  const handleChatClick = async (chat: Chat) => {
    setSelectedChat(chat);
    setChats(prev => prev.map(c => (c.id === chat.id ? { ...c, unread: false } : c)));

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/chat/${chat.id}`);
      console.log("Fetched messages:", response.data);
      console.log("Chat ID:", chat.id);
      socket?.emit("admin-join-newroom", chat.belongsTo);

      let msgs: Message[] = [];
      if (Array.isArray(response.data)) {
        msgs = response.data;
      } else if (Array.isArray(response.data?.messages)) {
        msgs = response.data.messages;
      }

      // ✅ Ensure timestamp is a nice string
      setMessages(
        msgs.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp).toLocaleString(),
        }))
      );
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
    }
  };


  const getStatusColor = (status: Chat['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: Chat['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Inbox</h1>
          <p className="text-gray-600">
            Manage customer conversations • {unreadCount} unread messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${unreadCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}
          >
            {unreadCount} Unread
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Conversations ({filteredChats.length})
          </h2>
          <div className="flex justify-between items-center mb-2">
            <div>
              <label htmlFor="pageSize" className="text-sm text-gray-600 mr-2">
                Chats per page:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>


          <div className="space-y-3">
            {/* {filteredChats.map(chat => ( */}
            {paginatedChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${chat.unread
                  ? 'border-blue-200 bg-blue-50'
                  : selectedChat?.id === chat.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        Visitor - {chat.belongsTo.substring(0, 7)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{chat.createdAt}</span>
                        {chat.unread && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600">{chat.botName}</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(chat.status)}`} />
                      <span className="text-xs text-gray-500">{getStatusText(chat.status)}</span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Preview */}
        {/* Chat Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
          {selectedChat ? (
            <div className="p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Vistitor - {(selectedChat.belongsTo).substring(0,7)}</h3>
                  <p className="text-sm text-gray-600">{selectedChat.botName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedChat.status)}`} />
                    <span className="text-xs text-gray-500">{getStatusText(selectedChat.status)}</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-1">
                <div className="text-center text-sm text-gray-500 py-2">
                  Conversation started on {new Date(selectedChat.createdAt).toLocaleString()}
                </div>

                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === "Agent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender === "bot"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                          }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs flex-end opacity-75 mt-1 block">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    onChange={handleMessageChange}
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newMessage}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatInbox;
