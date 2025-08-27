import React, { useState, useEffect, useRef } from 'react';
import { Plus, Bot as BotIcon, Settings, Play, Pause, Trash2, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bot } from '../types';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
import { toast } from 'react-toastify';

const BotList: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [conversations, setConversations] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { socket } = useSocket();




  useEffect(() => {
    if (socket) {
      socket.on('bot_status_update', (data: { botId: string; status: Bot['status'] }) => {
        setBots(prev => prev?.map(bot =>
          bot._id === data.botId ? { ...bot, status: data.status } : bot
        ));
      });

      socket.on('bot_performance_update', (updatedBots: Bot[]) => {
        setBots(updatedBots);
      });

      return () => {
        socket.off('bot_status_update');
        socket.off('bot_performance_update');
      };
    }
  }, [socket]);


  useEffect(() => {
    const fetchBotList = async () => {
      try {
  const response = await axios.get(`${API_BASE_URL}/admin/botDetails`);
        console.log(API_BASE_URL);

        const botsData = response?.data?.allbots;
        setConversations(response?.data?.conversations)
        if (Array.isArray(botsData)) {
          setBots(botsData);
        } else {
          console.error("Unexpected data format for bots:", botsData);
          setBots([]); // Set to empty array if malformed
        }
      } catch (error) {
        console.error("Failed to fetch bot list:", error);
        setBots([]); // Set to empty array on error to prevent UI crash
      }
    };

    fetchBotList();
  }, []);

  const handleBotAction = async (action: 'Enable' | 'Disable' | 'delete', botId: string) => {
    switch (action) {
      case 'Enable':
        setBots(prev => prev?.map(bot =>
          bot._id === botId ? { ...bot, status: 'Enable' } : bot
        ));
        break;
      case 'Disable':
        setBots(prev => prev?.map(bot =>
          bot._id === botId ? { ...bot, status: 'Disable' } : bot
        ));
        break;
      case 'delete':
        setBots(prev => prev?.filter(bot => bot._id !== botId));
        break;
    }
    if (action === 'Enable' || action === 'Disable') {
  await axios.post(`${API_BASE_URL}/admin/${botId}/updateBotStatus`, { status: action })
        .catch(err => {
          console.error('Failed to update bot status:', err);
        });
      setActiveDropdown(null);
      action == 'Enable' ? toast.success("Bot Enabled") : toast.error("Bot Disabled");

    } else if (action === 'delete') {
  await axios.delete(`${API_BASE_URL}/admin/${botId}/deleteBot`)
        .catch(err => {
          console.error('Failed to delete bot:', err);
        });
      toast.error("Bot Deleted");

      setActiveDropdown(null);
    }
  };

  const openBotSettings = (bot: Bot) => {
    setSelectedBot(bot);
    setShowSettings(true);
  };

  const getStatusColor = (status: Bot['status']) => {
    switch (status) {
      case 'Enable': return 'bg-green-100 text-green-800';
      case 'Disable': return 'bg-gray-100 text-gray-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Bot['status']) => {
    switch (status) {
      case 'Enable': return 'bg-green-500';
      case 'Disable': return 'bg-gray-400';
      case 'training': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const handleSaveButton = () => {
    if (!formRef.current) return;

    const form = formRef.current;

    const getValue = (selector: string) =>
      (form.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value || '';

    const updatedBot = {
      ...selectedBot,
      title: getValue('input[type="text"]'),
      greetingMessage: getValue('textarea'),
      status: getValue('select'),
      color: getValue('input[name="widget_color"]'),
      bg_color: getValue('input[name="bot_msg_color"]'),
      msg_agent_color: getValue('input[name="admin_msg_color"]'),
      user_msg_color: getValue('input[name="widget_bg_color"]'),
      msg_text_color: getValue('input[name="message_color"]'),
    };

  const response = axios.post(`${API_BASE_URL}/admin/updateBot`, updatedBot)
      .then(res => {
        setBots(prev => prev.map(bot => bot._id === updatedBot._id ? updatedBot as Bot : bot));
      })
      .catch(err => {
        console.error('Failed to update bot:', err);
      });
    toast.success("Bot Setting Updated");

    setShowSettings(false);
    setSelectedBot(null);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bot Management</h1>
          <p className="text-gray-600">
            Manage your chatbots and configure their settings
          </p>
        </div>
        <Link
          to="/bots/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Bot
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Bots</p>
              <p className="text-2xl font-bold text-gray-900">{bots?.length}</p>
            </div>
            <BotIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Bots</p>
              <p className="text-2xl font-bold text-gray-900">
                {bots?.filter(bot => bot.status === 'Enable').length}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-sm font-bold">💬</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {/* {(bots.reduce((sum, bot) => sum + bot.satisfaction, 0) / bots.length).toFixed(1)} */}
                {/* {bots?.length
                  ? (bots.reduce((sum, bot) => sum + bot.satisfaction, 0) / bots.length).toFixed(1)
                  : 'N/A'} */}
                4.6
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-sm">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <div
            key={bot._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openBotSettings(bot)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <BotIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{bot.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusIcon(bot.status)}`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bot.status)}`}>
                      {bot.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === bot._id ? null : bot._id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>

                {activeDropdown === bot._id && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBotSettings(bot);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBotAction(bot.status === 'Enable' ? 'Disable' : 'Enable', bot._id);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      {bot.status === 'Enable' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Enable
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBotAction('delete', bot._id);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{bot.description}</p>
          </div>
        ))}
      </div>

      {/* Bot Settings Modal */}
      {showSettings && selectedBot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <BotIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedBot.title}</h2>
                    <p className="text-sm text-gray-600">Bot Configuration</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>


              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Script Tag:</label>
                <div className="relative bg-gray-100 text-gray-800 font-mono text-sm rounded-md p-3 break-all">
                  <code>{`<script src="${API_BASE_URL}/${selectedBot.uniqueBotId}/widget.js"></script>`}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `<script src="${API_BASE_URL}/${selectedBot.uniqueBotId}/widget.js"></script>`
                      );

                      toast.success("Script copied to clipboard!");
                    }}
                    className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>


            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <form ref={formRef}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bot Name
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedBot.title}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Greeting Message
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={selectedBot.greetingMessage}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        defaultValue={selectedBot.status}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        name='status'
                      >
                        <option value="Enable">Enable</option>
                        <option value="Disable">Disable</option>
                      </select>
                    </div>
                    {/* Coloring Configs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Widget Color
                        </label>
                        <input defaultValue={selectedBot.color} type="color" name="widget_color" className="w-full h-10 p-1 rounded border" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bot Message Color
                        </label>
                        <input defaultValue={selectedBot.bg_color} type="color" name="bot_msg_color" className="w-full h-10 p-1 rounded border" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Message Color
                        </label>
                        <input defaultValue={selectedBot.msg_agent_color} type="color" name="admin_msg_color" className="w-full h-10 p-1 rounded border" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Widget Background Color
                        </label>
                        <input defaultValue={selectedBot.user_msg_color} type="color" name="widget_bg_color" className="w-full h-10 p-1 rounded border" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message Color
                        </label>
                        <input defaultValue={selectedBot.msg_text_color} type="color" name="message_color" className="w-full h-10 p-1 rounded border" />
                      </div>
                    </div>

                  </form>



                </div>
              </div>



              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleSaveButton()}>
                  Save Changes
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotList;