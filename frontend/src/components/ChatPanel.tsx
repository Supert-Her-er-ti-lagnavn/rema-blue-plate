import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  sessionId: string | null;
  selectedUserIds: number[];
  onRecipesUpdate?: (recipes: any[], sessionId?: string) => void;
}

export function ChatPanel({ sessionId, selectedUserIds, onRecipesUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update session ID when it changes from props
  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Check if we need to provide user_ids for initial search
      const needsUserIds = !currentSessionId && selectedUserIds.length === 0;

      if (needsUserIds) {
        // No session and no users selected - ask user to select family
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Please select family members on the left first, then I can search for recipes based on your request!',
          },
        ]);
        setIsLoading(false);
        return;
      }

      // Call chat endpoint (creates session if needed, or refines existing)
      const response = await fetch('http://localhost:8000/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: userMessage,
          user_ids: !currentSessionId ? selectedUserIds : undefined, // Only send if no session
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data = await response.json();

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);

      // Update session ID if this was initial search
      if (data.session_id && !currentSessionId) {
        setCurrentSessionId(data.session_id);
      }

      // Update recipes if provided (pass session ID if new)
      if (data.recipes && onRecipesUpdate) {
        onRecipesUpdate(data.recipes, data.session_id || undefined);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Recipe Assistant
            </h3>
            <p className="text-xs text-gray-500">
              Ask me anything about recipes
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-2">Ready to help!</p>
            <p className="text-xs text-gray-400 px-4">
              Ask me to find recipes, refine your selection, or answer cooking questions!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Try: "Find vegetarian recipes", "No fish", "Easier recipes"
        </p>
      </div>
    </div>
  );
}
