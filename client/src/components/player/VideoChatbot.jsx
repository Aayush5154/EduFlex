import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Sparkles, HelpCircle } from 'lucide-react';
import { chatbotAPI } from '../../api/api';
import { clsx } from 'clsx';

const VideoChatbot = ({ videoId, videoTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Add welcome message
            setMessages([{
                role: 'assistant',
                content: `Hi! 👋 I'm your learning assistant for "${videoTitle}". Ask me anything about this video!`,
                timestamp: new Date()
            }]);
            fetchSuggestions();
        }
    }, [isOpen, videoTitle]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSuggestions = async () => {
        try {
            const res = await chatbotAPI.getSuggestions(videoId);
            setSuggestions(res.data.data || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSend = async (messageText = input) => {
        if (!messageText.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: messageText.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await chatbotAPI.chat(videoId, messageText);
            const assistantMessage = {
                role: 'assistant',
                content: res.data.data.message,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={clsx(
                    'fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-300',
                    'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
                    'hover:scale-110 hover:shadow-xl',
                    isOpen && 'hidden'
                )}
            >
                <MessageCircle className="w-6 h-6" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">Learning Assistant</h3>
                                <p className="text-xs text-white/70">Ask me about this video</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={clsx(
                                    'flex',
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                <div
                                    className={clsx(
                                        'max-w-[80%] px-4 py-2 rounded-2xl text-sm',
                                        msg.role === 'user'
                                            ? 'bg-blue-500 text-white rounded-br-sm'
                                            : msg.isError
                                                ? 'bg-red-500/20 text-red-400 rounded-bl-sm'
                                                : 'bg-slate-700 text-gray-200 rounded-bl-sm'
                                    )}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700 text-gray-200 px-4 py-2 rounded-2xl rounded-bl-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 1 && suggestions.length > 0 && (
                        <div className="px-4 pb-2">
                            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" />
                                Suggested questions
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.slice(0, 3).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSend(suggestion)}
                                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 text-xs rounded-full transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask a question..."
                                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-full text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
                                className={clsx(
                                    'p-2 rounded-full transition-colors',
                                    input.trim() && !loading
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                                )}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoChatbot;
