// supabase/functions/website-bot/tools.ts
// STRICTLY LIMITED tools for the public website bot.
// NO internal generation tools allowed here.

import { DynamicStructuredTool } from "npm:@langchain/core/tools";
import { z } from "npm:zod";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const createSaveLeadTool = (supabase: SupabaseClient) => {
  return new DynamicStructuredTool({
    name: "save_lead",
    description: "Saves a potential client's contact information (email, phone, name) when they express interest.",
    schema: z.object({
      name: z.string().optional().describe("The name of the lead"),
      email: z.string().optional().describe("The email address of the lead"),
      phone: z.string().optional().describe("The phone number of the lead"),
      company: z.string().optional().describe("The company name of the lead"),
      notes: z.string().optional().describe("Any specific notes or request details"),
    }),
    func: async ({ name, email, phone, company, notes }) => {
        console.log("📝 save_lead tool invoked:", { name, email, phone, company });
      try {
        const { error } = await supabase.from("contact_leads").insert({
          name,
          email,
          phone,
          company,
          notes,
          source: "website_bot",
        });

        if (error) throw error;
        return "Lead information saved successfully. A specialist will contact them.";
      } catch (error) {
        console.error("Error saving lead:", error);
        return "Error saving lead details.";
      }
    },
  });
};

export const createSearchKnowledgeTool = (supabase: SupabaseClient, openRouterKey: string) => {
  return new DynamicStructuredTool({
    name: "search_knowledge",
    description: "Searches the Lifetrek knowledge base (Vector Store) for specific information about products, certifications (ISO), and capabilities.",
    schema: z.object({
      query: z.string().describe("The search query to find relevant information"),
    }),
    func: async ({ query }) => {
      try {
        console.log("🔍 Searching Knowledge Base (Vector + Text):", query);

        // 1. Generate Embedding for Query (using OpenRouter/OpenAI compatible)
        let embedding = null;
        try {
            const embeddingResp = await fetch("https://openrouter.ai/api/v1/embeddings", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "text-embedding-3-small", // or available embedding model
                    input: query
                })
            });
            const embeddingData = await embeddingResp.json();
            if (embeddingData?.data?.[0]?.embedding) {
                embedding = embeddingData.data[0].embedding;
            }
        } catch (e) {
            console.warn("⚠️ Embedding generation failed, falling back to text search.", e);
        }

        let results = [];
        
        // 2. Vector Search (if embedding successful)
        if (embedding) {
            const { data: vectorResults, error: vectorError } = await supabase.rpc("match_product_assets", {
                query_embedding: embedding,
                match_threshold: 0.5,
                match_count: 5
            });
            if (!vectorError && vectorResults) results.push(...vectorResults);
        }

        // 3. Fallback/Hybrid: Text Search (always runs to catch exact keywords)
        const { data: textResults, error: textError } = await supabase
            .from("product_catalog")
            .select("name, description, metadata")
            .textSearch("description", query, { type: "websearch", config: "english" })
            .limit(3);
        
        if (!textError && textResults) {
            // Dedup logic would go here, simple concat for now
            results.push(...textResults);
        }

        if (results.length === 0) {
            return "No specific documents found in the knowledge base matching that query.";
        }

        // Format results for the agent
        return JSON.stringify(results.map(r => ({
            name: r.name,
            content: r.description || r.content, // Handle varied schema
            metadata: r.metadata
        })).slice(0, 5));

      } catch (error) {
        console.error("Error searching knowledge:", error);
        return "Error searching knowledge base.";
      }
    },
  });
};
