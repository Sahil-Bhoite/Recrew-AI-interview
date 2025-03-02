
import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Spinner } from "@/components/ui/spinner";

const languages = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" },
  { id: "ruby", name: "Ruby" },
  { id: "go", name: "Go" },
];

const languageTemplates: Record<string, string> = {
  javascript: `// Write your JavaScript solution here\n\nfunction solution(input) {\n  // Your code here\n  \n  return result;\n}\n`,
  typescript: `// Write your TypeScript solution here\n\nfunction solution(input: any): any {\n  // Your code here\n  \n  return result;\n}\n`,
  python: `# Write your Python solution here\n\ndef solution(input):\n    # Your code here\n    \n    return result\n`,
  java: `// Write your Java solution here\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Test your solution\n    }\n    \n    public static Object solution(Object input) {\n        // Your code here\n        \n        return result;\n    }\n}\n`,
  cpp: `// Write your C++ solution here\n\n#include <iostream>\n\nclass Solution {\npublic:\n    // Your solution method\n    void solution() {\n        // Your code here\n    }\n};\n\nint main() {\n    // Test your solution\n    return 0;\n}\n`,
  csharp: `// Write your C# solution here\n\nusing System;\n\npublic class Solution {\n    public static object SolveChallenge(object input) {\n        // Your code here\n        \n        return result;\n    }\n}\n`,
  ruby: `# Write your Ruby solution here\n\ndef solution(input)\n  # Your code here\n  \n  return result\nend\n`,
  go: `// Write your Go solution here\n\npackage main\n\nimport "fmt"\n\nfunc solution(input interface{}) interface{} {\n    // Your code here\n    \n    return result\n}\n\nfunc main() {\n    // Test your solution\n}\n`
};

interface CodeIDEProps {
  onSubmit: (code: string) => void;
  shouldReset?: boolean;
  onResetComplete?: () => void;
  timeLeft: number;
}

const CodeIDE = ({ onSubmit, shouldReset = false, onResetComplete, timeLeft }: CodeIDEProps) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(languageTemplates.javascript || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (shouldReset) {
      setCode(languageTemplates[language] || "");
      onResetComplete?.();
    }
  }, [shouldReset, language, onResetComplete]);

  const handleLanguageChange = (newLanguage: string) => {
    if (code === languageTemplates[language] || !code.trim()) {
      setCode(languageTemplates[newLanguage] || "");
    } else if (window.confirm("Change language? This will replace your current code.")) {
      setCode(languageTemplates[newLanguage] || "");
    }
    setLanguage(newLanguage);
  };

  const handleSubmit = () => {
    // Don't submit if there's absolutely nothing
    if (!code.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Format the code with the language before submitting
      const formattedCode = `\`\`\`${language}\n${code}\n\`\`\``;
      
      // Call onSubmit directly with the formatted code
      onSubmit(formattedCode);
      console.log("Code submitted:", code.substring(0, 50) + "...");
    } catch (error) {
      console.error("Error submitting code:", error);
    }
    
    // Set a timeout to reset the submitting state
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  // Handle keyboard shortcut (Ctrl+Enter or Cmd+Enter) for submission
  const handleEditorKeyDown = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault(); // Prevent default behavior
      if (code.trim()) {
        handleSubmit();
      }
    }
  };


  return (
    <div className="h-full flex flex-col backdrop-blur-md bg-white/30 shadow-lg rounded-xl" onKeyDown={handleEditorKeyDown}>
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-4">
            <div className="text-xl font-semibold">Code Editor</div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-700 ml-auto">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
        <div className="p-2 bg-white/40 dark:bg-gray-800/40 text-sm backdrop-blur-md border-t border-white/20">
          You can use the code editor to write your code and submit it in chat
        </div>
        <ResizablePanelGroup direction="vertical" className="flex-grow">
          <ResizablePanel defaultSize={100}>
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on"
              }}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
  );
};

export default CodeIDE;
