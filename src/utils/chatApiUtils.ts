import { Message } from "../types/chatTypes";
import { SYSTEM_PROMPT } from "../constants/chatConstants";

/**
 * Sends a chat message to the OpenAI GPT-4 API and returns the response
 */
export async function fetchChatResponse(messages: Message[]) {
  // Prepare messages for API with system prompt
  const messagesForAPI = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
  ];
  
  console.log("Sending API request", { 
    messageCount: messagesForAPI.length,
    lastMessage: messages[messages.length - 1]
  });
  
  // Use the user-provided OpenAI key from environment variables
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: messagesForAPI,
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("API error response:", errorData);
    throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  console.log("API response received:", {
    responseLength: data.choices[0].message.content.length,
    firstFewChars: data.choices[0].message.content.substring(0, 50)
  });
  
  return data.choices[0].message.content;
}

/**
 * Formats code submissions with proper markdown code formatting
 */
export function formatCodeSubmission(content: string, isCode: boolean): string {
  // Format code submissions with proper formatting if not already formatted
  if (isCode && !content.includes("```")) {
    console.log("Formatting code submission with markdown");
    return `\`\`\`\n${content}\n\`\`\``; 
  }
  return content;
}
