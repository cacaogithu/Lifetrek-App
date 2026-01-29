/**
 * Generate voiceover using ElevenLabs API (ESM Version)
 * Usage: node scripts/generate-voiceover.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read API Key from process environment or .env file manually
let apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/ELEVENLABS_API_KEY=(.*)/);
        if (match && match[1]) {
            apiKey = match[1].trim();
            console.log('✅ Found API Key in .env file.');
        }
    }
  } catch (e) {
    // ignore
  }
}

if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY not found in environment or .env');
    process.exit(1);
}

const VOICE_ID = 'pqHfZKP75CvOlQylNhV4'; // Bill - deep, professional

// Full storytelling script (~80-90s)
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
  console.log('🎙️ Generating voiceover with ElevenLabs (ESM)...');
  console.log(`📝 Script length: ${SCRIPT.length} characters`);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
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
    console.error(`❌ API Error: ${response.status} - ${error}`);
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Ensure directory exists
  const outputDir = path.join(__dirname, '../public/remotion');
  if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'voiceover.mp3');

  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Voiceover saved to: ${outputPath}`);
  console.log(`📊 File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
}

generateVoiceover().catch(err => {
    console.error(err);
    process.exit(1);
});
