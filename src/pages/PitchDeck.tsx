import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2,
  Check,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Shield,
  FileX,
  Clock,
  Target,
  Microscope
} from "lucide-react";

// Assets
import logo from "@/assets/logo-optimized.webp";
import isoLogo from "@/assets/certifications/iso.webp";
import cleanroomHero from "@/assets/facility/cleanroom-hero.webp";
import factoryExterior from "@/assets/facility/exterior-hero.webp";
import factoryHeroFull from "@/assets/facility/factory-hero-full.svg";

// Equipment
import citizenL20 from "@/assets/equipment/citizen-l20.webp";
import citizenM32 from "@/assets/equipment/citizen-m32-new.png";
import doosanNew from "@/assets/equipment/doosan-new.png";
import robodrill from "@/assets/equipment/robodrill.webp";
import zeissContura from "@/assets/metrology/zeiss-contura.webp";
import opticalCNC from "@/assets/metrology/optical-cnc.webp";
import laserMarking from "@/assets/equipment/laser-marking.webp";
import electropolishLine from "@/assets/equipment/electropolish-line.webp";

// Products
import medicalScrew from "@/assets/products/medical-screw-hero.webp";
import dentalInstruments from "@/assets/products/dental-instruments-hero.webp";
import surgicalDrills from "@/assets/products/surgical-drills-optimized.webp";
import veterinaryImplant1 from "@/assets/products/veterinary-implant-1.jpg";
import labOverview from "@/assets/metrology/lab-overview.webp";

// Clients - ALL -new versions
import cpmhNew from "@/assets/clients/cpmh-new.png";
import evolveNew from "@/assets/clients/evolve-new.png";
import fgmNew from "@/assets/clients/fgm-new.png";
import gmiNew from "@/assets/clients/gmi-new.png";
import hcsNew from "@/assets/clients/hcs-new.png";
import impolNew from "@/assets/clients/impol-new.png";
import implanfixNew from "@/assets/clients/implanfix-new.png";
import iolNew from "@/assets/clients/iol-new.png";
import plenumNew from "@/assets/clients/plenum-new.png";
import medensNew from "@/assets/clients/medens-new.png";
import neoorthoNew from "@/assets/clients/neoortho-new.jpg";
import oblDentalNew from "@/assets/clients/obl-dental-new.jpg";
import orthometricNew from "@/assets/clients/orthometric-new.png";
import osseaNew from "@/assets/clients/ossea-new.jpg";
import traumecNew2 from "@/assets/clients/traumec-new-2.png";
import razekNew from "@/assets/clients/razek-new.png";
import reactNew from "@/assets/clients/react-new.png";
import russerNew from "@/assets/clients/russer-new.png";
import techimportNew from "@/assets/clients/techimport-new.png";
import torideNew from "@/assets/clients/toride-new.png";
import ultradentNew from "@/assets/clients/ultradent-new.png";
import vinculaNew from "@/assets/clients/vincula-new.png";

