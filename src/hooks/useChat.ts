
import { useState, useEffect } from "react";
import { Message, ChatState } from "../types/chatTypes";
import { fetchChatResponse, formatCodeSubmission } from "../utils/chatApiUtils";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState<boolean>(false);
  const [isCodeEvaluationSuccessful, setIsCodeEvaluationSuccessful] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("candidateName");
    const resumeStatus = localStorage.getItem("hasResume");
    
    setCandidateName(name);
    setHasResume(resumeStatus === "true");
    
    const initialGreeting = name 
      ? `👋 Hello ${name}! I'm RecrewAI, your technical interview assistant. I'd love to get to know you better. Could you please tell me about your background in software development?`
      : `👋 Hello! I'm RecrewAI, your technical interview assistant. I'd love to get to know you better. Could you please introduce yourself and share your background in software development?`;
      
    setMessages([
      { role: "assistant", content: initialGreeting }
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        console.log("Checking assistant message for evaluation markers:", 
          lastMessage.content.substring(0, 100));
        if (lastMessage.content.includes("SOLUTION_CORRECT")) {
          console.log("Solution marked as CORRECT");
          setIsCodeEvaluationSuccessful(true);
        } else {
          setIsCodeEvaluationSuccessful(false);
        }
      }
    }
  }, [messages]);

  /**
   * Sends a message to the chat, supporting both regular messages and code submissions
   */
  const sendMessage = async (content: string, isCode: boolean = false) => {
    try {
      console.log(`Sending ${isCode ? 'code' : 'regular'} message:`, 
        content.substring(0, 100) + (content.length > 100 ? '...' : ''));
      
      // Format content based on whether it's code or not
      const userMessageContent = formatCodeSubmission(content, isCode);
      
      // Create the user message object
      const userMessage: Message = { 
        role: "user", 
        content: userMessageContent 
      };
      
      // Update messages state immediately to show in UI
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // If already loading, don't make another API call
      if (isLoading) {
        console.log("API call already in progress, skipping new request");
        return;
      }
      
      // Now make the API call after UI update
      setIsLoading(true);
      
      // Prepare temporary "system" message to show in UI while waiting
      const tempSystemMsg: Message = {
        role: "system",
        content: isCode ? "Evaluating your code..." : "Thinking..."
      };
      
      // Add the temporary message to the UI
      setMessages(prevMessages => [...prevMessages, tempSystemMsg]);
      
      // Get the current messages including the new one but excluding the temp message
      const currentMessages = [...messages, userMessage];
      
      try {
        console.log("Calling API with messages:", currentMessages.length);
        
        // Call the API utility function
        const reply = await fetchChatResponse(currentMessages);
        
        console.log("API response received:", reply.substring(0, 100) + '...');
        
        // Remove the temporary system message
        setMessages(prev => prev.filter(msg => msg !== tempSystemMsg));
        
        if (reply && reply.trim()) {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: reply 
          }]);
          
          // Check if solution is correct for code submissions
          if (isCode && reply.includes("SOLUTION_CORRECT")) {
            console.log("Solution marked as correct, will reset editor");
          }
        }
      } catch (error) {
        console.error("Error in API call:", error);
        
        // Remove any temporary system message
        setMessages(prev => prev.filter(msg => msg.role !== "system"));
        
        // Add error message to chat
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Error evaluating your solution: ${error instanceof Error ? error.message : "Unknown error"}. Please try again in a moment.`
        }]);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    candidateName,
    hasResume,
    isCodeEvaluationSuccessful,
  };
}
