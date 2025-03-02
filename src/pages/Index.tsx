
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ChatInterface from "@/components/ChatInterface";
import CodeIDE from "@/components/CodeIDE";
import { useChat } from "@/hooks/useChat";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const InterviewPage = () => {
  useEffect(() => {
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Failed to go fullscreen:", err);
      });
    }
  }, []);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showWarning, setShowWarning] = useState(false);
  const [userLeftCount, setUserLeftCount] = useState(0);

  const { sendMessage, candidateName, messages, isCodeEvaluationSuccessful, isLoading } = useChat();
  const navigate = useNavigate();
  const [shouldResetEditor, setShouldResetEditor] = useState(false);
  const { toast } = useToast();

  // Track user leaving the page, block copy/paste, and run a 1-hr timer
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        setUserLeftCount(prev => {
          const newVal = prev + 1;
          if (newVal > 1) {
            toast({
              title: "Disqualification Warning",
              description: "You are disqualified for leaving the interview more than once.",
              duration: 5000,
            });
            navigate("/");
          }
          return newVal;
        });
      }
    }

    function blockCopyPaste(e: ClipboardEvent | KeyboardEvent) {
      setShowWarning(true);
      e.preventDefault();
      toast({
        title: "Action Not Allowed",
        description: "Copying and pasting is disabled during the interview.",
        duration: 3000,
      });
    }

    function handleScreenshot(e: KeyboardEvent) {
      if (e.key === "PrintScreen") {
        setShowWarning(true);
        toast({
          title: "Action Not Allowed",
          description: "Screenshots are disabled during the interview.",
          duration: 3000,
        });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", blockCopyPaste);
    document.addEventListener("paste", blockCopyPaste);
    document.addEventListener("keydown", handleScreenshot);

    const timerID = setInterval(() => {
      setTimeLeft(prev => { 
        if ([900, 600, 300].includes(prev)) {
          toast({
            title: "Time Warning",
            description: `Only ${prev / 60} minutes remaining.`,
            duration: 3000,
          });
        }
        if (prev <= 1) {
          clearInterval(timerID);
          toast({
            title: "Time's up!",
            description: "The interview has concluded.",
            duration: 5000,
          });
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", blockCopyPaste);
      document.removeEventListener("paste", blockCopyPaste);
      clearInterval(timerID);
      document.removeEventListener("keydown", handleScreenshot);
    };
  }, []);

  // Redirect to landing page if no candidate name is found
  useEffect(() => {
    const storedName = localStorage.getItem("candidateName");
    if (!storedName) {
      navigate("/");
    }
  }, [navigate]);

  // Reset editor when solution is correct
  useEffect(() => {
    if (isCodeEvaluationSuccessful) {
      setShouldResetEditor(true);
      toast({
        title: "Correct solution!",
        description: "Great job! The editor has been reset for the next challenge.",
        duration: 3000,
      });
    }
  }, [isCodeEvaluationSuccessful, toast]);

  // Handle code submission from editor
  const handleCodeSubmit = (code: string) => {
    // First show a toast notification
    toast({
      title: "Code submitted",
      description: "Your code has been sent for evaluation.",
      duration: 2000,
    });
    
    // Send code to chat with isCode flag set to true
    sendMessage(code, true);
    
    console.log("Code submitted to chat:", code.substring(0, 50) + "...");
  };

  const handleEditorReset = () => {
    setShouldResetEditor(false);
  };

  return (
    <>
      <div className="p-4 text-lg bg-white/50 backdrop-blur-lg shadow-lg rounded-xl text-center relative">
        {showWarning && <div className="absolute top-0 right-0 bg-yellow-200 text-yellow-800 p-2 rounded">Warning: Action not allowed!</div>}
        <div className="absolute top-0 right-0 p-2 text-sm text-gray-700">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
        You have 1 hour. Please do not switch tabs or change screens. Copy/paste is disabled. If you leave the screen more than once, you will be disqualified. Good luck!
      </div>
      <div className="h-screen bg-background">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={60} minSize={30}>
            <ChatInterface />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={40} minSize={30}>
            <CodeIDE 
            timeLeft={timeLeft}
              onSubmit={handleCodeSubmit}
              shouldReset={shouldResetEditor}
              onResetComplete={handleEditorReset}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
        <Toaster />
      </div>
    </>
  );
};

export default InterviewPage;
