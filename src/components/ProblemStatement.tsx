
import { cn } from "@/lib/utils";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemStatementProps {
  title: string;
  description: string;
  examples: Example[];
  constraints: string[];
}

export const ProblemStatement = ({
  title,
  description,
  examples,
  constraints,
}: ProblemStatementProps) => {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">{title}</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Description</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {examples.map((ex, idx) => (
        <div key={idx} className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Example {idx + 1}</h3>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex gap-2">
              <span className="font-medium">Input:</span>
              <code className="bg-background px-2 py-1 rounded">{ex.input}</code>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">Output:</span>
              <code className="bg-background px-2 py-1 rounded">{ex.output}</code>
            </div>
            {ex.explanation && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Explanation:</strong> {ex.explanation}
              </p>
            )}
          </div>
        </div>
      ))}

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Constraints</h3>
        <ul className="list-disc pl-6 space-y-1">
          {constraints.map((c, idx) => (
            <li key={idx} className="text-muted-foreground">
              <code>{c}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
