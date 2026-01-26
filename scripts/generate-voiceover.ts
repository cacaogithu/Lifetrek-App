/**
 * Generate voiceover using ElevenLabs API
 *
 * Usage: npx ts-node scripts/generate-voiceover.ts
 *
 * Requires: ELEVENLABS_API_KEY in .env
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY not found in .env');
  process.exit(1);
}

// Portuguese Brazilian voice - professional male
const VOICE_ID = 'pqHfZKP75CvOlQylNhV4'; // Bill - deep, professional

// Script condensed to fit 400 credits (~52s video)
const SCRIPT = `
Lifetrek Medical. Engenharia de precisão que protege vidas.

Há mais de trinta anos, fabricamos componentes médicos para quem não pode errar.

Salas limpas ISO Classe 7. Rastreabilidade total.

CNC Swiss. Tolerâncias de mícron. Repetibilidade real.

Metrologia Zeiss. Laser UDI. Eletropolimento.

Instrumentais. Implantes. Sistemas espinhais.

ISO 13485. ANVISA.

Lifetrek. Seu parceiro técnico.
`.trim();

async function generateVoiceover() {
  console.log('🎙️ Generating voiceover with ElevenLabs...');
  console.log(`📝 Script length: ${SCRIPT.length} characters`);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: SCRIPT,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const outputPath = path.join(__dirname, '../public/remotion/voiceover.mp3');

  fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
  console.log(`✅ Voiceover saved to: ${outputPath}`);
  console.log(`📊 File size: ${(audioBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
}

generateVoiceover().catch(console.error);
