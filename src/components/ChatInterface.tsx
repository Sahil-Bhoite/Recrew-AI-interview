
import { useRef, useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import { ProblemStatement } from "@/components/ProblemStatement";

interface Message {
  role: "assistant" | "user" | "system";
  content: string;
}

interface ProblemData {
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

const ChatInterface = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    candidateName
  } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  useEffect(() => {
    scrollToBottom();
    console.log("Messages updated:", messages.length);
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const formatMessageContent = (content: string, role: "assistant" | "user" | "system") => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  return <div className="flex h-full flex-col bg-white shadow-lg rounded-xl p-6">
      <div className="border-b border-gray-300 p-4 mb-4 bg-gray-100 rounded-xl">
        <h2 className="text-lg font-semibold">
          RecrewAI Interview {candidateName ? `- ${candidateName}` : ''}
        </h2>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-xl" id="chat-messages">
        {messages.length === 0 ? <div className="text-center p-4 text-muted-foreground">
            No messages yet. Start the conversation!
          </div> : messages.map((message, i) => <div key={i} className={cn("flex items-start gap-4 rounded-lg p-4", message.role === "assistant" ? "bg-gray-200 mr-12" : message.role === "system" ? "bg-yellow-100 mx-12 animate-pulse" : "bg-blue-100 ml-12")}>
              <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", message.role === "assistant" ? "bg-white" : message.role === "system" ? "bg-yellow-400 text-black" : "bg-white")}>
                {message.role === "assistant" ? <img src="/RecrewAI.png" alt="AI" className="w-8 h-8 rounded-full" /> : message.role === "system" ? "⚠️" : <img src="/user.png" alt="User" className="w-8 h-8 rounded-full" />}
              </div>
              <div className="flex-1 text-sm">
                {formatMessageContent(message.content, message.role)}
              </div>
            </div>)}
        {isLoading && !messages.some(m => m.role === "system") && <div className="flex items-center justify-center p-4">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            <span>Thinking...</span>
          </div>}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-300 bg-white/30 backdrop-blur-md rounded-xl mt-4">
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message..." disabled={isLoading} />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <>
                <span className="animate-spin mr-2">⟳</span>
                Sending...
              </> : "Send"}
          </Button>
        </div>
      </form>
    </div>;
};

export default ChatInterface;
