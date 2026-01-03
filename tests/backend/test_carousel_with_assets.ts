// Test script to validate carousel generation with new logo and product features
// This tests the updated LinkedIn carousel generator with company assets and products

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCarouselWithAssets() {
  console.log("🧪 Testing Carousel Generation with Logo Placement and Product References\n");

  // Test 1: ISO Certification Topic (should have ISO badge)
  console.log("Test 1: ISO 13485 Certification Topic");
  console.log("Expected: Logo on slide 1 and last, ISO badge on relevant slides\n");

  const test1Payload = {
    topic: "ISO 13485 Certification",
    targetAudience: "Medical Device Manufacturers",
    painPoint: "Regulatory compliance uncertainty",
    desiredOutcome: "Confident quality management system",
    proofPoints: "ISO 13485:2016 certified, ANVISA approved",
    ctaAction: "Schedule a facility tour",
    mode: "generate",
    wantImages: false, // Skip images for faster testing
    numberOfCarousels: 1
  };

  try {
    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/generate-linkedin-carousel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(test1Payload)
    });

    const result1 = await response1.json();
    console.log("✅ Test 1 Response:", JSON.stringify(result1, null, 2));
    
    // Validate logo placement
    const slides1 = result1.carousel?.slides || [];
    if (slides1.length > 0) {
      const firstSlide = slides1[0];
      const lastSlide = slides1[slides1.length - 1];
      
      console.log(`\n🔍 Logo Validation:`);
      console.log(`- First slide showLogo: ${firstSlide.showLogo} (expected: true)`);
      console.log(`- Last slide showLogo: ${lastSlide.showLogo} (expected: true)`);
      
      // Check middle slides
      if (slides1.length > 2) {
        const middleSlide = slides1[1];
        console.log(`- Middle slide showLogo: ${middleSlide.showLogo} (expected: false)`);
      }
      
      // Check ISO badge
      const hasISOBadge = slides1.some((s: any) => s.showISOBadge);
      console.log(`- Has ISO badge: ${hasISOBadge} (expected: true)`);
    }
  } catch (error) {
    console.error("❌ Test 1 Error:", error);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Test 2: Product-Specific Topic (should have product references)
  console.log("Test 2: Spinal Screws Manufacturing Topic");
  console.log("Expected: Logo on slide 1 and last, product references if products exist\n");

  const test2Payload = {
    topic: "Spinal Screws Manufacturing",
    targetAudience: "Orthopedic OEMs",
    painPoint: "Complex geometries are hard to source",
    desiredOutcome: "Reliable precision manufacturing partner",
    proofPoints: "Citizen M32 Swiss lathes, ZEISS CMM quality control",
    ctaAction: "Request a quote",
    mode: "generate",
    wantImages: false,
    numberOfCarousels: 1
  };

  try {
    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/generate-linkedin-carousel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(test2Payload)
    });

    const result2 = await response2.json();
    console.log("✅ Test 2 Response:", JSON.stringify(result2, null, 2));
    
    // Validate product references
    const slides2 = result2.carousel?.slides || [];
    const hasProductRefs = slides2.some((s: any) => s.productReferenceUrls && s.productReferenceUrls.length > 0);
    console.log(`\n🔍 Product Reference Validation:`);
    console.log(`- Has product references: ${hasProductRefs}`);
    
    if (hasProductRefs) {
      const slideWithRefs = slides2.find((s: any) => s.productReferenceUrls?.length > 0);
      console.log(`- Product URLs: ${slideWithRefs.productReferenceUrls.join(", ")}`);
    }
  } catch (error) {
    console.error("❌ Test 2 Error:", error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Tests completed!");
}

// Run tests
testCarouselWithAssets();
