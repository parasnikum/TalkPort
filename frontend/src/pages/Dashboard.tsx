import React, { useEffect, useState } from 'react';
import { MessageSquare, Bot, TrendingUp, Users } from 'lucide-react';
import { Analytics, Chat } from '../types';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;



const Dashboard: React.FC = () => {
  // const [analytics, setAnalytics] = useState<Analytics>({
  // totalChats: 156,
  // activeChats: 23,
  // resolvedChats: 133,
  // averageResponseTime: 2.3,
  // satisfactionRate: 4.2,
  // totalBots: 8,
  // activeBots: 6
  // });


  const [analytics, setAnalytics] = useState<Analytics>();

  const [recentChats, setRecentChats] = useState<Chat[]>();

  const { socket } = useSocket();



  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboardDetails`);
      setRecentChats(response.data.recentChats);
      setAnalytics({
        totalChats: response.data.chatCount,
        activeChats: response.data.activeChats,
        resolvedChats: 133,
        averageResponseTime: 2.3,
        satisfactionRate: 4.2,
        totalBots: response.data.activeBots,
        activeBots: response.data.activeBots
      })
      console.log("response ", response.data.recentChats);

    }
    fetchData();

  },[])



  useEffect(() => {
    if (socket) {
      socket.on('analytics_update', (data: Analytics) => {
        setAnalytics(data);
      });

      socket.on('new_chat', (chat: Chat) => {
        setRecentChats(prev => [chat, ...(prev ?? []).slice(0, 3)]);

        // setRecentChats(prev => [chat, ...prev.slice(0, 3)]);
      });

      return () => {
        socket.off('analytics_update');
        socket.off('new_chat');
      };
    }
  }, [socket]);



  const statCards = [
    {
      title: 'Total Chats',
      value: analytics?.totalChats,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Active Chats',
      value: analytics?.activeChats,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Active Bots',
      value: analytics?.activeBots,
      icon: Bot,
      color: 'text-purple-600'
    },
    // {
    //   title: 'Avg Response Time',
    //   value: `${analytics?.averageResponseTime}s`,
    //   change: '-0.2s',
    //   icon: Clock,
    //   color: 'text-orange-600'
    // }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your LiveChat bot performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Chats</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentChats?.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${chat.unread
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${chat.status === 'active' ? 'bg-green-500' :
                  chat.status === 'pending' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      Visitor - {chat.belongsTo.substring(0,7)}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.createdAt}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{chat.botName}</p>
                  <p className="text-sm text-gray-800 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Dashboard;