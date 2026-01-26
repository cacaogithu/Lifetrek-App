/**
 * Generate B-roll footage using Runway Gen-3 API
 *
 * Usage: npx ts-node scripts/generate-runway-broll.ts
 *
 * Requires: RUNWAY_API_KEY in .env
 */

import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import RunwayML from '@runwayml/sdk';

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

if (!RUNWAY_API_KEY) {
  console.error('❌ RUNWAY_API_KEY not found in .env');
  process.exit(1);
}

const client = new RunwayML({ apiKey: RUNWAY_API_KEY });

// B-roll prompts for medical manufacturing
const BROLL_PROMPTS = [
  {
    id: 'broll-04-cnc',
    prompt: 'Cinematic close-up of CNC Swiss lathe machining a titanium medical implant, metal shavings flying, oil coolant mist, precision manufacturing, shallow depth of field, 4K industrial footage, professional lighting',
    duration: 5,
  },
  {
    id: 'broll-05-metrology',
    prompt: 'Professional metrology laboratory, Zeiss CMM machine measuring a surgical instrument, coordinate measuring, blue LED indicators, clean white environment, precision engineering, 4K quality',
    duration: 5,
  },
  {
    id: 'broll-06-electropolish',
    prompt: 'Medical-grade electropolishing process, stainless steel surgical instruments being polished in electrochemical bath, bubbles rising, mirror finish result, industrial manufacturing, cinematic lighting',
    duration: 5,
  },
  {
    id: 'broll-07-laser',
    prompt: 'Precision laser marking medical device with UDI code, bright laser beam engraving serial number on titanium implant, smoke wisps, close-up macro shot, high-tech manufacturing',
    duration: 5,
  },
];

async function generateBroll(prompt: typeof BROLL_PROMPTS[0]) {
  console.log(`\n🎬 Generating: ${prompt.id}`);
  console.log(`📝 Prompt: ${prompt.prompt.substring(0, 100)}...`);

  try {
    // Create image-to-video task
    const task = await client.imageToVideo.create({
      model: 'gen3a_turbo',
      promptText: prompt.prompt,
      duration: prompt.duration,
      ratio: '16:9',
    });

    console.log(`⏳ Task created: ${task.id}`);

    // Poll for completion
    let result = await client.tasks.retrieve(task.id);
    while (result.status === 'PENDING' || result.status === 'RUNNING') {
      console.log(`   Status: ${result.status}...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      result = await client.tasks.retrieve(task.id);
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
  } catch (error) {
    console.error(`❌ Error generating ${prompt.id}:`, error);
    return null;
  }
}

async function main() {
  console.log('🎬 Runway Gen-3 B-roll Generator');
  console.log('================================\n');

  const results: string[] = [];

  for (const prompt of BROLL_PROMPTS) {
    const result = await generateBroll(prompt);
    if (result) results.push(result);

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n================================');
  console.log(`✅ Generated ${results.length}/${BROLL_PROMPTS.length} videos`);
  results.forEach(r => console.log(`   - ${r}`));
}

main().catch(console.error);
