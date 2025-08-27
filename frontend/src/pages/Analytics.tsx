import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Star, MessageSquare, Bot as BotIcon } from 'lucide-react';
import { Bot, Analytics as AnalyticsType } from '../types';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsType>({
    totalChats: 1247,
    activeChats: 45,
    resolvedChats: 1180,
    averageResponseTime: 1.8,
    satisfactionRate: 4.3,
    totalBots: 8,
    activeBots: 6
  });

  const [botPerformance, setBotPerformance] = useState<Bot[]>();

  // const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('analytics_update', (data: AnalyticsType) => {
        setAnalytics(data);
      });

      socket.on('bot_performance_update', (data: Bot[]) => {
        setBotPerformance(data);
      });

      return () => {
        socket.off('analytics_update');
        socket.off('bot_performance_update');
      };
    }
  }, [socket]);


  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:3000/admin/botAnalytics');
        setAnalytics(response.data);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    const fetchBotPerformance = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:3000/admin/botAnalytics');
        setBotPerformance(response.data.bots);
      } catch (error) {
        console.error('Error fetching bot performance:', error);
      }
    };

    fetchAnalytics();
    fetchBotPerformance();
  }, []);


  const metricCards = [
    {
      title: 'Total Conversations',
      value: analytics.totalChats.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Resolution Rate',
      value: `${Math.round((analytics.resolvedChats / analytics.totalChats) * 100)}%`,
      change: '+3.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg Response Time',
      value: `${analytics.averageResponseTime}s`,
      change: '-0.3s',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Satisfaction Score',
      value: `${analytics.satisfactionRate}/5.0`,
      change: '+0.1',
      trend: 'up',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="header">
        <div>
          <h1 className="title">Analytics</h1>
          <p className="subtitle">Performance insights and bot metrics</p>
        </div>
        {/* <div className="timeframe-select">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div> */}
      </div>

      {/* Metric Cards */}
      <div className="metric-grid">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="metric-card">
              <div className="metric-header">
                <div className={`metric-icon ${card.bgColor}`}>
                  <Icon className={`metric-icon-inner ${card.color}`} />
                </div>
                <span
                  className={`metric-trend ${card.trend === "up" ? "trend-up" : "trend-down"
                    }`}
                >
                  {card.change}
                </span>
              </div>
              <div>
                <h3 className="metric-title">{card.title}</h3>
                <p className="metric-value">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Conversation Volume */}
        {/* <div className="chart-card">
          <div className="chart-header">
            <h2>Conversation Volume</h2>
            <BarChart3 className="chart-icon" />
          </div>
          <div className="chart-content">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => {
              const value = Math.floor(Math.random() * 100) + 20;
              return (
                <div key={day} className="bar-row">
                  <span className="bar-label">{day}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${value}%` }} />
                  </div>
                  <span className="bar-value">{Math.floor(value * 2)}</span>
                </div>
              );
            })}
          </div>
        </div> */}

        {/* Response Time Trend */}
        {/* <div className="chart-card">
          <div className="chart-header">
            <h2>Response Time Trend</h2>
            <Clock className="chart-icon" />
          </div>
          <div className="chart-content">
            <div className="response-bars">
              {[65, 45, 38, 42, 35, 28, 32].map((height, index) => (
                <div key={index} className="response-bar">
                  <div
                    className="response-bar-fill"
                    style={{ height: `${height}%` }}
                  />
                  <span className="response-bar-label">{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="response-note">
              Response time decreasing by 0.2s average this week
            </div>
          </div>
        </div> */}
      </div>

      {/* Bot Performance Table */}
      <div className="table-card">
        <div className="chart-header">
          <h2>Bot Performance</h2>
          <BotIcon className="chart-icon" />
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bot Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {botPerformance?.map((bot) => (
                <tr key={bot._id}>
                  <td>
                    <div className="bot-name">
                      <div className="bot-avatar">
                        <BotIcon />
                      </div>
                      <span>{bot.title}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${bot.status === "active" ? "status-active" : "status-idle"
                        }`}
                    >
                      {bot.status}
                    </span>
                  </td>
                  {/* <td>{bot.conversations.toLocaleString()}</td> */}
                  {/* <td>{bot.responseTime}s</td> */}
                  {/* <td>
                    <div className="satisfaction">
                      <Star className="star-icon" />
                      <span>{bot.satisfaction}</span>
                    </div>
                  </td> */}
                  <td>{bot.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

};

export default Analytics;