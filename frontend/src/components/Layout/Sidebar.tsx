import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  MessageSquare,
  BarChart3,
  Bot,
  Plus,
  Menu,
  X,
  Circle
} from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { connected } = useSocket();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Chat Inbox', path: '/chats' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Bot, label: 'Bot List', path: '/bots' },
    { icon: Plus, label: 'Create Bot', path: '/bots/new' },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-black text-white z-40 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold">LiveChat Admin</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Circle 
                    size={8} 
                    className={connected ? 'text-green-500 fill-current' : 'text-red-500 fill-current'} 
                  />
                  <span className="text-xs text-gray-400">
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-1 hover:bg-gray-800 rounded"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-white text-black' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;