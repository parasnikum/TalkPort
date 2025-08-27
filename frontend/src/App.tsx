import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/Layout/Layout.tsx';
import Dashboard from './pages/Dashboard';
import ChatInbox from './pages/ChatInbox';
import Analytics from './pages/Analytics';
import BotList from './pages/BotList';
import CreateBot from './pages/CreateBot';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="chats" element={<ChatInbox />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="bots" element={<BotList />} />
            <Route path="bots/new" element={<CreateBot />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </SocketProvider>
  );
}

export default App;