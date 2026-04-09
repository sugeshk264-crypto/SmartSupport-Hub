import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  FileText, 
  MessageSquare, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Copy, 
  RefreshCw,
  BookOpen,
  Tag,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { analyzeConversation, KBArticle } from "@/services/gemini";
import { cn } from "@/lib/utils";

export default function App() {
  const [conversation, setConversation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<KBArticle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!conversation.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeConversation(conversation);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the conversation. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `
Title: ${result.title}
Category: ${result.category}
Problem: ${result.problem}
Cause: ${result.cause}
Solution: ${result.solution}
Step-by-step Fix:
${result.stepByStepFix.map((step, i) => `${i + 1}. ${step}`).join("\n")}
Keywords: ${result.keywords.join(", ")}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setConversation("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">Support KB Generator</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
              AI Powered
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Analyze Conversation</h2>
              <p className="text-slate-500">Paste your customer support chat transcript below to generate a structured Knowledge Base article.</p>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Chat Transcript</span>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste conversation here... (e.g. Customer: I can't log in. Agent: Let me help you with that...)"
                  className="min-h-[400px] resize-none border-slate-200 focus:ring-blue-500 focus:border-blue-500 transition-all text-base leading-relaxed"
                  value={conversation}
                  onChange={(e) => setConversation(e.target.value)}
                />
              </CardContent>
              <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-slate-500 hover:text-slate-700"
                  disabled={!conversation || isAnalyzing}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!conversation.trim() || isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 px-6"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Result Section */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-[600px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">No Article Generated</h3>
                  <p className="text-slate-500 max-w-xs mt-2">
                    Paste a conversation and click analyze to see the Knowledge Base article here.
                  </p>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[600px] flex flex-col items-center justify-center p-8 border border-slate-200 rounded-2xl bg-white shadow-sm"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mt-6">Processing Chat</h3>
                  <p className="text-slate-500 mt-2">Identifying issues and generating solutions...</p>
                  
                  <div className="mt-8 space-y-3 w-full max-w-xs">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-400"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-medium">
                          {result.category}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCopy}
                            className={cn(
                              "h-8 transition-all",
                              copied ? "bg-green-50 text-green-600 border-green-200" : "hover:bg-slate-100"
                            )}
                          >
                            {copied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1.5" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
                        {result.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[500px]">
                        <div className="p-6 space-y-8">
                          {/* Problem & Cause */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" />
                                Problem
                              </h4>
                              <p className="text-slate-700 leading-relaxed">{result.problem}</p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                Cause
                              </h4>
                              <p className="text-slate-700 leading-relaxed">{result.cause}</p>
                            </div>
                          </div>

                          <Separator className="bg-slate-100" />

                          {/* Solution */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3" />
                              Solution Summary
                            </h4>
                            <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl text-slate-800 leading-relaxed">
                              {result.solution}
                            </div>
                          </div>

                          {/* Steps */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Step-by-step Fix</h4>
                            <div className="space-y-3">
                              {result.stepByStepFix.map((step, index) => (
                                <div key={index} className="flex gap-4 group">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {index + 1}
                                  </div>
                                  <p className="text-slate-700 pt-0.5">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator className="bg-slate-100" />

                          {/* Keywords */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              <Tag className="w-3 h-3" />
                              Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.keywords.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200 transition-colors">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>© 2026 Support KB Generator. Powered by Gemini AI.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
