import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Type, Square, Image as ImageIcon } from 'lucide-react';

interface CanvasEditorProps {
    initialState?: any;
}

export function CanvasEditor({ initialState }: CanvasEditorProps) {
    const stageRef = useRef(null);
    const [selectedId, selectShape] = useState(null);
    const [elements, setElements] = useState([
        { id: 'rect1', type: 'rect', x: 50, y: 50, width: 100, height: 100, fill: '#004F8F' },
        { id: 'text1', type: 'text', x: 200, y: 50, text: 'Hello Lifetrek', fontSize: 24, fill: 'black' }
    ]);

    React.useEffect(() => {
        if (initialState && initialState.text) {
            const newText = {
                id: `text-${Date.now()}`,
                type: 'text',
                x: 100,
                y: 100,
                text: initialState.text,
                fontSize: 24,
                fill: 'black'
            };
            setElements(prev => [...prev, newText]);
        }
    }, [initialState]);

    const addRect = () => {
        const newRect = {
            id: `rect${elements.length + 1}`,
            type: 'rect',
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            fill: '#1A7A3E'
        };
        setElements([...elements, newRect]);
    };

    const addText = () => {
        const newText = {
            id: `text${elements.length + 1}`,
            type: 'text',
            x: 150,
            y: 150,
            text: 'New Text',
            fontSize: 20,
            fill: 'black'
        };
        setElements([...elements, newText]);
    };

    const handleExport = () => {
        const uri = stageRef.current.toDataURL();
        const link = document.createElement('a');
        link.download = 'design.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex bg-gray-50 h-[80vh] border rounded-xl overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 bg-white border-r flex flex-col items-center py-4 gap-4">
                <Button variant="ghost" size="icon" onClick={addText} title="Add Text">
                    <Type className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={addRect} title="Add Shape">
                    <Square className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" title="Add Image (Placeholder)">
                    <ImageIcon className="h-5 w-5" />
                </Button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                <div className="bg-white shadow-lg">
                    <Stage width={800} height={600} ref={stageRef} className="border">
                        <Layer>
                            <Rect x={0} y={0} width={800} height={600} fill="white" />
                            {elements.map((el, i) => {
                                if (el.type === 'rect') {
                                    return <Rect key={el.id} {...el} draggable />;
                                } else if (el.type === 'text') {
                                    return <Text key={el.id} {...el} draggable />;
                                }
                                return null;
                            })}
                        </Layer>
                    </Stage>
                </div>
            </div>

            {/* Properties Panel */}
            <div className="w-64 bg-white border-l p-4">
                <h3 className="font-semibold mb-4">Properties</h3>
                <Button onClick={handleExport} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Export PNG
                </Button>
            </div>
        </div>
    );
}
