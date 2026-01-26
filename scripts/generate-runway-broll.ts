/**
 * Generate B-roll footage using Runway Gen-3 API
 *
 * Usage: npx ts-node scripts/generate-runway-broll.ts
 *
 * Requires: RUNWAY_API_KEY in .env
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import RunwayML from '@runwayml/sdk';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

if (!RUNWAY_API_KEY) {
  console.error('❌ RUNWAY_API_KEY not found in .env');
  process.exit(1);
}

const client = new RunwayML({ apiKey: RUNWAY_API_KEY });

// B-roll prompts using existing images as input
const BROLL_PROMPTS = [
  {
    id: 'broll-04-cnc',
    imagePath: 'src/assets/equipment/citizen-l32.webp',
    prompt: 'Cinematic camera movement around CNC Swiss lathe, metal shavings flying, oil coolant mist, precision manufacturing, shallow depth of field, professional lighting, smooth dolly motion',
    duration: 5,
  },
  {
    id: 'broll-05-metrology',
    imagePath: 'src/assets/metrology/zeiss-contura.webp',
    prompt: 'Slow zoom into precision metrology machine, measuring probe moving, blue LED indicators glowing, clean white laboratory environment, smooth cinematic motion',
    duration: 5,
  },
  {
    id: 'broll-06-electropolish',
    imagePath: 'src/assets/equipment/electropolish-line.webp',
    prompt: 'Gentle camera pan across electropolishing equipment, bubbles rising in chemical bath, reflective metal surfaces, industrial manufacturing process, cinematic lighting',
    duration: 5,
  },
  {
    id: 'broll-07-laser',
    imagePath: 'src/assets/equipment/laser-marking.webp',
    prompt: 'Close-up of laser marking in action, bright beam engraving, smoke wisps rising, precision high-tech manufacturing, shallow depth of field, dramatic lighting',
    duration: 5,
  },
];

async function imageToBase64(imagePath: string): Promise<string> {
  const fullPath = path.join(__dirname, '..', imagePath);
  const imageBuffer = fs.readFileSync(fullPath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

async function generateBroll(prompt: typeof BROLL_PROMPTS[0]) {
  console.log(`\n🎬 Generating: ${prompt.id}`);
  console.log(`📷 Image: ${prompt.imagePath}`);
  console.log(`📝 Prompt: ${prompt.prompt.substring(0, 80)}...`);

  try {
    // Convert image to base64 data URI
    const imageDataUri = await imageToBase64(prompt.imagePath);
    console.log(`📦 Image loaded (${(imageDataUri.length / 1024).toFixed(0)} KB base64)`);

    // Create image-to-video task with image input
    // Note: Runway only supports 1280:768 (landscape) or 768:1280 (portrait)
    const task = await client.imageToVideo.create({
      model: 'gen3a_turbo',
      promptImage: imageDataUri,
      promptText: prompt.prompt,
      duration: prompt.duration,
      ratio: '1280:768',
    });

    console.log(`⏳ Task created: ${task.id}`);

    // Poll for completion
    let result = await client.tasks.retrieve(task.id);
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while ((result.status === 'PENDING' || result.status === 'RUNNING') && attempts < maxAttempts) {
      console.log(`   Status: ${result.status}... (${attempts * 5}s)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      result = await client.tasks.retrieve(task.id);
      attempts++;
    }

    if (result.status === 'SUCCEEDED' && result.output) {
      const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;

      // Download video
      const videoResponse = await fetch(videoUrl);
      const videoBuffer = await videoResponse.arrayBuffer();

      const outputPath = path.join(__dirname, `../public/remotion/broll/${prompt.id}.mp4`);
      fs.writeFileSync(outputPath, Buffer.from(videoBuffer));

      console.log(`✅ Saved: ${outputPath}`);
      console.log(`📊 Size: ${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

      return outputPath;
    } else {
      console.error(`❌ Task failed: ${result.status}`);
      if (result.failure) console.error(`   Reason: ${result.failure}`);
      return null;
    }
  } catch (error: any) {
    console.error(`❌ Error generating ${prompt.id}:`, error.message || error);
    return null;
  }
}

async function main() {
  console.log('🎬 Runway Gen-3 B-roll Generator (Image-to-Video)');
  console.log('=================================================\n');

  const results: string[] = [];

  for (const prompt of BROLL_PROMPTS) {
    const result = await generateBroll(prompt);
    if (result) results.push(result);

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n=================================================');
  console.log(`✅ Generated ${results.length}/${BROLL_PROMPTS.length} videos`);
  results.forEach(r => console.log(`   - ${r}`));
}

main().catch(console.error);
