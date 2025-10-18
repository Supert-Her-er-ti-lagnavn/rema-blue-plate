import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { sampleMeals } from "@/components/sampleMeals";
import { useShoppingContext } from "@/contexts/useShoppingContext";
import { MessageCircle, Send, Trash2, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HuggingFaceChatProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  inline?: boolean;
}

export function HuggingFaceChat({ isMinimized = false, onToggleMinimize, inline = false }: HuggingFaceChatProps) {
  const mealListPrompt = `Here are the available meals:\n${sampleMeals.map(meal => `- ${meal.title}: ${meal.ingredients.map(i => i.name).join(', ')}`).join('\n')}\nAlways suggest meals from this list in your responses, using this format.`;
  const extractMealSuggestion = (assistantText: string) => {
    for (const meal of sampleMeals) {
      if (assistantText.includes(meal.title)) {
        return meal;
      }
    }
    return null;
  };
  const [suggestedMeal, setSuggestedMeal] = useState<null | { title: string; ingredients: { name: string; amount: string; price: number }[] }>(null);
  // Preset configuration (hidden from user)
  const PRESET_CONFIG = {
    model: import.meta.env.VITE_DEFAULT_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct',
    modelName: 'Llama 3 8B Instruct',
    temperature: parseFloat(import.meta.env.VITE_DEFAULT_TEMPERATURE || '0.7'),
    maxTokens: parseInt(import.meta.env.VITE_DEFAULT_MAX_TOKENS || '300'),
    baseUrl: 'https://router.huggingface.co/v1/chat/completions'
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hfToken, setHfToken] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load token from localStorage or environment
  useEffect(() => {
    const savedToken = localStorage.getItem('hf_token');
    if (savedToken) {
      setHfToken(savedToken);
    } else if (import.meta.env.VITE_HF_TOKEN && import.meta.env.VITE_HF_TOKEN !== 'your_hf_token_here') {
      setHfToken(import.meta.env.VITE_HF_TOKEN);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save token
  const saveToken = (token: string) => {
    setHfToken(token);
    localStorage.setItem('hf_token', token);
  };

  // Generate unique ID
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Call Hugging Face API (Router API - OpenAI compatible format)
  const callHuggingFaceAPI = async (userMessage: string): Promise<string> => {
    if (!hfToken) {
      throw new Error('Hugging Face token is required');
    }

    const response = await fetch(PRESET_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hfToken}`,
      },
      body: JSON.stringify({
        model: PRESET_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful cooking and meal planning assistant. ${mealListPrompt} Help users with recipes, meal planning, ingredient substitutions, and cooking tips. Be concise and practical.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: PRESET_CONFIG.maxTokens,
        temperature: PRESET_CONFIG.temperature
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response received';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (!hfToken) {
      alert('Please enter your Hugging Face token first');
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callHuggingFaceAPI(userMessage.content);
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
      // Try to extract a meal suggestion
      const meal = extractMealSuggestion(response);
      setSuggestedMeal(meal ? { title: meal.title, ingredients: meal.ingredients } : null);
    } catch (error) {
      console.error('Error calling Hugging Face:', error);
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSuggestedMeal(null);
  };
  const { addItemsToShoppingList } = useShoppingContext();

  // Convert meal ingredients to ShoppingItem format
  const handleAddMealToShoppingList = () => {
    if (!suggestedMeal) return;
    // Convert ingredients to ShoppingItem[] (minimal fields)
    const items = suggestedMeal.ingredients.map((ingredient, idx) => ({
      id: Date.now() + idx,
      name: ingredient.name,
      quantity: 1,
      category: "Annet",
      aisle: 0,
      checked: false,
      price: ingredient.price || 0,
    }));
    addItemsToShoppingList(items);
    setSuggestedMeal(null);
  };


  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={inline ? "h-full bg-card rounded-lg shadow-lg border border-border flex flex-col" : "fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-card rounded-lg shadow-2xl border border-border flex flex-col"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold">🍳 Recipe Assistant</h3>
        </div>
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Token Input (if needed) */}
      {!hfToken && (
        <div className="p-3 bg-yellow-50 border-b border-yellow-200">
          <div className="flex gap-2 items-center">
            <input
              type="password"
              placeholder="Enter HuggingFace token..."
              onChange={(e: ChangeEvent<HTMLInputElement>) => saveToken(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <a 
              href="https://huggingface.co/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Get Token
            </a>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
            <p className="text-sm">Ask me about recipes, ingredients, or cooking tips!</p>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-card border border-border'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'user' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                  <span className="text-xs font-medium opacity-75">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">Assistant is thinking...</span>
              </div>
            </div>
          </div>
        )}
        {/* If a meal is suggested, show confirm button */}
        {suggestedMeal && (
          <div className="flex justify-center mt-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
              onClick={handleAddMealToShoppingList}
            >
              Legg til ingredienser fra "{suggestedMeal.title}" i handlelisten
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card rounded-b-lg">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={hfToken ? "Ask about recipes, ingredients..." : "Enter token above first"}
            disabled={!hfToken || isLoading}
            rows={1}
            className="flex-1 px-3 py-2 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm bg-background"
          />
          <button
            type="submit"
            disabled={!input.trim() || !hfToken || isLoading}
            className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground p-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground p-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}