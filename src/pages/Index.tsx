
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ChatInterface from "@/components/ChatInterface";
import CodeIDE from "@/components/CodeIDE";
import { useChat } from "@/hooks/useChat";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const InterviewPage = () => {
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showWarning, setShowWarning] = useState(false);
  const [userLeftCount, setUserLeftCount] = useState(0);

  const { sendMessage, candidateName, messages, isCodeEvaluationSuccessful, isLoading } = useChat();
  const [questionCount, setQuestionCount] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const navigate = useNavigate();
  const [shouldResetEditor, setShouldResetEditor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
          // Save interview results
          const results = {
            candidateName: candidateName || "Unknown",
            linkedin: "https://linkedin.com/in/example", // Placeholder
            contacts: "example@example.com", // Placeholder
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Calcutta' }),
            timeSpent: `${3600 - prev} seconds`,
            score: 85, // Placeholder
            review: "Selected for next round" // Placeholder
          };
          // Append results to the existing results.json file using Node.js
          const fs = require('fs');
          fs.readFile('results.json', 'utf8', (err, data) => {
            if (err) {
              console.error('Error reading results.json:', err);
              return;
            }
            const resultsArray = JSON.parse(data);
            resultsArray.push(results);
            fs.writeFile('results.json', JSON.stringify(resultsArray, null, 2), 'utf8', (err) => {
              if (err) {
                console.error('Error writing to results.json:', err);
              }
            });
          });

          // Redirect to thank-you page
          navigate("/ThankYou");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerID);
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

  // Function to generate the next coding question
  const generateNextQuestion = () => {
    if (questionCount < 3) {
      // Logic to generate a question based on the current difficulty level
      const question = `Question ${questionCount + 1} with difficulty level ${difficultyLevel}`;
      sendMessage(question, false);
      setQuestionCount(prevCount => prevCount + 1);
      setDifficultyLevel(prevLevel => prevLevel + 1); // Increase difficulty
    } else {
      // Logic to conclude the interview
      console.log("Interview completed. Redirecting to Thank You page.");
      navigate("/ThankYou");
    }
  };

  const handleCodeSubmit = (code: string) => {
    // First show a toast notification
    toast({
      title: "Code submitted",
      description: "Your code has been sent for evaluation.",
      duration: 2000,
    });
    
    // Ensure the code is wrapped in a code block
    const codeBlock = `\`\`\`\n${code}\n\`\`\``;
    
    // After code submission, generate the next question
    generateNextQuestion();
    sendMessage(codeBlock, true);
    
    console.log("Code submitted to chat:", code.substring(0, 50) + "...");
  };

  const handleEditorReset = () => {
    setShouldResetEditor(false);
  };

  return (
    <>
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
