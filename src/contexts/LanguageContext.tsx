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
    "nav.clients": "Who We Work With",
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
    
    // Clients
    "clients.title": "Who We Work With",
    "clients.intro": "We partner with leading medical device manufacturers, healthcare institutions, and OEM partners worldwide to deliver precision-engineered components and implants that meet the highest quality standards.",
    "clients.types.title": "Our Client Partners",
    "clients.types.subtitle": "We serve diverse sectors within the medical and healthcare industries",
    "clients.types.medical.title": "Medical Device Manufacturers",
    "clients.types.medical.description": "Orthopedic implants, spinal systems, trauma fixation devices, and surgical components for global medical device companies.",
    "clients.types.dental.title": "Dental Equipment Companies",
    "clients.types.dental.description": "Dental implants, surgical instruments, and oral surgery tools manufactured to exacting specifications.",
    "clients.types.veterinary.title": "Veterinary Medical Companies",
    "clients.types.veterinary.description": "Specialized implants and instruments adapted for veterinary applications and animal healthcare.",
    "clients.types.healthcare.title": "Healthcare Institutions",
    "clients.types.healthcare.description": "Custom surgical tools, research and development partnerships, and specialized medical instrumentation.",
    "clients.types.contract.title": "Contract Manufacturing Partners",
    "clients.types.contract.description": "OEM partnerships with international brands requiring high-precision manufacturing capabilities.",
    "clients.industries.title": "Industries We Serve",
    "clients.industries.subtitle": "Our expertise spans multiple medical specialties",
    "clients.industries.orthopedic": "Orthopedic Surgery",
    "clients.industries.spinal": "Spinal Surgery",
    "clients.industries.dental": "Dental & Oral Surgery",
    "clients.industries.veterinary": "Veterinary Medicine",
    "clients.industries.trauma": "Trauma & Fixation",
    "clients.industries.instrumentation": "Medical Instrumentation",
    "clients.reach.title": "Global Reach, Local Excellence",
    "clients.reach.text": "Based in Brazil with a strong presence in Latin America, we serve clients worldwide with the quality and reliability expected by the global medical industry.",
    "clients.reach.certifications.title": "Certified Quality",
    "clients.reach.certifications.text": "ISO 13485:2016 and ANVISA certified, ensuring compliance with international medical device standards.",
    "clients.reach.global.title": "Export Capabilities",
    "clients.reach.global.text": "Established partnerships with international brands and proven track record in global markets.",
    "clients.cta.title": "Become a Partner",
    "clients.cta.text": "Join leading medical companies who trust Lifetrek for precision manufacturing, cleanroom technology, and certified quality.",
    "clients.cta.button": "Contact Us",
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
    "nav.clients": "Quem Atendemos",
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
    
    // Clients
    "clients.title": "Quem Atendemos",
    "clients.intro": "Fazemos parcerias com os principais fabricantes de dispositivos médicos, instituições de saúde e parceiros OEM em todo o mundo para fornecer componentes e implantes de precisão que atendem aos mais altos padrões de qualidade.",
    "clients.types.title": "Nossos Clientes Parceiros",
    "clients.types.subtitle": "Atendemos diversos setores dentro das indústrias médica e de saúde",
    "clients.types.medical.title": "Fabricantes de Dispositivos Médicos",
    "clients.types.medical.description": "Implantes ortopédicos, sistemas espinhais, dispositivos de fixação de trauma e componentes cirúrgicos para empresas globais de dispositivos médicos.",
    "clients.types.dental.title": "Empresas de Equipamentos Odontológicos",
    "clients.types.dental.description": "Implantes dentários, instrumentos cirúrgicos e ferramentas de cirurgia oral fabricadas com especificações exatas.",
    "clients.types.veterinary.title": "Empresas Veterinárias",
    "clients.types.veterinary.description": "Implantes especializados e instrumentos adaptados para aplicações veterinárias e saúde animal.",
    "clients.types.healthcare.title": "Instituições de Saúde",
    "clients.types.healthcare.description": "Ferramentas cirúrgicas personalizadas, parcerias de pesquisa e desenvolvimento, e instrumentação médica especializada.",
    "clients.types.contract.title": "Parceiros de Manufatura Contratada",
    "clients.types.contract.description": "Parcerias OEM com marcas internacionais que exigem capacidades de fabricação de alta precisão.",
    "clients.industries.title": "Indústrias que Atendemos",
    "clients.industries.subtitle": "Nossa experiência abrange múltiplas especialidades médicas",
    "clients.industries.orthopedic": "Cirurgia Ortopédica",
    "clients.industries.spinal": "Cirurgia Espinhal",
    "clients.industries.dental": "Cirurgia Dental e Oral",
    "clients.industries.veterinary": "Medicina Veterinária",
    "clients.industries.trauma": "Trauma e Fixação",
    "clients.industries.instrumentation": "Instrumentação Médica",
    "clients.reach.title": "Alcance Global, Excelência Local",
    "clients.reach.text": "Sediados no Brasil com forte presença na América Latina, atendemos clientes em todo o mundo com a qualidade e confiabilidade esperadas pela indústria médica global.",
    "clients.reach.certifications.title": "Qualidade Certificada",
    "clients.reach.certifications.text": "Certificados ISO 13485:2016 e ANVISA, garantindo conformidade com padrões internacionais de dispositivos médicos.",
    "clients.reach.global.title": "Capacidade de Exportação",
    "clients.reach.global.text": "Parcerias estabelecidas com marcas internacionais e histórico comprovado em mercados globais.",
    "clients.cta.title": "Torne-se um Parceiro",
    "clients.cta.text": "Junte-se às principais empresas médicas que confiam na Lifetrek para manufatura de precisão, tecnologia de sala limpa e qualidade certificada.",
    "clients.cta.button": "Entre em Contato",
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
