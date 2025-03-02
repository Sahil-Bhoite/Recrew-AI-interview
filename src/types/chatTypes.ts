
/**
 * Types for chat functionality
 */

export interface Message {
  role: "assistant" | "user" | "system";
  content: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  candidateName: string | null;
  hasResume: boolean;
  isCodeEvaluationSuccessful: boolean;
}
