
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, FileText, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { dispatchResearchJob, getJobStatus } from "@/lib/agents";
import { supabase } from "@/integrations/supabase/client";

interface ResearchJob {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: {
        report: string;
    };
    created_at: string;
    payload: {
        topic: string;
        depth: string;
    };
}

export default function Research() {
    const [topic, setTopic] = useState("");
    const [depth, setDepth] = useState<"deep" | "comprehensive">("deep");
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [report, setReport] = useState<string | null>(null);
    const [history, setHistory] = useState<ResearchJob[]>([]);
    const { toast } = useToast();

    // Fetch History
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('jobs')
            .select('*')
            .eq('type', 'deep_research')
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) setHistory(data as any);
    };

    // Polling for Active Job
    useEffect(() => {
        if (!currentJobId) return;

        const interval = setInterval(async () => {
            try {
                const job = await getJobStatus(currentJobId);
                console.log("Polling Job:", job.status);

                if (job.status === 'completed') {
                    setReport(job.result.report);
                    setIsGenerating(false);
                    setCurrentJobId(null);
                    fetchHistory();
                    toast({ title: "Research Complete", description: "Report generated successfully." });
                } else if (job.status === 'failed') {
                    setIsGenerating(false);
                    setCurrentJobId(null);
                    toast({ title: "Research Failed", description: job.error, variant: "destructive" });
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000); // Poll every 5s (Research takes time)

        return () => clearInterval(interval);
    }, [currentJobId]);

    const handleResearch = async () => {
        if (!topic) return;

        setIsGenerating(true);
        setReport(null);

        try {
            const jobId = await dispatchResearchJob(topic, depth);
            setCurrentJobId(jobId);
            toast({ title: "Agent Activated", description: "Deep Research Agent is scouring the web..." });
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
            setIsGenerating(false);
        }
    };

    const loadReport = (job: ResearchJob) => {
        if (job.status === 'completed' && job.result?.report) {
            setReport(job.result.report);
            setTopic(job.payload.topic);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Search className="w-8 h-8 text-primary" />
                        Deep Research Agent
                    </h1>
                    <p className="text-muted-foreground">
                        Autonomous internet research and report synthesis.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input  */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Mission</CardTitle>
                            <CardDescription>Define the research parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Research Topic</Label>
                                <Textarea
                                    placeholder="e.g. Market analysis of AI Agents in Real Estate..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Depth</Label>
                                <Select value={depth} onValueChange={(v: any) => setDepth(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="deep">Deep (Fast) - ~2 mins</SelectItem>
                                        <SelectItem value="comprehensive">Comprehensive (Slow) - ~5 mins</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleResearch}
                                disabled={isGenerating || !topic}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Researching...
                                    </>
                                ) : (
                                    "Start Research"
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {history.map(job => (
                                    <div
                                        key={job.id}
                                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors flex items-center justify-between"
                                        onClick={() => loadReport(job)}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="font-medium truncate">{job.payload.topic}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            {job.status === 'completed' && <FileText className="w-4 h-4 text-green-500" />}
                                            {job.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                                            {job.status === 'failed' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Report Viewer */}
                <div className="lg:col-span-2">
                    {report ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Research Report</CardTitle>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{report}</ReactMarkdown>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[400px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                            {isGenerating ? (
                                <div className="text-center space-y-4">
                                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                                    <p>Agent is browsing the web...</p>
                                    <p className="text-sm">This may take a few minutes.</p>
                                </div>
                            ) : (
                                <p>Select a report from history or start a new mission.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
