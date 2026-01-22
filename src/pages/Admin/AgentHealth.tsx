
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AgentHealth() {
    const [logs, setLogs] = useState<any[]>([]);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const { data } = await supabase
            .from("agent_usage_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        if (data) {
            setLogs(data);
            const sum = data.reduce((acc, log) => acc + (Number(log.cost_estimated) || 0), 0);
            setTotalCost(sum);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Agent Health & Costs</h1>
                <p className="text-muted-foreground">Monitor token usage and circuit breakers.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
                        <p className="text-xs text-muted-foreground">Estimated based on Gemini pricing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Orchestrator, Strategist, Copywriter, Designer</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Circuit Breaker</CardTitle>
                        <Zap className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ARMED</div>
                        <p className="text-xs text-muted-foreground">Stops execution at $5.00/day</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <div className="p-4 bg-muted/50 font-medium text-sm">Recent Activity</div>
                <div className="divide-y">
                    {logs.length === 0 && <div className="p-4 text-sm text-muted-foreground">No recent activity logged.</div>}
                    {logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 text-sm">
                            <div className="flex flex-col">
                                <span className="font-semibold">{log.agent_role}</span>
                                <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-4">
                                <Badge variant="outline">{log.tokens_input} in / {log.tokens_output} out</Badge>
                                <span className="font-mono">${Number(log.cost_estimated).toFixed(5)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