// Glass Card Component - Premium Subtle Shading
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-background/50 backdrop-blur-2xl border border-border/20 rounded-2xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.1)] transition-all duration-700 ${className}`}>
    {children}
  </div>
);

const PitchDeck = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const clientLogos = [
    { src: cpmhNew, name: "CPMH" }, { src: evolveNew, name: "Evolve" }, { src: fgmNew, name: "FGM" },
    { src: gmiNew, name: "GMI" }, { src: hcsNew, name: "HCS" }, { src: impolNew, name: "Impol" },
    { src: implanfixNew, name: "Implanfix" }, { src: iolNew, name: "IOL" }, { src: plenumNew, name: "Plenum" },
    { src: medensNew, name: "Medens" }, { src: neoorthoNew, name: "Neoortho" }, { src: oblDentalNew, name: "OBL Dental" },
    { src: orthometricNew, name: "Orthometric" }, { src: osseaNew, name: "Óssea" }, { src: traumecNew2, name: "Traumec" },
    { src: razekNew, name: "Razek" }, { src: reactNew, name: "React" }, { src: russerNew, name: "Russer" },
    { src: techimportNew, name: "TechImport" }, { src: torideNew, name: "Toride" }, { src: ultradentNew, name: "Ultradent" },
    { src: vinculaNew, name: "Vincula" },
  ];

  const slides = [
    // Slide 1 - Cover Premium
    {
      id: 1,
      content: (
        <div className="relative h-full min-h-[800px] max-h-[800px] w-full flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${factoryHeroFull})` }} />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-dark/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="relative z-10 text-center space-y-8 px-16 max-w-7xl animate-in fade-in duration-700">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-accent-orange/20 blur-3xl rounded-full" />
              <img src={logo} alt="Lifetrek Medical" className="relative h-32 mx-auto drop-shadow-2xl" />
            </div>
            <h1 className="text-7xl font-bold mb-6 tracking-tight text-white relative">
              Lifetrek Medical
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-accent-orange/60 to-transparent" />
            </h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-[0_8px_32px_-8px_rgba(255,255,255,0.1)]">
                <img src={isoLogo} alt="ISO 13485" className="h-12" />
              </div>
            </div>
            <h2 className="text-3xl font-light max-w-4xl mx-auto leading-relaxed text-white relative">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Manufatura Contratada ISO 13485 para Implantes e Instrumentos Cirúrgicos
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Do CAD ao componente embalado em sala limpa, com qualidade zero-defeito e rastreabilidade regulatória completa.
            </p>
            <div className="flex items-center justify-center gap-4 mt-12">
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-accent-orange/40 to-accent-orange/20" />
              <div className="w-2 h-2 rounded-full bg-accent-orange/60 shadow-[0_0_12px_rgba(239,119,55,0.4)]" />
              <div className="w-32 h-0.5 bg-gradient-to-l from-transparent via-accent-orange/40 to-accent-orange/20" />
            </div>
          </div>
        </div>
      ),
    },
    // Slide 2 - Para Quem Fabricamos
    {
      id: 2,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent relative">
              Para Quem Fabricamos
              <div className="absolute -bottom-1 left-0 w-48 h-1 bg-gradient-to-r from-primary/40 via-accent/20 to-transparent" />
            </h2>
            <p className="text-xl text-muted-foreground mb-10">Parceiros que não podem comprometer a vida dos seus pacientes</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                {[
                  { title: "OEMs de Implantes Ortopédicos", desc: "Trauma, coluna, extremidades superiores e inferiores" },
                  { title: "Fabricantes de Dispositivos Dentais", desc: "Implantes, instrumentos e componentes protéticos" },
                  { title: "Empresas de Implantes Veterinários", desc: "Dispositivos ortopédicos para animais de grande e pequeno porte" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group relative">
                    <div className="absolute -left-3 top-0 w-0.5 h-full bg-gradient-to-b from-accent-orange/30 via-accent-orange/10 to-transparent" />
                    <Check className="text-accent-orange w-6 h-6 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div className="border-l-2 border-primary/10 pl-4 group-hover:border-primary/30 transition-colors duration-500">
                      <h3 className="text-2xl font-semibold mb-2 text-foreground">{item.title}</h3>
                      <p className="text-lg text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {[
                  { title: "Hospitais e Sistemas de Saúde", desc: "Instrumentos cirúrgicos customizados e ferramentas específicas" },
                  { title: "Parceiros OEM / Contract Manufacturing", desc: "Empresas que precisam de capacidade de manufatura certificada ISO 13485" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group relative">
                    <div className="absolute -left-3 top-0 w-0.5 h-full bg-gradient-to-b from-accent/30 via-accent/10 to-transparent" />
                    <Check className="text-accent w-6 h-6 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div className="border-l-2 border-accent/10 pl-4 group-hover:border-accent/30 transition-colors duration-500">
                      <h3 className="text-2xl font-semibold mb-2 text-foreground">{item.title}</h3>
                      <p className="text-lg text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-8 border-l-4 border-primary relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-accent-orange/20 to-transparent" />
              <div className="absolute top-0 right-0 w-1 h-16 bg-gradient-to-b from-accent-orange/40 to-transparent" />
              <div className="absolute bottom-0 right-0 w-32 h-0.5 bg-gradient-to-l from-accent/30 to-transparent" />
              <p className="text-2xl font-semibold text-foreground leading-relaxed relative">
                "Se seu produto entra em um corpo humano ou animal, nós fabricamos como se nossa própria vida dependesse disso."
              </p>
            </GlassCard>
          </div>
        </div>
      ),
    },
    // Slide 3 - O Problema
    {
      id: 3,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-gradient-to-br from-secondary/30 via-background to-background relative overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent relative">
              O Problema
              <div className="absolute -bottom-1 left-0 w-40 h-1 bg-gradient-to-r from-destructive/60 via-accent-orange/40 to-transparent" />
            </h2>
            <p className="text-xl text-muted-foreground mb-10">Por que terceirizar usinagem tira seu sono à noite:</p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { Icon: AlertTriangle, title: "Qualidade Inconsistente", desc: "Tolerâncias que \"variam\" entre lotes, causando recalls e custos ocultos de retrabalho.", gradient: "from-destructive/5 via-transparent to-transparent", borderColor: "border-destructive/20" },
                { Icon: FileX, title: "Documentação Fraca", desc: "Falta de rastreabilidade lote-a-lote e registros auditáveis para reguladores.", gradient: "from-accent-orange/5 via-transparent to-transparent", borderColor: "border-accent-orange/20" },
                { Icon: Clock, title: "Atrasos em Lançamentos", desc: "Lead times imprevisíveis que atrasam estudos clínicos e aprovações de mercado.", gradient: "from-primary/5 via-transparent to-transparent", borderColor: "border-primary/20" },
                { Icon: Shield, title: "Riscos de Contaminação", desc: "Oficinas sem ambiente controlado que comprometem a esterilidade do produto final.", gradient: "from-accent/5 via-transparent to-transparent", borderColor: "border-accent/20" },
                { Icon: FileX, title: "Fornecedores sem ISO 13485", desc: "Parceiros que não entendem requisitos médicos e não têm sistemas de qualidade certificados.", gradient: "from-destructive/5 via-transparent to-transparent", borderColor: "border-destructive/20" },
                { Icon: AlertTriangle, title: "Um Lote Ruim = Dano Permanente", desc: "Reputação destruída, confiança de médicos perdida e processos legais custosos.", gradient: "from-accent-orange/5 via-transparent to-transparent", borderColor: "border-accent-orange/20" }
              ].map((item, i) => (
                <div key={i} className={`bg-card/50 backdrop-blur-sm border ${item.borderColor} rounded-2xl p-8 hover:border-primary/30 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden group`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 right-0 w-24 h-0.5 bg-gradient-to-l from-accent/30 to-transparent" />
                  <item.Icon className="relative z-10 w-10 h-10 text-foreground/60 mb-4" strokeWidth={1.5} />
                  <h3 className="relative z-10 text-2xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="relative z-10 text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 4 - Nossa Promessa
    {
      id: 4,
      content: (
        <div className="relative h-full min-h-[800px] max-h-[800px] w-full bg-background overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.08]" style={{ backgroundImage: `url(${labOverview})` }} />
          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Nossa Promessa</h2>
            <p className="text-2xl font-light text-muted-foreground mb-12">Lifetrek Medical = Manufatura "sem surpresas"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-l border-accent-orange/10 pl-8">
              {[
                { Icon: Target, color: "text-primary", accent: "accent-orange", title: "Foco Exclusivo Médico", desc: "30+ anos exclusivamente em implantes e instrumentos cirúrgicos. Não fazemos automotive, aerospace ou consumer. Apenas medical." },
                { Icon: CheckCircle, color: "text-accent", accent: "accent", title: "QMS Certificado", desc: "ISO 13485:2016 completo, com auditorias anuais. Sistemas de qualidade que funcionam de verdade, não apenas documentos na gaveta." },
                { Icon: Microscope, color: "text-primary", accent: "accent-orange", title: "Mentalidade Zero-Defeito", desc: "CMM ZEISS 3D, inspeção óptica automatizada, análise de dureza e rugosidade. Medimos tudo, documentamos tudo." },
                { Icon: Shield, color: "text-accent", accent: "accent", title: "Audit-Ready Day One", desc: "Rastreabilidade completa desde matéria-prima até embalagem final. Seus auditores vão adorar nossos arquivos." }
              ].map((item, i) => (
                <GlassCard key={i} className="p-10 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-16 h-0.5 bg-${item.accent}/20`} />
                  <item.Icon className={`w-12 h-12 ${item.color} mb-6`} strokeWidth={1.5} />
                  <h3 className="text-3xl font-bold mb-4 text-foreground">{item.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 5 - O Que Fazemos
    {
      id: 5,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-12 text-foreground">O Que Fazemos</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { bg: medicalScrew, title: "Implantes Ortopédicos", desc: "Placas e parafusos de trauma, sistemas de fusão espinhal, implantes de membros superiores/inferiores, fixação craniana.", gradient: "from-primary/10 via-primary/5 to-transparent", border: "border-primary/20" },
                { bg: surgicalDrills, title: "Instrumentos Cirúrgicos", desc: "Brocas, fresas, alargadores, guides de perfuração, instrumentais para cirurgias complexas e ferramentas customizadas.", gradient: "from-accent/10 via-accent/5 to-transparent", border: "border-accent/20" },
                { bg: dentalInstruments, title: "Dispositivos Dentais", desc: "Implantes dentários, pilares protéticos (angulados e retos), componentes para sistemas de fixação e instrumentos específicos.", gradient: "from-primary/10 via-accent/5 to-transparent", border: "border-primary/20" },
                { bg: veterinaryImplant1, title: "Implantes Veterinários", desc: "Dispositivos ortopédicos para animais de grande e pequeno porte, placas, parafusos e sistemas de fixação veterinários.", gradient: "from-accent/10 via-primary/5 to-transparent", border: "border-accent/20" }
              ].map((item, i) => (
                <GlassCard key={i} className={`p-10 group relative overflow-hidden border-l-4 ${item.border}`}>
                  <div className="absolute inset-0 bg-cover bg-center opacity-[0.04]" style={{ backgroundImage: `url(${item.bg})` }} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-l from-accent-orange/30 to-transparent" />
                  <h3 className="relative z-10 text-3xl font-bold mb-4 bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">{item.title}</h3>
                  <p className="relative z-10 text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 6A - Como Fazemos: Processo
    {
      id: 6,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 text-foreground">Como Fazemos</h2>
            <p className="text-2xl text-muted-foreground mb-12">Do desenho a componentes sterile-ready em 6 etapas controladas:</p>
            <div className="space-y-6 border-l border-primary/20 pl-12 max-w-4xl">
              {[
                { num: 1, title: "DFM & Análise de Risco", desc: "CAD/CAM review, FMEA de processo, identificação de pontos críticos", accent: false },
                { num: 2, title: "Usinagem CNC", desc: "Swiss-type tornos, multi-axis, com controle estatístico de processo", accent: false },
                { num: 3, title: "Tratamento Térmico", desc: "Fornos controlados com rastreabilidade de ciclos e certificados", accent: false },
                { num: 4, title: "Acabamento Superficial", desc: "Electropolish, passivação, inspeção visual 100%", accent: false },
                { num: 5, title: "Metrologia Avançada", desc: "CMM 3D, inspeção óptica, dureza, rugosidade - tudo documentado", accent: false },
                { num: 6, title: "Embalagem Cleanroom ISO 7", desc: "60m² de salas limpas, componentes prontos para esterilização", accent: true }
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-8 relative group ${item.accent ? 'border-l-2 border-accent -ml-[1px] pl-11' : ''}`}>
                  <div className={`absolute -left-12 top-0 text-6xl font-bold ${item.accent ? 'text-accent/20' : 'text-primary/15'}`}>{item.num}</div>
                  <div className={`${item.accent ? 'bg-accent/5' : 'bg-primary/5'} rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold flex-shrink-0 ${item.accent ? 'text-accent' : 'text-primary'} border border-border/30`}>{item.num}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-foreground">{item.title}</h3>
                      {item.accent && <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />}
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 6B - Como Fazemos: Equipamentos  
    {
      id: 7,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 text-foreground">Equipamentos de Manufatura</h2>
            <p className="text-xl text-muted-foreground mb-10">Tecnologia Swiss e Multi-axis para precisão micrométrica</p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { img: citizenL20, name: "Citizen Swiss L20", desc: "Tornos Swiss-type de 7 eixos para componentes complexos" },
                { img: citizenM32, name: "Citizen Cincom M32", desc: "Alta precisão para implantes com diâmetros até 32mm" },
                { img: doosanNew, name: "Doosan DNM 400", desc: "Centro de usinagem 5 eixos para geometrias complexas" },
                { img: robodrill, name: "FANUC Robodrill", desc: "Usinagem rápida de alta precisão com troca automática" },
                { img: zeissContura, name: "ZEISS Contura", desc: "CMM 3D com precisão de 0.001mm para metrologia" },
                { img: electropolishLine, name: "Linha Electropolish", desc: "Acabamento espelhado e passivação controlada" }
              ].map((item, i) => (
                <GlassCard key={i} className="p-6 group hover:scale-[1.02] transition-transform duration-500">
                  <div className="bg-card/50 rounded-xl p-4 mb-4 h-40 flex items-center justify-center overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="border-t border-accent-orange/10 pt-4">
                    <h3 className="text-xl font-bold mb-2 text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 7A - Infraestrutura: CNC Park
    {
      id: 8,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Parque CNC</h2>
            <p className="text-xl text-muted-foreground mb-10">15+ máquinas de alta precisão para manufatura médica</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard className="p-10 relative overflow-hidden border-l-4 border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
                <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-accent-orange/30 via-primary/20 to-transparent" />
                <h3 className="relative text-3xl font-bold mb-6 text-foreground">Swiss-Type CNC</h3>
                <ul className="relative space-y-4">
                  {["Citizen Cincom L20 (7 eixos)", "Citizen Cincom L32 (diâmetros até 32mm)", "Citizen Cincom M32 (alta precisão)", "Tornos GT26 e GT13"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg text-muted-foreground border-l-2 border-accent-orange/10 pl-3">
                      <Check className="text-accent w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
              <GlassCard className="p-10 relative overflow-hidden border-l-4 border-accent/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50" />
                <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-accent/30 via-primary/20 to-transparent" />
                <h3 className="relative text-3xl font-bold mb-6 text-foreground">Multi-Axis & Suporte</h3>
                <ul className="relative space-y-4">
                  {["Doosan DNM 400 (5 eixos)", "FANUC Robodrill (alta velocidade)", "Retíficas Walter", "Laser Marking fibra"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg text-muted-foreground border-l-2 border-accent-orange/10 pl-3">
                      <Check className="text-accent w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-6">
              {[citizenL20, citizenM32, doosanNew, robodrill].map((img, i) => (
                <div key={i} className="bg-card/30 rounded-xl p-4 border border-border/20 hover:border-primary/20 transition-colors duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img src={img} alt="Equipment" className="relative w-full h-24 object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 7B - Infraestrutura: Metrologia
    {
      id: 9,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Laboratório de Metrologia</h2>
            <p className="text-xl text-muted-foreground mb-10">100m² dedicados à inspeção dimensional e certificação</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="p-8 relative overflow-hidden border-t-4 border-primary/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
                <div className="absolute bottom-0 right-0 w-1 h-20 bg-gradient-to-t from-accent-orange/30 to-transparent" />
                <h3 className="relative text-2xl font-bold mb-4 text-foreground">CMM 3D</h3>
                <p className="relative text-muted-foreground mb-4">ZEISS Contura com precisão de <span className="text-primary font-bold">0.001mm</span></p>
                <img src={zeissContura} alt="ZEISS" className="relative w-full h-32 object-contain rounded-lg bg-card/50 p-3 border border-border/20" />
              </GlassCard>
              <GlassCard className="p-8 relative overflow-hidden border-t-4 border-accent/30">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-transparent" />
                <div className="absolute bottom-0 right-0 w-1 h-20 bg-gradient-to-t from-accent-orange/30 to-transparent" />
                <h3 className="relative text-2xl font-bold mb-4 text-foreground">Inspeção Óptica</h3>
                <p className="relative text-muted-foreground mb-4">CNC e manual para geometrias complexas</p>
                <img src={opticalCNC} alt="Optical" className="relative w-full h-32 object-contain rounded-lg bg-card/50 p-3 border border-border/20" />
              </GlassCard>
              <GlassCard className="p-8 relative overflow-hidden border-t-4 border-accent-orange/30">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/8 via-transparent to-transparent" />
                <div className="absolute bottom-0 right-0 w-1 h-20 bg-gradient-to-t from-primary/30 to-transparent" />
                <h3 className="relative text-2xl font-bold mb-4 text-foreground">Análise de Material</h3>
                <ul className="relative space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2 text-sm border-l-2 border-accent/20 pl-2"><Check className="w-4 h-4 text-accent" strokeWidth={1.5} />Dureza Vickers</li>
                  <li className="flex items-center gap-2 text-sm border-l-2 border-accent/20 pl-2"><Check className="w-4 h-4 text-accent" strokeWidth={1.5} />Rugosidade</li>
                  <li className="flex items-center gap-2 text-sm border-l-2 border-accent/20 pl-2"><Check className="w-4 h-4 text-accent" strokeWidth={1.5} />Metalografia</li>
                </ul>
              </GlassCard>
            </div>
            <GlassCard className="mt-8 p-8 border-l-4 border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-accent-orange/20 to-transparent" />
              <p className="text-xl text-foreground leading-relaxed">"Cada componente é medido e documentado. Rastreabilidade lote-a-lote para auditorias regulatórias."</p>
            </GlassCard>
          </div>
        </div>
      ),
    },
    // Slide 7C - Infraestrutura: Cleanrooms
    {
      id: 10,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: `url(${cleanroomHero})` }} />
          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-accent-orange bg-clip-text text-transparent">Salas Limpas ISO 7</h2>
            <p className="text-xl text-muted-foreground mb-10">120m² de ambiente controlado para embalagem sterile-ready</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <GlassCard className="p-10 relative overflow-hidden mb-8 border-l-4 border-accent/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
                  <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-l from-accent/30 to-transparent" />
                  <h3 className="relative text-3xl font-bold mb-6 text-foreground">Controles Ambientais</h3>
                  <ul className="relative space-y-4">
                    {[
                      "Monitoramento contínuo de partículas",
                      "Temperatura e umidade controladas",
                      "Pressão positiva diferencial",
                      "Acesso controlado com paramentação"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 border-l-2 border-accent-orange/10 pl-3">
                        <CheckCircle className="text-accent w-6 h-6 flex-shrink-0 mt-1" strokeWidth={1.5} />
                        <span className="text-lg text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
                <div className="border-l-4 border-accent-orange/20 pl-6 relative">
                  <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-accent-orange/30 to-transparent" />
                  <p className="text-lg text-muted-foreground leading-relaxed">"Componentes saem prontos para esterilização. Seus processos de embalagem final ficam mais simples e seguros."</p>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <img src={cleanroomHero} alt="Cleanroom" className="w-full h-80 object-cover rounded-2xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border border-border/20" />
                <GlassCard className="p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-accent-orange/30" />
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-4xl font-bold bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent mb-2">120m²</div>
                      <div className="text-sm text-muted-foreground">Área Total</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold bg-gradient-to-br from-accent to-accent/80 bg-clip-text text-transparent mb-2">ISO 7</div>
                      <div className="text-sm text-muted-foreground">Classificação</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold bg-gradient-to-br from-accent-orange to-accent-orange/80 bg-clip-text text-transparent mb-2">24/7</div>
                      <div className="text-sm text-muted-foreground">Monitoramento</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 8 - Clientes
    {
      id: 11,
      content: (
        <div className="relative h-full min-h-[800px] max-h-[800px] w-full bg-background overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.05]" style={{ backgroundImage: `url(${factoryExterior})` }} />
          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-10 text-foreground">Confiança de Líderes do Mercado</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-6 mb-10">
              {clientLogos.map((logo, index) => (
                <div key={index} className="flex items-center justify-center group relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 via-accent-orange/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img src={logo.src} alt={logo.name} className="relative h-12 w-auto object-contain filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-500 mix-blend-multiply" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { num: "30+", label: "Clientes Médicos Ativos", gradient: "from-primary via-primary to-primary-dark", borderTop: "from-primary/30 via-primary/50 to-primary/30" },
                { num: "30+", label: "Anos de Experiência", gradient: "from-accent via-accent to-accent/80", borderTop: "from-accent/30 via-accent/50 to-accent/30" },
                { num: "100%", label: "Produtos com Qualidade Assegurada", gradient: "from-accent-orange via-accent-orange to-accent-orange/80", borderTop: "from-accent-orange/30 via-accent-orange/50 to-accent-orange/30" }
              ].map((item, i) => (
                <GlassCard key={i} className="p-10 text-center relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.borderTop}`} />
                  <div className={`text-7xl font-bold bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-500`}>{item.num}</div>
                  <p className="text-lg text-muted-foreground font-medium">{item.label}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 9 - Low-Risk Start
    {
      id: 12,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 text-foreground">Comece com Baixo Risco</h2>
            <h3 className="text-3xl text-primary mb-10">Célula Piloto de Manufatura</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                {[
                  { title: "1-3 componentes críticos", desc: "Escolha as peças mais desafiadoras do seu portfólio" },
                  { title: "Processo completo", desc: "Usinagem → acabamento → metrologia → embalagem cleanroom" },
                  { title: "Documentação completa", desc: "Toda documentação para seu arquivo regulatório (DHF/DMR)" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <Check className="text-accent w-7 h-7 mt-1 flex-shrink-0" strokeWidth={1.5} />
                    <div className="border-l border-accent/10 pl-3">
                      <h4 className="text-2xl font-bold mb-2 text-foreground">{item.title}</h4>
                      <p className="text-lg text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <GlassCard className="p-10 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
                <h4 className="text-3xl font-bold mb-6 text-foreground">Garantia de Resultado</h4>
                <p className="text-xl text-muted-foreground leading-relaxed mb-6">Se não atingirmos suas especificações técnicas e de qualidade no piloto, você sai com:</p>
                <ul className="space-y-3 text-lg text-muted-foreground">
                  {["Toda documentação de processo", "Relatórios completos de medição", "Lições aprendidas e recomendações"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3"><CheckCircle className="text-accent w-6 h-6 flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </GlassCard>
            </div>
            <div className="flex justify-center">
              <button className="bg-primary hover:bg-primary-hover text-primary-foreground text-2xl font-bold px-12 py-6 rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-all duration-500 border border-accent-orange/10 flex items-center gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-0.5 bg-gradient-to-l from-accent-orange/30 to-transparent" />
                Agendar Consulta<ArrowRight className="w-8 h-8 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 10 - Próximos Passos
    {
      id: 13,
      content: (
        <div className="h-full min-h-[800px] max-h-[800px] w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-12 text-foreground">Próximos Passos</h2>
            <div className="space-y-10 mb-12">
              {[
                { num: "1", title: "Assinar NDA", desc: "Confidencialidade garantida para todas as informações técnicas e comerciais", border: "border-primary/30" },
                { num: "2", title: "Compartilhar Requisitos", desc: "Desenhos técnicos, volumes estimados, especificações e certificações necessárias", border: "border-primary/30" },
                { num: "3", title: "Receber DFM + Cotação", desc: "Análise de manufaturabilidade e proposta comercial detalhada em 5-7 dias úteis", border: "border-accent/50" },
                { num: "4", title: "Aprovar Piloto → Escalar", desc: "Validação de processo e transição para produção seriada com qualidade garantida", border: "border-gradient-to-b from-primary via-accent to-accent-orange" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-8 relative">
                  <div className={`text-6xl font-bold ${i === 3 ? 'text-accent/40' : 'text-primary/20'} absolute -left-4`}>{item.num}</div>
                  <div className={`ml-20 border-l-4 ${item.border} pl-8`}>
                    <h3 className="text-3xl font-bold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-lg text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <GlassCard className="p-10 border-l-4 border-primary">
              <p className="text-3xl font-semibold text-foreground leading-relaxed mb-8">"Vamos revisar um projeto atual ou futuro e ver se conseguimos reduzir seu risco de timeline e qualidade."</p>
              <div className="flex items-center gap-8 text-muted-foreground">
                <div className="text-lg">contato@lifetrek.com.br</div>
                <div className="h-6 w-px bg-border" />
                <div className="text-lg">+55 (47) 3370-7146</div>
              </div>
            </GlassCard>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  
  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Lifetrek" className="h-8" />
            <span className="text-sm text-muted-foreground">Sales Pitch Deck</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" />Share</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Download PDF</Button>
          </div>
        </div>
      </div>
      <div className="pt-20 h-screen">
        <div className="h-[calc(100vh-8rem)] relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold && currentSlide < slides.length - 1) {
                  nextSlide();
                } else if (swipe > swipeConfidenceThreshold && currentSlide > 0) {
                  prevSlide();
                }
              }}
              className="absolute inset-0"
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="outline" size="lg" onClick={prevSlide} disabled={currentSlide === 0}><ChevronLeft className="w-5 h-5 mr-2" />Previous</Button>
          <div className="flex items-center gap-2">{slides.map((_, index) => (<button key={index} onClick={() => goToSlide(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50"}`} />))}</div>
          <Button variant="outline" size="lg" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>Next<ChevronRight className="w-5 h-5 ml-2" /></Button>
        </div>
      </div>
      <div className="fixed bottom-24 right-8 z-40"><img src={logo} alt="Lifetrek" className="h-8 opacity-30" /></div>
    </div>
  );
};

export default PitchDeck;