import React, { createContext, useState, useContext } from 'react';

// Define the shape of the chat context
interface ChatMessage {
  sender: 'user' | 'assistant';
  message: string;
}

interface ChatContextType {
  chatHistory: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const addMessage = (message: ChatMessage) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <ChatContext.Provider value={{ chatHistory, addMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export { ChatContext };