export interface BlogTopic {
    month: number;
    topic: string;
    keywords: string[];
    category: string;
    priority: 'high' | 'medium' | 'low';
}

export const BLOG_TOPICS: BlogTopic[] = [
    {
        month: 1,
        topic: "ISO 13485 explicado: O que é e por que importa",
        keywords: ["iso 13485", "certificação médica", "dispositivos médicos"],
        category: "educacional",
        priority: "high"
    },
    {
        month: 1,
        topic: "Como escolher fornecedor de implantes ortopédicos no Brasil",
        keywords: ["fornecedor implantes", "ortopedia brasil", "escolher fabricante"],
        category: "educacional",
        priority: "high"
    },
    {
        month: 1,
        topic: "ZEISS CMM: Precisão micrométrica em metrologia médica",
        keywords: ["zeiss cmm", "metrologia médica", "precisão micrométrica"],
        category: "produto",
        priority: "high"
    },
    {
        month: 1,
        topic: "Comparativo: Importação vs Fabricação Local de Dispositivos Médicos",
        keywords: ["fabricação local", "importação dispositivos", "made in brazil"],
        category: "mercado",
        priority: "medium"
    },
    {
        month: 2,
        topic: "Tolerâncias micrométricas em dispositivos médicos: Guia completo",
        keywords: ["tolerâncias micrométricas", "precisão médica", "especificações técnicas"],
        category: "educacional",
        priority: "high"
    },
    {
        month: 2,
        topic: "Guia DFM: Design for Manufacturing para implantes médicos",
        keywords: ["dfm médico", "design for manufacturing", "otimização implantes"],
        category: "educacional",
        priority: "high"
    },
    {
        month: 2,
        topic: "Sala limpa ISO 7: Padrões e requisitos para dispositivos médicos",
        keywords: ["sala limpa iso 7", "cleanroom médico", "controle contaminação"],
        category: "produto",
        priority: "high"
    },
    {
        month: 2,
        topic: "Citizen L32: Usinagem CNC de alta precisão para implantes",
        keywords: ["citizen l32", "cnc médico", "usinagem precisão"],
        category: "produto",
        priority: "medium"
    },
    {
        month: 3,
        topic: "Materiais para implantes: Titânio Ti-6Al-4V vs Aço Inoxidável 316L",
        keywords: ["titânio ti6al4v", "aço 316l", "materiais implantes"],
        category: "educacional",
        priority: "high"
    },
    {
        month: 3,
        topic: "Processo de validação de implantes médicos segundo ISO 13485",
        keywords: ["validação implantes", "iso 13485", "processo validação"],
        category: "educacional",
        priority: "high"
    },
    {
        month: 3,
        topic: "Usinagem Swiss Turning: Vantagens para componentes médicos miniaturizados",
        keywords: ["swiss turning", "usinagem suíça", "componentes miniaturizados"],
        category: "produto",
        priority: "medium"
    },
    {
        month: 3,
        topic: "Tarifas Trump: Impacto na fabricação de dispositivos médicos no Brasil",
        keywords: ["tarifas importação", "dispositivos médicos brasil", "trump tariffs"],
        category: "mercado",
        priority: "high"
    },
    {
        month: 4,
        topic: "Inspeção 100% CMM: Por que é essencial em dispositivos médicos",
        keywords: ["inspeção cmm", "controle qualidade", "metrologia tridimensional"],
        category: "produto",
        priority: "high"
    },
    {
        month: 4,
        topic: "ANVISA: Guia de certificação para fabricantes de dispositivos médicos",
        keywords: ["anvisa certificação", "registro dispositivos", "regulamentação brasil"],
        category: "educacional",
        priority: "high"
    },
    {
        month: 4,
        topic: "Acabamento superficial em implantes: Ra rugosidade e biocompatibilidade",
        keywords: ["acabamento superficial", "rugosidade implantes", "ra médico"],
        category: "educacional",
        priority: "medium"
    },
    {
        month: 4,
        topic: "Case Study: Redução de 40% no custo com fabricação local",
        keywords: ["case implantes", "fabricação local", "redução custos"],
        category: "prova-social",
        priority: "high"
    },
    {
        month: 5,
        topic: "Implantes dentários: Especificações técnicas e processos de fabricação",
        keywords: ["implantes dentários", "especificações técnicas", "fabricação dental"],
        category: "produto",
        priority: "high"
    },
    {
        month: 5,
        topic: "Tratamento térmico de componentes médicos em Titânio",
        keywords: ["tratamento térmico", "titânio médico", "propriedades mecânicas"],
        category: "educacional",
        priority: "medium"
    },
    {
        month: 5,
        topic: "Instrumentos cirúrgicos: Requisitos de precisão e durabilidade",
        keywords: ["instrumentos cirúrgicos", "precisão cirúrgica", "durabilidade médica"],
        category: "produto",
        priority: "medium"
    },
    {
        month: 5,
        topic: "Mercado brasileiro de dispositivos médicos: Tendências 2025",
        keywords: ["mercado médico brasil", "tendências 2025", "indústria dispositivos"],
        category: "mercado",
        priority: "high"
    },
    {
        month: 6,
        topic: "Implantes veterinários: Adaptações e especificidades técnicas",
        keywords: ["implantes veterinários", "dispositivos veterinários", "ortopedia animal"],
        category: "produto",
        priority: "medium"
    },
    {
        month: 6,
        topic: "30 anos de excelência: História da Lifetrek Medical",
        keywords: ["lifetrek medical", "30 anos", "história fabricação"],
        category: "prova-social",
        priority: "high"
    },
    {
        month: 6,
        topic: "Prototipagem rápida de dispositivos médicos: Do CAD ao produto final",
        keywords: ["prototipagem rápida", "cad médico", "desenvolvimento produto"],
        category: "educacional",
        priority: "medium"
    },
    {
        month: 6,
        topic: "Checklist completo: Como qualificar um novo fornecedor médico",
        keywords: ["qualificação fornecedor", "auditoria médica", "seleção fabricante"],
        category: "educacional",
        priority: "high"
    }
];
