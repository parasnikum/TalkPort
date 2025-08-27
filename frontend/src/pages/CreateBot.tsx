import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot as BotIcon, Save } from 'lucide-react';
import { toast } from 'react-toastify';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const CreateBot: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bot_name: '',
    bot_logo: '',
    greeting_message: 'Hello! How can I help you today?',
    widget_color: '#000000',
    widget_status: 'Disable' as const,
    allowed_domains: '',
    disallowed_domains: '',
    pre_questions: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      bot_name: formData.bot_name,
      bot_logo: formData.bot_logo,
      greeting_message: formData.greeting_message,
      widget_color: formData.widget_color,
      widget_status: formData.widget_status,
      allowed_domains: formData.allowed_domains,
      disallowed_domains: formData.disallowed_domains,
      pre_questions: formData.pre_questions
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/bot/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      toast.success("Bot Created");

      navigate('/bots');


    } catch (error) {
      console.error('Error creating bot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/bots')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Bot</h1>
          <p className="text-gray-600">Set up a new chatbot for your customers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bot Name *</label>
                  <input
                    type="text"
                    name="bot_name"
                    value={formData.bot_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Support Bot"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bot Logo URL</label>
                  <input
                    type="text"
                    name="bot_logo"
                    value={formData.bot_logo}
                    onChange={handleInputChange}
                    placeholder="Paste image URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
                  <select
                    name="widget_status"
                    value={formData.widget_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Disable">Disable</option>
                    <option value="Enable">Enable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conversation Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Conversation Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Greeting Message</label>
                  <textarea
                    name="greeting_message"
                    value={formData.greeting_message}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Bot welcome message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Bot Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Bot Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Widget Color</label>
                  <input
                    type="color"
                    name="widget_color"
                    value={formData.widget_color}
                    onChange={handleInputChange}
                    className="h-10 w-20 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Domains</label>
                  <textarea
                    name="allowed_domains"
                    value={formData.allowed_domains}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="example.com, mysite.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blocked Domains</label>
                  <textarea
                    name="disallowed_domains"
                    value={formData.disallowed_domains}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g., blockedsite.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Predefined Questions</label>
                  <textarea
                    name="pre_questions"
                    value={formData.pre_questions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., What are your hours?, How do I reset password?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div> */}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

              <div className="border border-gray-300 rounded-lg bg-white h-80 flex flex-col justify-between overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <BotIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {formData.bot_name || 'Your Bot Name'}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500">
                        {formData.widget_status || 'Online'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                      <BotIcon className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg border text-gray-900 max-w-[80%]">
                      {formData.greeting_message || 'Hello! How can I help you today?'}
                    </div>
                  </div>
                </div>

                {/* Chat Input (simulated, not interactive) */}
                <div className="px-4 py-3 border-t bg-white">
                  <div className="bg-gray-100 text-gray-500 text-sm px-3 py-2 rounded-full">
                    Type a message...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/bots')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {/* <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Save as Draft
            </button> */}
            <button
              type="submit"
              disabled={!formData.bot_name || isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Creating Bot...' : 'Create Bot'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBot;
