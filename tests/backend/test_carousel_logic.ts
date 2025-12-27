
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { constructUserPrompt, constructSystemPrompt, getTools, COMPANY_CONTEXT } from "../../supabase/functions/generate-linkedin-carousel/functions_logic.ts";

Deno.test("constructUserPrompt - Single Carousel", () => {
  const prompt = constructUserPrompt(
    "My Topic",
    "My Audience",
    "My Pain Point",
    "My Outcome",
    "My Proof",
    "My CTA",
    false,
    1
  );

  assertStringIncludes(prompt, "Topic: My Topic");
  assertStringIncludes(prompt, "Target Audience: My Audience");
  assertStringIncludes(prompt, "Pain Point: My Pain Point");
  assertStringIncludes(prompt, "Outcome: My Outcome");
  assertStringIncludes(prompt, "Proof: My Proof");
  assertStringIncludes(prompt, "CTA: My CTA");
  assertStringIncludes(prompt, "Generate a single high-impact carousel");
});

Deno.test("constructUserPrompt - Batch Carousel", () => {
    const prompt = constructUserPrompt(
      "Topic", "Audience", "Pain", "", "", "",
      true,
      3
    );
  
    assertStringIncludes(prompt, "Generate 3 distinct carousels");
});

Deno.test("constructSystemPrompt - Includes Context", () => {
    const assetsContext = "- [IMAGE] ID: 123";
    const prompt = constructSystemPrompt(assetsContext);
    
    assertStringIncludes(prompt, COMPANY_CONTEXT);
    assertStringIncludes(prompt, "=== ASSET LIBRARY ===");
    assertStringIncludes(prompt, assetsContext);
});

Deno.test("getTools - Single Mode", () => {
    const tools = getTools(false);
    assertEquals(tools.length, 1);
    assertEquals(tools[0].function.name, "create_carousel");
    assertEquals(tools[0].function.parameters.required, ["topic", "targetAudience", "slides", "caption"]);
});

Deno.test("getTools - Batch Mode", () => {
    const tools = getTools(true);
    assertEquals(tools.length, 1);
    assertEquals(tools[0].function.name, "create_batch_carousels");
    assertEquals(tools[0].function.parameters.required, ["carousels"]);
});
