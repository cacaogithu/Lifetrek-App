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
    "home.hero.title": "Accelerate Your Product Development",
    "home.hero.subtitle": "Get precision medical components to market faster with our ISO 13485 certified manufacturing, Swiss CNC technology, and cleanroom facilities.",
    "home.hero.cta": "Partner With Us",
    "home.benefits.speed": "Faster Time to Market",
    "home.benefits.speed.text": "From prototype to production, our streamlined processes reduce lead times without compromising quality.",
    "home.benefits.compliance": "Regulatory Confidence",
    "home.benefits.compliance.text": "ISO 13485 & ANVISA certified, ensuring your products meet global medical device standards.",
    "home.benefits.precision": "Zero-Defect Manufacturing",
    "home.benefits.precision.text": "Advanced metrology lab with ZEISS equipment guarantees dimensional accuracy on every part.",
    "home.stats.experience": "Years Experience",
    "home.stats.partners": "Global Partners",
    "home.stats.certified": "ISO Certified",
    "home.whyChoose.title": "Why Leading Medical Device Companies Choose Lifetrek",
    "home.whyChoose.subtitle": "Eliminate supplier risks and accelerate your product development timeline",
    "home.whoWeServe.title": "Who We Serve",
    "home.whoWeServe.subtitle": "Trusted by leading medical device manufacturers worldwide",
    "home.whoWeServe.cta": "See All Industries We Serve",
    "home.clients.title": "Trusted by Leading Medical Device Companies",
    "home.clients.subtitle": "Partnering with innovative companies to deliver precision medical components worldwide",
    "home.clients.cta": "View All Industries",
    
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
    "products.title": "Products That Improve Patient Outcomes",
    "products.hero.subtitle": "Precision-engineered components that help you deliver better surgical results and faster patient recovery.",
    "products.medical.title": "Orthopedic & Spinal Implants",
    "products.medical.benefit": "Enable Complex Surgeries",
    "products.medical.text": "High-strength fixation plates, screws, and spinal systems that give surgeons confidence in demanding procedures.",
    "products.instruments.title": "Surgical Instruments",
    "products.instruments.benefit": "Improve Surgical Precision",
    "products.instruments.text": "Ergonomically designed drills, reamers, and cutting tools that enhance surgical control and reduce operating time.",
    "products.dental.title": "Dental Implants & Tools",
    "products.dental.benefit": "Predictable Clinical Results",
    "products.dental.text": "Biocompatible implants and precision instruments that ensure long-term implant success and patient satisfaction.",
    "products.veterinary.title": "Veterinary Solutions",
    "products.veterinary.benefit": "Extend Lives Beyond Human Care",
    "products.veterinary.text": "Adapted orthopedic implants helping veterinarians give companion animals better mobility and quality of life.",
    "products.cta.title": "Need Custom Manufacturing?",
    "products.cta.text": "We partner with medical device companies to develop and manufacture components that meet exact specifications.",
    "products.cta.button": "Discuss Your Project",
    
    // Capabilities (Merged Quality + Infrastructure)
    "capabilities.title": "Manufacturing Capabilities That De-Risk Your Supply Chain",
    "capabilities.subtitle": "Reduce supplier issues with certified quality, advanced equipment, and rigorous process controls.",
    "capabilities.certifications": "Regulatory Compliance Built-In",
    "capabilities.iso": "ISO 13485:2016 Certified",
    "capabilities.anvisa": "ANVISA Approved",
    "capabilities.continuous": "Continuous Improvement",
    "capabilities.traceability": "Full Batch Traceability",
    
    "capabilities.cleanrooms.title": "ISO 7 Cleanroom Manufacturing",
    "capabilities.cleanrooms.benefit": "Eliminate Contamination Risk",
    "capabilities.cleanrooms.text": "Two 60m² cleanrooms among Brazil's most advanced—ensuring sterile component production for implants and critical instruments.",
    
    "capabilities.metrology.title": "Advanced Metrology Lab",
    "capabilities.metrology.benefit": "Guaranteed Dimensional Accuracy",
    "capabilities.metrology.text": "ZEISS Contura CMM, Hardness Vickers, and optical measurement systems verify every critical dimension before shipping.",
    
    "capabilities.equipment.title": "Swiss CNC Technology",
    "capabilities.equipment.benefit": "Complex Geometries Made Simple",
    "capabilities.equipment.text": "Citizen, Tornos, and Walter multi-axis machines produce intricate medical components with micron-level precision in a single setup.",
    
    "capabilities.finishing.title": "Medical-Grade Surface Treatment",
    "capabilities.finishing.benefit": "Enhanced Biocompatibility",
    "capabilities.finishing.text": "In-house electropolishing and passivation deliver smooth, corrosion-resistant surfaces that meet ASTM standards for implantable devices.",
    
    // Quality
    "quality.title": "Quality & Compliance",
    "quality.intro": "Our commitment to quality excellence is demonstrated through international certifications, advanced metrology capabilities, and rigorous process controls.",
    "quality.certifications": "Certifications",
    "quality.iso": "ISO 13485:2016",
    "quality.anvisa": "ANVISA Certified",
    "quality.continuous": "Continuous Improvement",
    "quality.traceability": "Full Batch Traceability",
    "quality.metrology.title": "Advanced Metrology Lab",
    "quality.metrology.text": "State-of-the-art measurement equipment including ZEISS Contura CMM, Hardness Vickers, and optical measurement systems verify every critical dimension.",
    "quality.electropolishing.title": "Medical-Grade Surface Treatment",
    "quality.electropolishing.text": "In-house electropolishing and passivation deliver smooth, corrosion-resistant surfaces that meet ASTM standards for implantable devices.",
    
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

    // Home - Additional sections
    "home.capabilities.title": "Manufacturing Capabilities",
    "home.capabilities.subtitle": "Advanced equipment and certified processes that de-risk your supply chain",
    "home.capabilities.iso.title": "ISO 13485:2016 Certified",
    "home.capabilities.iso.text": "Complete quality management system for medical device manufacturing with full regulatory compliance.",
    "home.capabilities.anvisa.title": "ANVISA Approved",
    "home.capabilities.anvisa.text": "Brazilian health regulatory agency approval ensuring compliance with national medical device standards.",
    "home.capabilities.cta": "See All Capabilities",
    "home.finalCta.title": "Ready to Accelerate Your Product Development?",
    "home.finalCta.subtitle": "Partner with Lifetrek to bring your medical devices to market faster with certified quality and precision manufacturing.",
    "home.finalCta.button": "Get Started Today",

    // Interactive Capabilities
    "interactive.capabilities.title": "Core Capabilities",
    "interactive.capabilities.subtitle": "World-class manufacturing and quality assurance systems",
    "interactive.capabilities.precision.title": "Swiss CNC Precision",
    "interactive.capabilities.precision.stat": "±0.001mm",
    "interactive.capabilities.precision.description": "Multi-axis Swiss-type CNC lathes with live tooling. Capable of producing complex medical components with micron-level accuracy for implants and instruments.",
    "interactive.capabilities.metrology.title": "Advanced Metrology",
    "interactive.capabilities.metrology.stat": "ISO 17025",
    "interactive.capabilities.metrology.description": "ZEISS CMM 3D coordinate measuring, optical comparators, and metallographic analysis. Complete dimensional verification and material testing capabilities.",
    "interactive.capabilities.finishing.title": "Electropolishing",
    "interactive.capabilities.finishing.stat": "Ra < 0.1μm",
    "interactive.capabilities.finishing.description": "State-of-the-art electropolishing line producing mirror finishes. Enhances corrosion resistance and biocompatibility for surgical and implantable devices.",
    "interactive.capabilities.cleanroom.title": "ISO 7 Cleanroom",
    "interactive.capabilities.cleanroom.stat": "Class 10,000",
    "interactive.capabilities.cleanroom.description": "Climate-controlled cleanroom environments for sterile medical device assembly and packaging. Full traceability and documentation for regulatory compliance.",
    "interactive.capabilities.hover": "Hover for details",

    // Manufacturing Timeline
    "timeline.title": "Our Manufacturing Process",
    "timeline.subtitle": "From concept to delivery: precision engineering at every step",
    "timeline.step1.title": "Design & Engineering",
    "timeline.step1.description": "CAD/CAM programming with ESPRIT software for optimal tool paths and precision",
    "timeline.step2.title": "Swiss CNC Machining",
    "timeline.step2.description": "Multi-axis Swiss-type CNC manufacturing with ±0.001mm precision tolerance",
    "timeline.step3.title": "Surface Finishing",
    "timeline.step3.description": "Electropolishing for biocompatible mirror finish and enhanced corrosion resistance",
    "timeline.step4.title": "Quality Control",
    "timeline.step4.description": "ZEISS CMM 3D measurement and metallographic analysis in ISO-certified lab",
    "timeline.step5.title": "Cleanroom Packaging",
    "timeline.step5.description": "ISO 7 cleanroom sterile packaging with full batch traceability documentation",
    "timeline.step6.title": "Final Certification",
    "timeline.step6.description": "Complete quality documentation and ISO 13485 compliance certification",

    // Equipment Carousel
    "equipment.title": "Advanced Manufacturing Equipment",
    "equipment.subtitle": "State-of-the-art technology for precision medical device manufacturing",
    "equipment.category.all": "All Equipment",
    "equipment.category.metrology": "Metrology",
    "equipment.category.cnc": "CNC Machines",
    "equipment.category.sampleprep": "Sample Prep",
    "equipment.category.finishing": "Finishing",
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
    "home.hero.title": "Acelere o Desenvolvimento do Seu Produto",
    "home.hero.subtitle": "Leve componentes médicos de precisão ao mercado mais rapidamente com nossa fabricação certificada ISO 13485, tecnologia CNC suíça e instalações de sala limpa.",
    "home.hero.cta": "Seja Nosso Parceiro",
    "home.benefits.speed": "Tempo de Mercado Mais Rápido",
    "home.benefits.speed.text": "Do protótipo à produção, nossos processos simplificados reduzem prazos sem comprometer a qualidade.",
    "home.benefits.compliance": "Confiança Regulatória",
    "home.benefits.compliance.text": "Certificados ISO 13485 e ANVISA, garantindo que seus produtos atendam aos padrões globais de dispositivos médicos.",
    "home.benefits.precision": "Fabricação com Zero Defeitos",
    "home.benefits.precision.text": "Laboratório de metrologia avançado com equipamento ZEISS garante precisão dimensional em cada peça.",
    "home.stats.experience": "Anos de Experiência",
    "home.stats.partners": "Parceiros Globais",
    "home.stats.certified": "Certificado ISO",
    "home.whyChoose.title": "Por Que as Principais Empresas de Dispositivos Médicos Escolhem a Lifetrek",
    "home.whyChoose.subtitle": "Elimine riscos de fornecedores e acelere o cronograma de desenvolvimento do seu produto",
    "home.whoWeServe.title": "Quem Atendemos",
    "home.whoWeServe.subtitle": "Confiado pelos principais fabricantes de dispositivos médicos em todo o mundo",
    "home.whoWeServe.cta": "Veja Todas as Indústrias que Atendemos",
    "home.clients.title": "Confiado pelas Principais Empresas de Dispositivos Médicos",
    "home.clients.subtitle": "Fazendo parcerias com empresas inovadoras para entregar componentes médicos de precisão em todo o mundo",
    "home.clients.cta": "Ver Todas as Indústrias",
    
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
    "products.title": "Produtos Que Melhoram os Resultados dos Pacientes",
    "products.hero.subtitle": "Componentes de precisão que ajudam você a entregar melhores resultados cirúrgicos e recuperação mais rápida do paciente.",
    "products.medical.title": "Implantes Ortopédicos e Espinhais",
    "products.medical.benefit": "Possibilitam Cirurgias Complexas",
    "products.medical.text": "Placas de fixação, parafusos e sistemas espinhais de alta resistência que dão aos cirurgiões confiança em procedimentos exigentes.",
    "products.instruments.title": "Instrumentos Cirúrgicos",
    "products.instruments.benefit": "Melhoram a Precisão Cirúrgica",
    "products.instruments.text": "Brocas, alargadores e instrumentos de corte ergonomicamente projetados que aumentam o controle cirúrgico e reduzem o tempo operatório.",
    "products.dental.title": "Implantes e Ferramentas Odontológicas",
    "products.dental.benefit": "Resultados Clínicos Previsíveis",
    "products.dental.text": "Implantes biocompatíveis e instrumentos de precisão que garantem sucesso de implante a longo prazo e satisfação do paciente.",
    "products.veterinary.title": "Soluções Veterinárias",
    "products.veterinary.benefit": "Prolongam Vidas Além do Cuidado Humano",
    "products.veterinary.text": "Implantes ortopédicos adaptados ajudando veterinários a dar aos animais de estimação melhor mobilidade e qualidade de vida.",
    "products.cta.title": "Precisa de Fabricação Personalizada?",
    "products.cta.text": "Fazemos parcerias com empresas de dispositivos médicos para desenvolver e fabricar componentes que atendem especificações exatas.",
    "products.cta.button": "Discuta Seu Projeto",
    
    // Capabilities (Merged Quality + Infrastructure)
    "capabilities.title": "Capacidades de Fabricação Que Reduzem o Risco da Sua Cadeia de Suprimentos",
    "capabilities.subtitle": "Reduza problemas com fornecedores através de qualidade certificada, equipamentos avançados e controles rigorosos de processo.",
    "capabilities.certifications": "Conformidade Regulatória Integrada",
    "capabilities.iso": "Certificado ISO 13485:2016",
    "capabilities.anvisa": "Aprovado pela ANVISA",
    "capabilities.continuous": "Melhoria Contínua",
    "capabilities.traceability": "Rastreabilidade Completa de Lote",
    
    "capabilities.cleanrooms.title": "Fabricação em Sala Limpa ISO 7",
    "capabilities.cleanrooms.benefit": "Elimine Risco de Contaminação",
    "capabilities.cleanrooms.text": "Duas salas limpas de 60m² entre as mais avançadas do Brasil—garantindo produção de componentes estéreis para implantes e instrumentos críticos.",
    
    "capabilities.metrology.title": "Laboratório de Metrologia Avançado",
    "capabilities.metrology.benefit": "Precisão Dimensional Garantida",
    "capabilities.metrology.text": "CMM ZEISS Contura, Hardness Vickers e sistemas de medição óptica verificam cada dimensão crítica antes do envio.",
    
    "capabilities.equipment.title": "Tecnologia CNC Suíça",
    "capabilities.equipment.benefit": "Geometrias Complexas Simplificadas",
    "capabilities.equipment.text": "Máquinas multi-eixos Citizen, Tornos e Walter produzem componentes médicos intrincados com precisão em nível de mícron em uma única configuração.",
    
    "capabilities.finishing.title": "Tratamento de Superfície de Grau Médico",
    "capabilities.finishing.benefit": "Biocompatibilidade Aprimorada",
    "capabilities.finishing.text": "Eletropolimento e passivação internos entregam superfícies lisas e resistentes à corrosão que atendem aos padrões ASTM para dispositivos implantáveis.",
    
    // Quality
    "quality.title": "Qualidade e Conformidade",
    "quality.intro": "Nosso compromisso com a excelência em qualidade é demonstrado através de certificações internacionais, capacidades avançadas de metrologia e controles rigorosos de processo.",
    "quality.certifications": "Certificações",
    "quality.iso": "ISO 13485:2016",
    "quality.anvisa": "Certificado ANVISA",
    "quality.continuous": "Melhoria Contínua",
    "quality.traceability": "Rastreabilidade Completa de Lote",
    "quality.metrology.title": "Laboratório de Metrologia Avançado",
    "quality.metrology.text": "Equipamentos de medição de última geração incluindo CMM ZEISS Contura, Hardness Vickers e sistemas de medição óptica verificam cada dimensão crítica.",
    "quality.electropolishing.title": "Tratamento de Superfície de Grau Médico",
    "quality.electropolishing.text": "Eletropolimento e passivação internos entregam superfícies lisas e resistentes à corrosão que atendem aos padrões ASTM para dispositivos implantáveis.",
    
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

  const t = (key: string) => {
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
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
