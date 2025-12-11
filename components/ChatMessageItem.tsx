import React from 'react';
import { ChatMessage } from '../types';
import { User, Bot, Loader2 } from 'lucide-react';
import { FeedbackDisplay } from './FeedbackDisplay';

interface Props {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Clean text from the feedback block to avoid double rendering if we are displaying the card
  // This is a simple visual cleanup, keeping the original text for context.
  let displayText = message.text;
  const hasFeedbackBlock = message.text.includes("Retroalimentación") || message.text.includes("**Retroalimentación**");
  
  // If it has feedback, we might want to hide the raw text part of the feedback to show the card instead, 
  // but for simplicity and robustness, we show the card below the text and keep text mainly for the conversational part.
  // We will strip the explicit "Retroalimentación" headers from the main text to keep it clean if the card renders.
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-river-blue text-white' : 'bg-mining-gold text-white shadow-md'}`}>
          {isUser ? <User size={20} /> : <Bot size={24} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3 rounded-2xl text-sm md:text-base shadow-sm whitespace-pre-wrap leading-relaxed ${
            isUser 
              ? 'bg-river-blue text-white rounded-tr-none' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
          }`}>
            {message.isThinking ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analizando contexto local...</span>
              </div>
            ) : (
              <span>{displayText}</span>
            )}
          </div>
          
          {/* Metadata */}
          <span className="text-xs text-gray-400 mt-1 mx-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* Structured Feedback Card (Only for Agent) */}
          {!isUser && hasFeedbackBlock && !message.isThinking && (
            <FeedbackDisplay text={message.text} />
          )}
        </div>
      </div>
    </div>
  );
};