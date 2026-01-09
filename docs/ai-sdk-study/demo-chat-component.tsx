import { useChat } from 'ai/react'; // Vercel AI SDK Hook
import { Message } from '@ai-elements/react'; // Hypothetical import or your local component

export default function Chat() {
  // useChat handles all the complex state:
  // - inputs
  // - messages array
  // - loading state
  // - streaming updates
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: 'https://dlflpvmdzkeouhgqwqba.supabase.co/functions/v1/chat', // Your Supabase Endpoint
    // Custom headers if needed (e.g. auth)
    // headers: { Authorization: 'Bearer ...' } 
  });

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto border rounded-lg bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}>
              
              {/* Render plain text */}
              {m.content}
              
              {/* OR Use AI Elements if installed: */}
              {/* <Message message={m} /> */}
              
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
            <div className="text-sm text-gray-500 animate-pulse">
                AI is thinking...
            </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          className="w-full p-2 border rounded-md"
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
        />
      </form>
    </div>
  );
}
