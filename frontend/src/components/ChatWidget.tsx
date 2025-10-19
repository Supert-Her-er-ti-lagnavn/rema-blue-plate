import React, { useState } from 'react';
import { HuggingFaceChat } from './HuggingFaceChat';

export function ChatWidget() {
  const [isMinimized, setIsMinimized] = useState(true);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
      <HuggingFaceChat
        isMinimized={isMinimized}
        onToggleMinimize={toggleMinimize}
      />
  );
}