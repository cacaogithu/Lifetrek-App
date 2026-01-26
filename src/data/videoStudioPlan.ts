export type VideoScene = {
  id: string;
  label: string;
  kind: "broll" | "image";
  durationSeconds: number;
  asset: string;
  notes: string;
  fallbackAsset?: string;
  optional?: boolean;
  altAssets?: string[];
  onScreen?: string;
};

export type VideoPrompt = {
  id: string;
  label: string;
  durationSeconds: number;
  prompt: string;
};

export const videoStudioPlan = {
  title: "Master Showcase Lifetrek",
  headline:
    "Desenvolva componentes medicos de precisao com fabricacao certificada ISO 13485.",
  linkedinLine:
    "Fabricamos produtos da area medica com qualidade, precisao e equipamentos de alta tecnologia.",
  language: "pt-BR",
  targetDurationSeconds: 83,
  tone: "premium, tecnico, parceria",
  script:
    "De fora, e uma fabrica.\n" +
    "Por dentro, e onde cada micron protege uma vida.\n\n" +
    "Ha mais de 30 anos, a Lifetrek Medical fabrica componentes medicos com precisao, qualidade e rastreabilidade para quem nao pode errar.\n\n" +
    "ISO 13485 e ANVISA nao sao selos para mostrar:\n" +
    "sao processos que controlam cada variavel, em cada lote.\n\n" +
    "Com tecnologia CNC de ultima geracao, usinamos titanio, PEEK e ligas especiais em tolerancias de micron, com repetibilidade real.\n\n" +
    "Metrologia avancada garante o que importa:\n" +
    "dimensao critica validada, documentacao solida, auditorias seguras.\n\n" +
    "Do instrumental cirurgico ao implante ortopedico, cada peca sai pronta para performance clinica, com menos risco e mais previsibilidade para voce.\n\n" +
    "Nao somos apenas fornecedores.\n" +
    "Somos parceiros tecnicos para acelerar lancamentos, reduzir lead time e elevar a confiabilidade do seu produto.\n" +
    "Lifetrek Medical. Precisao e parceria para a inovacao em saude.",
  scenes: [
    {
      id: "broll-drone",
      label: "Drone panoramico",
      kind: "broll",
      durationSeconds: 5,
      asset: "/remotion/broll/broll-01-drone-rise.mp4",
      notes: "Abertura com subida vertical suave.",
    },
    {
      id: "broll-facade",
      label: "Aproximacao da fachada",
      kind: "broll",
      durationSeconds: 5,
      asset: "/remotion/broll/broll-02-facade-push.mp4",
      notes: "Push-in suave para transicao.",
    },
    {
      id: "facility-reception",
      label: "Recepcao e marca",
      kind: "image",
      durationSeconds: 8,
      asset: "/src/assets/facility/reception-hero.webp",
      notes: "Headline + prova de certificacao.",
      onScreen:
        "Desenvolva componentes medicos de precisao com fabricacao certificada ISO 13485.",
    },
    {
      id: "facility-cleanroom",
      label: "Salas limpas",
      kind: "broll",
      durationSeconds: 8,
      asset: "/remotion/broll/broll-03-cleanroom.mp4",
      notes: "Porta abrindo, EPI, controle de processo.",
      fallbackAsset: "/src/assets/facility/cleanroom.webp",
      altAssets: ["/src/assets/facility/cleanroom-hero.webp"],
      onScreen: "Tecnologia CNC | Salas limpas | Metrologia avancada",
    },
    {
      id: "equipment-cnc",
      label: "CNC de precisao",
      kind: "broll",
      durationSeconds: 8,
      asset: "/remotion/broll/broll-04-cnc.mp4",
      notes: "Macro de usinagem, movimentacao precisa.",
      fallbackAsset: "/src/assets/equipment/citizen-l32.webp",
      altAssets: [
        "/src/assets/equipment/tornos-gt26.webp",
        "/src/assets/equipment/robodrill.webp",
      ],
    },
    {
      id: "metrology",
      label: "Metrologia avancada",
      kind: "broll",
      durationSeconds: 7,
      asset: "/remotion/broll/broll-05-metrology.mp4",
      notes: "CMM/microscopio, laboratorio clean.",
      fallbackAsset: "/src/assets/metrology/zeiss-contura.webp",
      altAssets: [
        "/src/assets/metrology/olympus-microscope.webp",
        "/src/assets/metrology/lab-overview.webp",
      ],
    },
    {
      id: "packaging",
      label: "Embalagem esteril",
      kind: "broll",
      durationSeconds: 6,
      asset: "/remotion/broll/broll-06-packaging.mp4",
      notes: "Opcional: fechamento e seguranca regulatoria.",
      optional: true,
      fallbackAsset: "/src/assets/products/surgical-instruments-new.webp",
    },
    {
      id: "product-surgical",
      label: "Instrumentais cirurgicos",
      kind: "image",
      durationSeconds: 8,
      asset: "/src/assets/products/surgical-instruments-new.webp",
      notes: "Performance clinica.",
    },
    {
      id: "product-orthopedic",
      label: "Implantes ortopedicos",
      kind: "image",
      durationSeconds: 7,
      asset: "/src/assets/products/orthopedic-screws-optimized.webp",
      notes: "Precisao e confiabilidade.",
    },
    {
      id: "product-spinal",
      label: "Implantes avancados",
      kind: "image",
      durationSeconds: 7,
      asset: "/src/assets/products/spinal-implants-optimized.webp",
      notes: "Consistencia em escala.",
    },
    {
      id: "certifications",
      label: "Certificacoes",
      kind: "image",
      durationSeconds: 6,
      asset: "/src/assets/certifications/iso.jpg",
      notes: "ISO 13485 + ANVISA em destaque.",
    },
    {
      id: "facility-exterior",
      label: "Fechamento",
      kind: "image",
      durationSeconds: 8,
      asset: "/src/assets/facility/exterior-hero.webp",
      notes: "CTA com parceria e confiabilidade.",
      onScreen: "Mais flexibilidade | Mais velocidade | Mais qualidade",
    },
  ],
  veoPrompts: [
    {
      id: "veo-drone",
      label: "Drone panoramico",
      durationSeconds: 6,
      prompt:
        "Slow cinematic drone approach to a modern medical manufacturing facility at sunrise, clean industrial campus, soft morning haze, subtle blue tone, ultra-clean, no logos, no text, no people.",
    },
    {
      id: "veo-facade",
      label: "Fachada com push-in",
      durationSeconds: 6,
      prompt:
        "Smooth gimbal push-in toward a modern factory entrance, glass and metal architecture, minimal signage (no readable text), clean and premium look, soft blue-gray color grade.",
    },
    {
      id: "veo-cleanroom",
      label: "Corredor de sala limpa",
      durationSeconds: 6,
      prompt:
        "Slow dolly shot through a bright ISO cleanroom corridor, technicians in white PPE suits and masks, stainless surfaces, soft clinical lighting, sterile and precise, no brand logos.",
    },
    {
      id: "veo-cnc",
      label: "CNC macro",
      durationSeconds: 6,
      prompt:
        "Macro close-up of a CNC machine machining a small titanium medical component, precision movement, coolant mist, no sparks, ultra clean environment, premium lighting.",
    },
    {
      id: "veo-metrology",
      label: "Metrologia",
      durationSeconds: 6,
      prompt:
        "Close-up of a coordinate measuring machine (CMM) scanning a metal component in a metrology lab, blue indicator lights, precise robotic motion, clinical, clean.",
    },
    {
      id: "veo-packaging",
      label: "Embalagem esteril",
      durationSeconds: 6,
      prompt:
        "Gloved hands sealing a sterile medical pouch in a cleanroom packaging station, slow motion, soft highlights, medical-grade cleanliness, no visible brand text.",
    },
  ],
};
