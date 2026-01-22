
import { UnifiedChat } from "@/components/unified-chat/UnifiedChat";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasEditor } from "@/components/editor/CanvasEditor";
import { useState } from "react";

export default function UnifiedStudio() {
    const [activeTab, setActiveTab] = useState("chat");
    const [editorState, setEditorState] = useState<any>(null);

    const handleEdit = (content: any) => {
        setEditorState(content);
        setActiveTab("editor");
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
            <div className="flex flex-col gap-2 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">Unified Studio</h1>
                <p className="text-muted-foreground">
                    Command your AI team or refine designs manually.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList>
                    <TabsTrigger value="chat">Command Room (Chat)</TabsTrigger>
                    <TabsTrigger value="editor">Canvas Studio (Editor)</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
                    <UnifiedChat onEdit={handleEdit} />
                </TabsContent>

                <TabsContent value="editor" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
                    <CanvasEditor initialState={editorState} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
