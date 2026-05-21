import React, { useState } from 'react';
import { X, MessageSquare, Plus, Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, Mail, Users, Bell, Archive, Trash2, Star, Clock } from 'lucide-react';

export function CommunicationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState(null);

  const conversations = [
    { id: 1, name: 'John Doe', lastMessage: 'Project update attached', time: '2m ago', unread: 2, online: true, avatar: 'JD' },
    { id: 2, name: 'Project Team', lastMessage: 'Meeting at 3 PM', time: '15m ago', unread: 5, online: false, avatar: 'PT', isGroup: true },
    { id: 3, name: 'Jane Smith', lastMessage: 'Thanks for the help!', time: '1h ago', unread: 0, online: true, avatar: 'JS' },
    { id: 4, name: 'Support Channel', lastMessage: 'Ticket #234 resolved', time: '3h ago', unread: 0, online: false, avatar: 'SC', isGroup: true },
    { id: 5, name: 'Bob Johnson', lastMessage: 'Can you review the code?', time: '1d ago', unread: 0, online: false, avatar: 'BJ' },
  ];

  const messages = [
    { id: 1, sender: 'John Doe', content: 'Hey, how is the project going?', time: '10:30 AM', isMe: false },
    { id: 2, sender: 'Me', content: 'Going well! Just finished the main component.', time: '10:32 AM', isMe: true },
    { id: 3, sender: 'John Doe', content: 'Great! Can you send me the latest version?', time: '10:33 AM', isMe: false },
    { id: 4, sender: 'Me', content: 'Sure, project update attached.', time: '10:35 AM', isMe: true },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Communication Hub</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('messages')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'messages' ? 'bg-white border-b-2 border-pink-600 text-pink-600' : 'text-gray-600 hover:text-gray-900'}`}>Messages</button>
          <button onClick={() => setActiveTab('announcements')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'announcements' ? 'bg-white border-b-2 border-pink-600 text-pink-600' : 'text-gray-600 hover:text-gray-900'}`}>Announcements</button>
          <button onClick={() => setActiveTab('channels')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'channels' ? 'bg-white border-b-2 border-pink-600 text-pink-600' : 'text-gray-600 hover:text-gray-900'}`}>Channels</button>
          <button onClick={() => setActiveTab('video')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'video' ? 'bg-white border-b-2 border-pink-600 text-pink-600' : 'text-gray-600 hover:text-gray-900'}`}>Video Calls</button>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === 'messages' && (
            <div className="flex h-full">
              <div className="w-80 border-r bg-gray-50">
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="space-y-1">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`px-4 py-3 cursor-pointer hover:bg-white transition-colors ${selectedConversation?.id === conv.id ? 'bg-white' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-medium text-sm">
                            {conv.avatar}
                          </div>
                          {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 text-sm">{conv.name}</span>
                            <span className="text-xs text-gray-500">{conv.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 truncate">{conv.lastMessage}</span>
                            {conv.unread > 0 && <span className="bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{conv.unread}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-medium text-sm">
                          {selectedConversation.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                          <p className="text-xs text-green-600">Online</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Phone className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Video className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto p-6 space-y-4">
                      {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md ${msg.isMe ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.isMe ? 'text-pink-200' : 'text-gray-500'}`}>{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-6 py-4 border-t">
                      <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Paperclip className="w-5 h-5 text-gray-600" />
                        </button>
                        <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Smile className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                  <Plus className="w-4 h-4" /> New Announcement
                </button>
              </div>

              {[
                { title: 'System Maintenance', content: 'Scheduled maintenance on Sunday 2 AM - 4 AM', priority: 'high', date: '2024-05-19' },
                { title: 'New Feature Release', content: 'Check out the new analytics dashboard!', priority: 'normal', date: '2024-05-18' },
                { title: 'Holiday Schedule', content: 'Office closed on Monday for public holiday', priority: 'low', date: '2024-05-17' },
              ].map((announcement) => (
                <div key={announcement.title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-pink-600" />
                      <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                      announcement.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {announcement.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      All Staff
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Communication Channels</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                  <Plus className="w-4 h-4" /> Create Channel
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'General', members: 45, description: 'Company-wide announcements', icon: Bell },
                  { name: 'Development', members: 12, description: 'Dev team discussions', icon: MessageSquare },
                  { name: 'Marketing', members: 8, description: 'Marketing team updates', icon: Mail },
                  { name: 'Support', members: 6, description: 'Customer support discussions', icon: Users },
                  { name: 'Projects', members: 15, description: 'Project coordination', icon: Star },
                  { name: 'Random', members: 23, description: 'Casual conversations', icon: Smile },
                ].map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div key={channel.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-pink-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{channel.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {channel.members} members
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Video Calls</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                  <Video className="w-4 h-4" /> Start Meeting
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Project Kickoff', time: 'Today, 3:00 PM', participants: 5, status: 'upcoming' },
                  { title: 'Weekly Standup', time: 'Tomorrow, 9:00 AM', participants: 8, status: 'scheduled' },
                  { title: 'Client Presentation', time: '2024-05-22, 2:00 PM', participants: 3, status: 'scheduled' },
                  { title: 'Sprint Review', time: '2024-05-25, 4:00 PM', participants: 12, status: 'scheduled' },
                ].map((meeting) => (
                  <div key={meeting.title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                        <p className="text-sm text-gray-600">{meeting.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {meeting.participants} participants
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1 text-sm text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                        <Video className="w-4 h-4" /> Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}