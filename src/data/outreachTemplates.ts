export interface OutreachTemplate {
  linkedin_intro: string;
  linkedin_followup: string;
  email_outreach: string;
}

export interface TemplatesData {
  orthopedic: OutreachTemplate;
  dental: OutreachTemplate;
  veterinary: OutreachTemplate;
  hospital: OutreachTemplate;
  oem: OutreachTemplate;
}

export const TEMPLATES_DATA: TemplatesData = {
  orthopedic: {
    linkedin_intro: `Olá [Nome],

Vi que você lidera a qualidade na [Empresa].

Ajudamos fabricantes de ortopedia a reduzir riscos de fornecimento com usinagem suíça (Citizen) e CMM (Zeiss) no Brasil.

Se fizer sentido, adoraria compartilhar como alcançamos <0.1% de defeitos em parafusos complexos.

Abraço,`,
    linkedin_followup: `[Nome], 

Só para não deixar passar: nossa fábrica em Indaiatuba tem certificação ISO 13485 e entregamos protótipos em 10 dias.

Faz sentido conversarmos sobre sua próxima linha de implantes?`,
    email_outreach: `Assunto: Redução de Risco na Cadeia de Suprimentos - [Empresa]

Olá [Nome],

Muitos fabricantes de dispositivos ortopédicos enfrentam desafios com prazos de entrega e consistência de qualidade na importação.

Na Lifetrek Medical (Indaiatuba/SP), operamos com:
- Tornos Suíços Citizen (L20/M32) para geometrias complexas.
- Inspeção 100% automatizada (Zeiss Contura).
- Acabamento interno (Eletropolimento e Marcação a Laser).

Gostaria de agendar 10 minutos para entender seus desafios atuais de usinagem?

Atenciosamente,`
  },
  dental: {
    linkedin_intro: `Olá [Nome],

Vi seu trabalho na [Empresa] com implantes dentários.

Na Lifetrek, fabricamos componentes de titânio com tolerâncias de 5 mícrons usando tecnologia suíça.

Teria interesse em conhecer nossa capacidade para abutments e parafusos?`,
    linkedin_followup: `[Nome],

Apenas um follow-up: nossa capacidade produtiva inclui acabamento superficial Ra < 0.1 e limpeza em sala limpa ISO 7.

Podemos agendar uma breve conversa?`,
    email_outreach: `Assunto: Precisão Suíça para Implantes - [Empresa]

Olá [Nome],

A precisão na conexão hex é crítica para a longevidade do implante.

Na Lifetrek, garantimos essa precisão com:
- Tornos Citizen de última geração.
- Controle de qualidade Zeiss.
- Rastreabilidade total de lote.

Temos capacidade aberta para novos projetos de implantes e componentes protéticos.

Podemos conversar na próxima terça-feira?`
  },
  veterinary: {
    linkedin_intro: `Olá [Nome],

Vi que a [Empresa] está inovando em ortopedia veterinária.

Fabricamos placas TPLO e parafusos com a mesma qualidade humana (ISO 13485), mas com custos competitivos no Brasil.

Faz sentido conectar?`,
    linkedin_followup: `[Nome],

Apenas lembrando: temos flexibilidade para lotes menores, ideais para o mercado veterinário.

Gostaria de enviar nosso book de equipamentos.`,
    email_outreach: `Assunto: Manufatura de Placas TPLO e Implantes - [Empresa]

Olá [Nome],

O mercado veterinário exige qualidade humana com custos viáveis.

Na Lifetrek, oferecemos:
- Placas e parafusos em Titânio/Inox.
- Usinagem de alta precisão.
- Agilidade na entrega (fábrica em SP).

Gostaria de comparar nossos custos com seus fornecedores atuais?`
  },
  hospital: {
    linkedin_intro: `Olá [Nome],

Vi que você coordena compras em [Hospital/Empresa].

Fornecemos instrumentais cirúrgicos e componentes de dispositivos médicos para hospitais brasileiros, com certificação ANVISA.

Posso enviar nosso catálogo de capacidades?`,
    linkedin_followup: `[Nome],

Seguindo: temos experiência com contratos de fornecimento contínuo e rastreabilidade completa por lote.

Faz sentido agendar uma conversa breve?`,
    email_outreach: `Assunto: Fornecimento Local de Instrumentais - [Hospital]

Olá [Nome],

A dependência de importação pode impactar prazos e custos em compras hospitalares.

Na Lifetrek Medical, fabricamos:
- Instrumentais cirúrgicos em inox e titânio.
- Componentes para equipamentos médicos.
- Peças de reposição com agilidade.

Gostaria de conhecer nossas condições de fornecimento?

Atenciosamente,`
  },
  oem: {
    linkedin_intro: `Olá [Nome],

Vi que a [Empresa] desenvolve dispositivos médicos.

Na Lifetrek, somos parceiros de manufatura para OEMs: da prototipagem à produção em escala, com ISO 13485.

Faz sentido conversarmos sobre seu próximo projeto?`,
    linkedin_followup: `[Nome],

Apenas um lembrete: oferecemos NDAs padrão e capacidade para co-desenvolvimento.

Posso enviar um case de um projeto similar?`,
    email_outreach: `Assunto: Parceria de Manufatura para [Empresa]

Olá [Nome],

Desenvolver dispositivos médicos exige um parceiro de manufatura confiável e flexível.

Na Lifetrek, oferecemos:
- Prototipagem rápida (10 dias).
- Produção em escala com repetibilidade.
- Suporte em documentação regulatória.
- Confidencialidade via NDA.

Gostaria de explorar como podemos apoiar seu roadmap de produtos?

Atenciosamente,`
  }
};

export type SegmentKey = keyof typeof TEMPLATES_DATA;

export const SEGMENT_LABELS: Record<SegmentKey, string> = {
  orthopedic: "Ortopedia",
  dental: "Odontologia",
  veterinary: "Veterinária",
  hospital: "Hospitalar",
  oem: "OEM / Fabricante",
};