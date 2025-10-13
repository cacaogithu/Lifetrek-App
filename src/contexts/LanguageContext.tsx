import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.whatWeDo": "What We Do",
    "nav.products": "Products",
    "nav.quality": "Quality",
    "nav.infrastructure": "Infrastructure",
    "nav.culture": "Culture",
    "nav.contact": "Contact",
    
    // Home
    "home.hero.title": "High-Precision Manufacturing",
    "home.hero.subtitle": "Lifetrek Medical manufactures high-precision components, implants, and instruments for the global medical industry.",
    "home.hero.cta": "Learn More",
    
    // About
    "about.title": "About Us",
    "about.intro": "Our trajectory in Brazil began with the acquisition of the Brazilian subsidiary of an American company with over 30 years of experience.",
    "about.mission.title": "Mission",
    "about.mission.text": "To lead in the manufacture of high-performance, high-quality products with cutting-edge technology, innovation, ethics, and an absolute commitment to life.",
    "about.vision.title": "Vision",
    "about.vision.text": "To be globally recognized for innovation, precision, and ethics in manufacturing medical solutions, contributing to the continuous evolution of healthcare and quality of life.",
    "about.values.title": "Values",
    "about.values.excellence": "Excellence",
    "about.values.excellence.text": "Quality and responsibility in everything we do.",
    "about.values.innovation": "Innovation",
    "about.values.innovation.text": "Constant evolution in technology and solutions.",
    "about.values.ethics": "Ethics",
    "about.values.ethics.text": "Transparency and integrity in all relationships.",
    "about.values.respect": "Respect",
    "about.values.respect.text": "Valuing people and teamwork.",
    
    // What We Do
    "whatWeDo.title": "What We Do",
    "whatWeDo.text": "We provide manufacturing services using state-of-the-art CNC machines such as sliding-head lathes, single-head lathes, machining centers, and grinders. Our processes include cleanrooms (ISO certified), electropolishing, passivation, and laser marking.",
    "whatWeDo.precision": "Medical Precision Manufacturing",
    "whatWeDo.cleanroom": "Cleanroom Technology",
    
    // Products
    "products.title": "Products",
    "products.medical.title": "Medical Implants",
    "products.medical.text": "Plates, screws, fixation devices, surgical buttons, upper & lower extremity implants, spinal and cranial implants.",
    "products.instruments.title": "Surgical Instruments",
    "products.instruments.text": "Manual and powered tools, cutting instruments, surgical drills, milling tools, surgical keys, reamers, guides.",
    "products.dental.title": "Dental Products",
    "products.dental.text": "Dental implants, angled instruments, drills, milling cutters.",
    "products.veterinary.title": "Veterinary Line",
    "products.veterinary.text": "Adapted implants and tools for veterinary applications (emerging market focus).",
    
    // Quality
    "quality.title": "Quality",
    "quality.intro": "We practice the discipline and philosophy of quality from the design of our manufacturing processes to the delivery of the final product to our customers.",
    "quality.certifications": "Certifications",
    "quality.iso": "ISO 13485:2016",
    "quality.anvisa": "ANVISA (Brazil)",
    "quality.continuous": "Continuous Improvement",
    "quality.traceability": "Full Traceability",
    "quality.metrology.title": "High-Precision Metrology Lab",
    "quality.metrology.text": "Equipped with ZEISS Contura, Hardness Vickers, Optical CNC & Manual instruments.",
    "quality.electropolishing.title": "Electropolishing & Passivation",
    "quality.electropolishing.text": "Advanced surface treatment for superior biocompatibility.",
    
    // Infrastructure
    "infrastructure.title": "Infrastructure",
    "infrastructure.cleanrooms.title": "Cleanrooms ISO 7",
    "infrastructure.cleanrooms.text": "Two rooms of 60 m² each, among the most advanced in Brazil.",
    "infrastructure.equipment.title": "Machining & Production Equipment",
    "infrastructure.equipment.text": "Citizen L20-X / L20-VIII LFV / L32, Walter, Doosan, Robodrill, Tornos GT-13 and GT-26, Electropolish Line, Laser Marking, ESPRIT CAD/CAM.",
    "infrastructure.technology": "State-of-the-art Technology",
    "infrastructure.team": "Highly Qualified Team",
    
    // Culture
    "culture.title": "Our Culture",
    "culture.cleanliness": "Cleanliness, organization, and continuous professional development are the foundations of our culture.",
    "culture.quality": "Strong quality discipline embedded throughout the work environment.",
    "culture.training": "Continuous training and professional growth opportunities.",
    
    // Contact
    "contact.title": "Contact",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.company": "Company",
    "contact.form.message": "Message",
    "contact.form.submit": "Send Message",
    "contact.info.email": "Email",
    "contact.info.phone": "Phone",
    "contact.info.address": "Address",
    "contact.location": "Indaiatuba / SP, Brazil",
  },
  pt: {
    // Navigation
    "nav.home": "Início",
    "nav.about": "Quem Somos",
    "nav.whatWeDo": "O que Fazemos",
    "nav.products": "Produtos",
    "nav.quality": "Qualidade",
    "nav.infrastructure": "Infraestrutura",
    "nav.culture": "Cultura",
    "nav.contact": "Contato",
    
    // Home
    "home.hero.title": "Manufatura de Alta Precisão",
    "home.hero.subtitle": "A Lifetrek Medical fabrica componentes, implantes e instrumentos de alta precisão para a indústria médica global.",
    "home.hero.cta": "Saiba Mais",
    
    // About
    "about.title": "Quem Somos",
    "about.intro": "Nossa trajetória no Brasil iniciou-se com a aquisição da subsidiária brasileira de uma empresa americana com mais de 30 anos de experiência.",
    "about.mission.title": "Missão",
    "about.mission.text": "Ser líder na manufatura de produtos de alta performance e qualidade, com tecnologia de ponta, aliados à inovação constante, confiabilidade, ética e compromisso absoluto com a vida.",
    "about.vision.title": "Visão",
    "about.vision.text": "Ser reconhecida como referência global em inovação, precisão e ética na manufatura de produtos e soluções para a área médica, contribuindo para a evolução contínua da saúde e para a melhoria da qualidade de vida das pessoas.",
    "about.values.title": "Valores",
    "about.values.excellence": "Excelência",
    "about.values.excellence.text": "Qualidade e responsabilidade em tudo o que fazemos.",
    "about.values.innovation": "Inovação",
    "about.values.innovation.text": "Evolução constante em tecnologia e soluções.",
    "about.values.ethics": "Ética",
    "about.values.ethics.text": "Transparência e integridade em todas as relações.",
    "about.values.respect": "Respeito",
    "about.values.respect.text": "Valorização das pessoas e do trabalho em equipe.",
    
    // What We Do
    "whatWeDo.title": "O que Fazemos",
    "whatWeDo.text": "Oferecemos aos nossos clientes serviços de manufatura com utilização de máquinas CNC ultra precisas de última geração como tornos de cabecote móvel, tornos de cabeçote simples, centros de usinagem e retíficas além de salas limpas certificadas, eletropolimento, passivação, gravação a laser.",
    "whatWeDo.precision": "Manufatura Médica de Precisão",
    "whatWeDo.cleanroom": "Tecnologia de Sala Limpa",
    
    // Products
    "products.title": "Produtos",
    "products.medical.title": "Implantes Médicos",
    "products.medical.text": "Placas, parafusos, dispositivos de fixação, botões cirúrgicos, implantes de extremidades superiores e inferiores, implantes espinhais e cranianos.",
    "products.instruments.title": "Instrumentos Cirúrgicos",
    "products.instruments.text": "Ferramentas manuais e motorizadas, instrumentos de corte, brocas cirúrgicas, fresas, chaves cirúrgicas, alargadores, guias.",
    "products.dental.title": "Produtos Odontológicos",
    "products.dental.text": "Implantes dentários, instrumentos angulados, brocas, fresas.",
    "products.veterinary.title": "Linha Veterinária",
    "products.veterinary.text": "Implantes e ferramentas adaptados para aplicações veterinárias (foco em mercado emergente).",
    
    // Quality
    "quality.title": "Qualidade",
    "quality.intro": "Praticamos a disciplina e a filosofia de qualidade desde o desenho dos nossos processos de fabricação até a entrega do produto final aos nossos clientes.",
    "quality.certifications": "Certificações",
    "quality.iso": "ISO 13485:2016",
    "quality.anvisa": "ANVISA (Brasil)",
    "quality.continuous": "Melhoria Contínua",
    "quality.traceability": "Rastreabilidade Total",
    "quality.metrology.title": "Laboratório de Metrologia de Alta Precisão",
    "quality.metrology.text": "Equipado com ZEISS Contura, Hardness Vickers, instrumentos CNC óptico e manuais.",
    "quality.electropolishing.title": "Eletropolimento e Passivação",
    "quality.electropolishing.text": "Tratamento de superfície avançado para biocompatibilidade superior.",
    
    // Infrastructure
    "infrastructure.title": "Infraestrutura",
    "infrastructure.cleanrooms.title": "Salas Limpas ISO 7",
    "infrastructure.cleanrooms.text": "Duas salas de 60 m² cada, entre as mais avançadas do Brasil.",
    "infrastructure.equipment.title": "Equipamentos de Usinagem e Produção",
    "infrastructure.equipment.text": "Citizen L20-X / L20-VIII LFV / L32, Walter, Doosan, Robodrill, Tornos GT-13 e GT-26, Linha de Eletropolimento, Gravação a Laser, ESPRIT CAD/CAM.",
    "infrastructure.technology": "Tecnologia de Última Geração",
    "infrastructure.team": "Equipe Altamente Qualificada",
    
    // Culture
    "culture.title": "Nossa Cultura",
    "culture.cleanliness": "Limpeza, organização e desenvolvimento profissional contínuo são os fundamentos da nossa cultura.",
    "culture.quality": "Cultura de qualidade fortemente sedimentada em todo o ambiente de trabalho.",
    "culture.training": "Contínuas oportunidades para desenvolvimento e crescimento profissional.",
    
    // Contact
    "contact.title": "Contato",
    "contact.form.name": "Nome",
    "contact.form.email": "E-mail",
    "contact.form.company": "Empresa",
    "contact.form.message": "Mensagem",
    "contact.form.submit": "Enviar Mensagem",
    "contact.info.email": "E-mail",
    "contact.info.phone": "Telefone",
    "contact.info.address": "Endereço",
    "contact.location": "Indaiatuba / SP, Brasil",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
