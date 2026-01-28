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

// Full storytelling script (~80-90s) - Patient risk → Safety with technical proof
// Structure: Drone → Factory → Cleanroom → Machines → Impact
const SCRIPT = `
Do lado de fora, parece apenas mais uma fábrica.
Mas aqui dentro, cada micrômetro importa.
Um desvio mínimo pode significar uma cirurgia de revisão, uma dor a mais para alguém que já sofreu demais.

Há mais de 30 anos, a Lifetrek Medical transforma engenharia de precisão em segurança para implantes e instrumentais usados todos os dias em hospitais no Brasil e no mundo.

Somos certificados ISO 13485 e aprovados pela ANVISA.
Isso não é só selo em parede: é rastreabilidade, controle e consistência em cada lote que entra e sai das nossas salas limpas.

Em células CNC de última geração, usinamos titânio, PEEK e ligas especiais em tolerâncias de mícron.
Parafusos pediculares, cages, instrumentais… tudo pensado para resistir a milhões de ciclos de carga sem falhar.

Nossa metrologia avançada não "confere" a peça.
Ela documenta cada dimensão crítica, para que seus ensaios de fadiga, suas auditorias e registros regulatórios tenham base sólida.

Da barra de material à embalagem em sala limpa ISO 7, cada etapa foi desenhada para reduzir seu risco, encurtar seu lead time e liberar capital preso em estoque importado.

Por isso, não nos vemos como simples fornecedores.
Trabalhamos junto com seu P&D e sua Qualidade para otimizar desenhos, validar processos e acelerar lançamentos – sem comprometer a segurança do paciente.

Lifetrek Medical.
Precisão, qualidade e parceria para quem leva a sério o impacto de cada componente na vida real.
Fale com nossa equipe e vamos desenhar o próximo avanço em saúde, juntos.
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
