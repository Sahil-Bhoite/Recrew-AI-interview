
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Landing = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is PDF or DOCX
      if (file.type.includes("pdf") || file.type.includes("word")) {
        setResume(file);
      } else {
        toast.error("Please upload a PDF or DOCX file");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate processing the resume
    setTimeout(() => {
      setIsSubmitting(false);
      // Store resume data in localStorage (in a real app, you'd process this)
      if (resume) {
        localStorage.setItem("candidateName", name);
        localStorage.setItem("hasResume", "true");
      }
      
      // Navigate to the interview page
      navigate("/interview");
      toast.success("Ready for your interview!");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md bg-background rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">RecrewAI</h1>
          <p className="text-muted-foreground">Technical Interview Assistant</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Your Name
            </label>
            <Input 
              id="name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Upload Resume (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
                accept=".pdf,.docx"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                {resume ? (
                  <p className="text-sm text-primary">{resume.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF or DOCX (Max 5MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting || !name}>
            {isSubmitting ? "Processing..." : "Start Interview"}
          </Button>
        </form>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p className="text-center">We'll use your resume to personalize your interview experience.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
