import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
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
  Microscope,
  Bone,
  Scissors,
  Smile,
  PawPrint,
  Zap,
  Factory,
  Layers,
  Cog,
  Sparkles,
  Package
} from "lucide-react";
import { BlobBackground } from "@/components/BlobBackground";
import { StatCard } from "@/components/StatCard";
import { MagneticButton } from "@/components/MagneticButton";

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

// Enhanced Glass Card Components with Multiple Variants
const GlassCard = ({ children, className = "", variant = "default" }: { children: React.ReactNode; className?: string; variant?: "default" | "elevated" | "accent" | "primary" }) => {
  const variants = {
    default: "bg-background/60 backdrop-blur-2xl border border-border/30 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] hover:border-border/50",
    elevated: "bg-background/70 backdrop-blur-3xl border-2 border-border/40 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.12)] hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.2)] hover:border-primary/30 hover:-translate-y-1",
    accent: "bg-gradient-to-br from-accent/5 via-background/60 to-background/60 backdrop-blur-2xl border-2 border-accent/20 shadow-[0_8px_24px_-8px_rgba(234,88,12,0.15)] hover:shadow-[0_20px_40px_-12px_rgba(234,88,12,0.25)] hover:border-accent/40",
    primary: "bg-gradient-to-br from-primary/5 via-background/60 to-background/60 backdrop-blur-2xl border-2 border-primary/20 shadow-[0_8px_24px_-8px_rgba(0,114,187,0.15)] hover:shadow-[0_20px_40px_-12px_rgba(0,114,187,0.25)] hover:border-primary/40"
  };

  return (
    <div className={`${variants[variant]} rounded-2xl transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
};

// Animated Stat Counter Component
const StatCounter = ({ value, label, suffix = "" }: { value: string; label: string; suffix?: string }) => (
  <div className="text-center group">
    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary to-accent mb-3 group-hover:scale-110 transition-transform duration-300">
      {value}{suffix}
    </div>
    <div className="text-lg text-muted-foreground font-medium">{label}</div>
  </div>
);

// Section Badge Component for Consistency
const SectionBadge = ({ icon: Icon, label, variant = "primary" }: { icon: React.ElementType; label: string; variant?: "primary" | "accent" | "warning" }) => {
  const variants = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    accent: "bg-accent/10 border-accent/20 text-accent",
    warning: "bg-red-500/10 border-red-500/20 text-red-500"
  };

  return (
    <div className={`inline-flex items-center gap-3 mb-4 px-4 py-2 border rounded-full ${variants[variant]}`}>
      <Icon className="w-5 h-5" strokeWidth={2} />
      <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
    </div>
  );
};

// Enhanced Section Header Component (Standardized with Badges)
const SectionHeader = ({ badge, title, subtitle, align = "left" }: {
  badge?: { icon: React.ElementType; label: string; variant?: "primary" | "accent" | "warning" };
  title: string;
  subtitle?: string;
  align?: "left" | "center"
}) => (
  <div className={`mb-16 ${align === "center" ? "text-center" : ""}`}>
    {badge && <SectionBadge {...badge} />}
    <h2 className="text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-primary/70">
      {title}
    </h2>
    {subtitle && (
      <p className="text-2xl text-muted-foreground font-light tracking-wide">{subtitle}</p>
    )}
  </div>
);

// Standardized Slide Container
const SlideContainer = ({ children, withBlobs = true }: { children: React.ReactNode; withBlobs?: boolean }) => (
  <div className="relative h-full w-full bg-background overflow-hidden">
    {withBlobs && <BlobBackground />}
    <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
      {children}
    </div>
  </div>
);

const PitchDeck = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

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
    // Slide 1 - Cover Premium (ENHANCED)
    {
      id: 1,
      content: (
        <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url(${factoryHeroFull})` }} />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary-dark/95" />

          {/* Animated Overlay Accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10 text-center space-y-10 px-16 max-w-7xl animate-in fade-in duration-1000">
            <img src={logo} alt="Lifetrek Medical" className="h-40 mx-auto mb-4 drop-shadow-2xl hover:scale-105 transition-transform duration-500" />

            <h1 className="text-8xl font-black mb-8 tracking-tight text-white drop-shadow-2xl animate-in slide-in-from-bottom duration-700">
              Lifetrek Medical
            </h1>

            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border-2 border-white/30 shadow-2xl hover:scale-110 hover:bg-white/20 transition-all duration-300">
                <img src={isoLogo} alt="ISO 13485" className="h-16" />
              </div>
            </div>

            <h2 className="text-4xl font-bold max-w-5xl mx-auto leading-tight text-white drop-shadow-lg">
              Manufatura Contratada ISO 13485 para Implantes e Instrumentos Cirúrgicos
            </h2>

            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
              <p className="text-2xl text-white font-light leading-relaxed">
                Do CAD ao componente embalado em sala limpa, com qualidade <span className="text-accent font-bold">zero-defeito</span> e rastreabilidade regulatória completa.
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent to-accent rounded-full" />
              <div className="text-white/60 text-lg font-light">Scroll para explorar</div>
              <div className="h-1 w-24 bg-gradient-to-l from-transparent to-accent rounded-full" />
            </div>
          </div>
        </div>
      ),
    },
    // Slide 2 - Para Quem Fabricamos (ENHANCED with Consistency)
    {
      id: 2,
      content: (
        <SlideContainer>
          <div className="absolute right-0 top-0 h-full w-1/2 bg-cover bg-center opacity-[0.07]" style={{ backgroundImage: `url(${cleanroomHero})` }} />
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-accent via-primary to-transparent opacity-40" />

          <SectionHeader
            badge={{ icon: Target, label: "Nossos Parceiros", variant: "primary" }}
            title="Para Quem Fabricamos"
            subtitle="Parceiros estratégicos em múltiplos segmentos médicos"
          />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
              <div className="space-y-6">
                {[
                  { title: "OEMs de Implantes Ortopédicos", desc: "Trauma, coluna, extremidades superiores e inferiores", icon: Bone },
                  { title: "Fabricantes de Dispositivos Dentais", desc: "Implantes, instrumentos e componentes protéticos", icon: Smile },
                  { title: "Empresas de Implantes Veterinários", desc: "Dispositivos ortopédicos para animais de grande e pequeno porte", icon: PawPrint }
                ].map((item, i) => (
                  <GlassCard key={i} variant="elevated" className="p-6 group hover:scale-[1.02]">
                    <div className="flex items-start gap-5">
                      <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl p-3 group-hover:from-accent/20 group-hover:to-primary/20 transition-colors duration-300">
                        <item.icon className="text-accent w-8 h-8" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                        <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
              <div className="space-y-6">
                {[
                  { title: "Hospitais e Sistemas de Saúde", desc: "Instrumentos cirúrgicos customizados e ferramentas específicas", icon: Shield },
                  { title: "Parceiros OEM / Contract Manufacturing", desc: "Empresas que precisam de capacidade de manufatura certificada ISO 13485", icon: Factory }
                ].map((item, i) => (
                  <GlassCard key={i} variant="elevated" className="p-6 group hover:scale-[1.02]">
                    <div className="flex items-start gap-5">
                      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-3 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors duration-300">
                        <item.icon className="text-primary w-8 h-8" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                        <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

          <GlassCard variant="accent" className="p-10 border-l-4 border-accent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-accent to-transparent" />
            <div className="flex items-start gap-6">
              <div className="text-6xl text-accent/20">"</div>
              <p className="text-3xl font-bold text-foreground leading-relaxed">
                Se seu produto entra em um corpo humano ou animal, nós fabricamos como se nossa própria vida dependesse disso.
              </p>
            </div>
          </GlassCard>
        </SlideContainer>
      ),
    },
    // Slide 3 - O Problema (ENHANCED)
    {
      id: 3,
      content: (
        <div className="relative h-full w-full bg-gradient-to-br from-secondary/20 via-background to-background overflow-hidden">
          {/* Dramatic background elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={2} />
                <span className="text-sm font-bold text-red-500 uppercase tracking-wide">Desafios Críticos</span>
              </div>
              <h2 className="text-7xl font-black mb-4 text-foreground">O Problema</h2>
              <p className="text-2xl text-muted-foreground font-light">Por que terceirizar usinagem tira seu sono à noite:</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { Icon: AlertTriangle, title: "Qualidade Inconsistente", desc: "Tolerâncias que \"variam\" entre lotes, causando recalls e custos ocultos de retrabalho.", color: "red" },
                { Icon: FileX, title: "Documentação Fraca", desc: "Falta de rastreabilidade lote-a-lote e registros auditáveis para reguladores.", color: "orange" },
                { Icon: Clock, title: "Atrasos em Lançamentos", desc: "Lead times imprevisíveis que atrasam estudos clínicos e aprovações de mercado.", color: "amber" },
                { Icon: Shield, title: "Riscos de Contaminação", desc: "Oficinas sem ambiente controlado que comprometem a esterilidade do produto final.", color: "rose" },
                { Icon: FileX, title: "Fornecedores sem ISO 13485", desc: "Parceiros que não entendem requisitos médicos e não têm sistemas de qualidade certificados.", color: "orange" },
                { Icon: AlertTriangle, title: "Um Lote Ruim = Dano Permanente", desc: "Reputação destruída, confiança de médicos perdida e processos legais custosos.", color: "red" }
              ].map((item, i) => (
                <GlassCard key={i} variant="elevated" className="p-7 group hover:scale-105 hover:-translate-y-1 relative">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${item.color}-500/40 via-${item.color}-500/20 to-transparent`} />
                  <div className={`bg-${item.color}-500/10 rounded-xl p-3 w-fit mb-4 group-hover:bg-${item.color}-500/15 transition-colors duration-300`}>
                    <item.Icon className={`w-9 h-9 text-${item.color}-500`} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-black mb-3 text-foreground leading-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </GlassCard>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="text-sm text-muted-foreground font-medium">A Lifetrek resolve todos estes problemas</div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          </div>
        </div>
      ),
    },
    // Slide 4 - Nossa Promessa (ENHANCED)
    {
      id: 4,
      content: (
        <div className="relative h-full w-full bg-background overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: `url(${labOverview})` }} />

          {/* Accent elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <div className="mb-14">
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <CheckCircle className="w-5 h-5 text-primary" strokeWidth={2} />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">Nossa Solução</span>
              </div>
              <h2 className="text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
                Nossa Promessa
              </h2>
              <p className="text-3xl font-bold text-foreground">
                Manufatura <span className="text-accent">"sem surpresas"</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { Icon: Target, variant: "primary", title: "Foco Exclusivo Médico", desc: "30+ anos exclusivamente em implantes e instrumentos cirúrgicos. Não fazemos automotive, aerospace ou consumer. Apenas medical.", stat: "100%" },
                { Icon: CheckCircle, variant: "accent", title: "QMS Certificado", desc: "ISO 13485:2016 completo, com auditorias anuais. Sistemas de qualidade que funcionam de verdade, não apenas documentos na gaveta.", stat: "ISO" },
                { Icon: Microscope, variant: "primary", title: "Mentalidade Zero-Defeito", desc: "CMM ZEISS 3D, inspeção óptica automatizada, análise de dureza e rugosidade. Medimos tudo, documentamos tudo.", stat: "0" },
                { Icon: Shield, variant: "accent", title: "Audit-Ready Day One", desc: "Rastreabilidade completa desde matéria-prima até embalagem final. Seus auditores vão adorar nossos arquivos.", stat: "✓" }
              ].map((item, i) => (
                <GlassCard key={i} variant={item.variant as "primary" | "accent"} className="p-8 relative overflow-hidden group hover:scale-[1.02]">
                  {/* Background stat */}
                  <div className={`absolute top-4 right-4 text-8xl font-black ${item.variant === "primary" ? "text-primary/5" : "text-accent/5"} group-hover:scale-110 transition-transform duration-500`}>
                    {item.stat}
                  </div>

                  <div className={`bg-gradient-to-br ${item.variant === "primary" ? "from-primary/15 to-primary/5" : "from-accent/15 to-accent/5"} rounded-2xl p-4 w-fit mb-6 group-hover:shadow-lg transition-all duration-300`}>
                    <item.Icon className={`w-10 h-10 ${item.variant === "primary" ? "text-primary" : "text-accent"}`} strokeWidth={2} />
                  </div>

                  <h3 className="text-2xl font-black mb-4 text-foreground relative z-10">{item.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed relative z-10">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 5 - O Que Fazemos (ENHANCED)
    {
      id: 5,
      content: (
        <div className="relative h-full w-full bg-background overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/5" />

          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <SectionHeader title="O Que Fazemos" subtitle="Portfolio completo de dispositivos médicos e cirúrgicos" />

            <div className="grid grid-cols-2 gap-10">
              {[
                { Icon: Bone, bg: medicalScrew, title: "Implantes Ortopédicos", desc: "Placas e parafusos de trauma, sistemas de fusão espinhal, implantes de membros superiores/inferiores, fixação craniana.", gradient: "from-blue-500/10 to-primary/10" },
                { Icon: Scissors, bg: surgicalDrills, title: "Instrumentos Cirúrgicos", desc: "Brocas, fresas, alargadores, guides de perfuração, instrumentais para cirurgias complexas e ferramentas customizadas.", gradient: "from-accent/10 to-orange-500/10" },
                { Icon: Smile, bg: dentalInstruments, title: "Dispositivos Dentais", desc: "Implantes dentários, pilares protéticos (angulados e retos), componentes para sistemas de fixação e instrumentos específicos.", gradient: "from-primary/10 to-cyan-500/10" },
                { Icon: PawPrint, bg: veterinaryImplant1, title: "Implantes Veterinários", desc: "Dispositivos ortopédicos para animais de grande e pequeno porte, placas, parafusos e sistemas de fixação veterinários.", gradient: "from-accent/10 to-amber-500/10" }
              ].map((item, i) => (
                <GlassCard key={i} variant="elevated" className="p-0 group relative overflow-hidden hover:scale-[1.03]">
                  {/* Image header */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url(${item.bg})` }} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} backdrop-blur-[1px]`} />

                    {/* Icon overlay */}
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-xl rounded-xl p-3 border border-border/30 group-hover:scale-110 transition-transform duration-300">
                      <item.Icon className="w-8 h-8 text-primary" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-2xl font-black mb-3 text-foreground group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500" />
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
        <div className="h-full w-full bg-background">
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
            <div className="mt-12 flex items-center gap-2 text-muted-foreground max-w-4xl pl-12">
              <div className="h-px flex-1 bg-gradient-to-r from-accent-orange/20 via-accent-orange/10 to-transparent" />
              <span className="text-sm">Próximo: Infraestrutura</span>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 6B - Como Fazemos: Equipamentos
    {
      id: 7,
      content: (
        <div className="h-full w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-5xl font-bold mb-6 text-foreground">Equipamentos de Manufatura</h2>
            <p className="text-xl text-muted-foreground mb-12">Tecnologia Swiss e Multi-axis para precisão micrométrica</p>
            <div className="grid grid-cols-3 gap-8">
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
        <div className="h-full w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Parque CNC</h2>
            <p className="text-2xl text-muted-foreground mb-12">15+ máquinas de alta precisão para manufatura médica</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
            <div className="mt-12 grid grid-cols-4 gap-6">
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
        <div className="h-full w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Laboratório de Metrologia</h2>
            <p className="text-2xl text-muted-foreground mb-12">100m² dedicados à inspeção dimensional e certificação</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <GlassCard className="mt-12 p-8 border-l-4 border-primary/30 relative overflow-hidden">
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
        <div className="h-full w-full bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: `url(${cleanroomHero})` }} />
          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-accent-orange bg-clip-text text-transparent">Salas Limpas ISO 7</h2>
            <p className="text-2xl text-muted-foreground mb-12">120m² de ambiente controlado para embalagem sterile-ready</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
    // Slide 8 - Clientes (ENHANCED)
    {
      id: 11,
      content: (
        <div className="relative h-full w-full bg-background overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.04]" style={{ backgroundImage: `url(${factoryExterior})` }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <CheckCircle className="w-5 h-5 text-accent" strokeWidth={2} />
                <span className="text-sm font-bold text-accent uppercase tracking-wide">Portfolio de Clientes</span>
              </div>
              <h2 className="text-7xl font-black mb-2 text-foreground">Confiança de Líderes do Mercado</h2>
              <p className="text-2xl text-muted-foreground font-light">Parceiros de excelência que confiam na nossa manufatura</p>
            </div>

            {/* Stats Cards - Animated with StatCard Component */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              {[
                { num: "30+", label: "Clientes Médicos Ativos", icon: Factory, delay: 0 },
                { num: "15+", label: "Anos de Parcerias OEM", icon: CheckCircle, delay: 200 },
                { num: "Zero", label: "Não-conformidades Maiores", icon: Shield, delay: 400 }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <item.icon className={`w-10 h-10 mx-auto mb-3 ${i === 2 ? "text-accent" : "text-primary"}`} strokeWidth={2} />
                  <StatCard value={item.num} label={item.label} delay={item.delay} />
                </div>
              ))}
            </div>

            {/* Logo Grid - Enhanced */}
            <GlassCard className="p-10">
              <div className="grid grid-cols-6 gap-x-10 gap-y-8">
                {clientLogos.map((logo, index) => (
                  <div key={index} className="flex items-center justify-center group relative">
                    <div className="absolute -inset-3 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                    <div className="relative bg-background/50 rounded-lg p-3 group-hover:bg-background/80 transition-all duration-300 border border-border/20 group-hover:border-primary/30">
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="h-10 w-auto object-contain filter grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100 transition-all duration-500 mix-blend-multiply"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      ),
    },
    // Slide 9 - Low-Risk Start (ENHANCED)
    {
      id: 12,
      content: (
        <div className="relative h-full w-full bg-background overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-primary to-accent opacity-30" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <div className="mb-10">
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <Zap className="w-5 h-5 text-accent" strokeWidth={2} />
                <span className="text-sm font-bold text-accent uppercase tracking-wide">Próximo Passo</span>
              </div>
              <h2 className="text-7xl font-black mb-3 text-foreground">Comece com Baixo Risco</h2>
              <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Célula Piloto de Manufatura</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
              <div className="space-y-6">
                {[
                  { title: "1-3 componentes críticos", desc: "Escolha as peças mais desafiadoras do seu portfólio", icon: Target },
                  { title: "Processo completo", desc: "Usinagem → acabamento → metrologia → embalagem cleanroom", icon: Layers },
                  { title: "Documentação completa", desc: "Toda documentação para seu arquivo regulatório (DHF/DMR)", icon: CheckCircle }
                ].map((item, i) => (
                  <GlassCard key={i} variant="elevated" className="p-6 group hover:scale-[1.02]">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-primary/15 to-accent/15 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="text-primary w-7 h-7" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-black mb-2 text-foreground">{item.title}</h4>
                        <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>

              <GlassCard variant="accent" className="p-10 border-2 border-accent/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-accent-orange to-accent" />
                <div className="absolute bottom-0 right-0 text-9xl font-black text-accent/5">✓</div>

                <Shield className="w-14 h-14 text-accent mb-6" strokeWidth={2} />
                <h4 className="text-3xl font-black mb-4 text-foreground relative z-10">Garantia de Resultado</h4>
                <p className="text-xl text-foreground leading-relaxed mb-6 relative z-10">Se não atingirmos suas especificações técnicas e de qualidade no piloto, você sai com:</p>

                <ul className="space-y-4 relative z-10">
                  {["Toda documentação de processo", "Relatórios completos de medição", "Lições aprendidas e recomendações"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="text-accent w-6 h-6 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-base text-muted-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Enhanced Magnetic CTA Button */}
            <div className="flex justify-center">
              <MagneticButton
                strength={30}
                className="group relative bg-gradient-to-r from-primary via-primary to-accent hover:from-accent hover:via-primary hover:to-primary text-white text-2xl font-black px-16 py-8 rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,114,187,0.4)] hover:shadow-[0_24px_48px_-16px_rgba(234,88,12,0.5)] transition-all duration-500 border-2 border-white/10 flex items-center gap-4 overflow-hidden"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10">Agendar Consulta</span>
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-300 relative z-10" strokeWidth={2.5} />
              </MagneticButton>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 10 - Próximos Passos (ENHANCED)
    {
      id: 13,
      content: (
        <div className="relative h-full w-full bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <div className="mb-14">
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <ArrowRight className="w-5 h-5 text-primary" strokeWidth={2} />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">Como Começar</span>
              </div>
              <h2 className="text-7xl font-black mb-2 text-foreground">Próximos Passos</h2>
              <p className="text-2xl text-muted-foreground font-light">Seu caminho para manufatura de classe mundial</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
              {[
                { num: "1", title: "Assinar NDA", desc: "Confidencialidade garantida para todas as informações técnicas e comerciais", color: "primary", icon: Shield },
                { num: "2", title: "Compartilhar Requisitos", desc: "Desenhos técnicos, volumes estimados, especificações e certificações necessárias", color: "primary", icon: FileX },
                { num: "3", title: "Receber DFM + Cotação", desc: "Análise de manufaturabilidade e proposta comercial detalhada em 5-7 dias úteis", color: "accent", icon: Microscope },
                { num: "4", title: "Aprovar Piloto → Escalar", desc: "Validação de processo e transição para produção seriada com qualidade garantida", color: "accent", icon: Zap }
              ].map((item, i) => (
                <GlassCard key={i} variant={item.color as "primary" | "accent"} className="p-8 group hover:scale-[1.03] transition-all duration-300 relative overflow-hidden">
                  {/* Step number background */}
                  <div className={`absolute top-4 right-4 text-7xl font-black ${item.color === "primary" ? "text-primary/5" : "text-accent/5"}`}>
                    {item.num}
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`${item.color === "primary" ? "bg-primary/15" : "bg-accent/15"} rounded-xl p-2.5`}>
                        <item.icon className={`w-8 h-8 ${item.color === "primary" ? "text-primary" : "text-accent"}`} strokeWidth={2} />
                      </div>
                      <div className={`text-5xl font-black ${item.color === "primary" ? "text-primary" : "text-accent"}`}>{item.num}</div>
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Contact Card */}
            <GlassCard variant="elevated" className="p-10 border-l-4 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-1 bg-gradient-to-l from-accent to-transparent" />
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl text-accent/20">"</div>
                    <p className="text-2xl font-bold text-foreground leading-tight">
                      Vamos revisar um projeto atual ou futuro e ver se conseguimos reduzir seu risco de timeline e qualidade.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:border-l lg:border-border/30 lg:pl-8">
                  <a href="mailto:contato@lifetrek.com.br" className="flex items-center gap-3 px-6 py-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors duration-300 group">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-primary font-bold">@</span>
                    </div>
                    <span className="text-foreground font-semibold">contato@lifetrek.com.br</span>
                  </a>

                  <a href="tel:+554733707146" className="flex items-center gap-3 px-6 py-3 bg-accent/10 hover:bg-accent/20 rounded-xl transition-colors duration-300 group">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-accent font-bold">☎</span>
                    </div>
                    <span className="text-foreground font-semibold">+55 (47) 3370-7146</span>
                  </a>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

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
      <div className="pt-20 h-screen"><div className="h-[calc(100vh-8rem)] relative">{slides[currentSlide].content}</div></div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="outline" size="lg" onClick={prevSlide} disabled={currentSlide === 0}><ChevronLeft className="w-5 h-5 mr-2" />Previous</Button>
          <div className="flex items-center gap-2">{slides.map((_, index) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50"}`} />))}</div>
          <Button variant="outline" size="lg" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>Next<ChevronRight className="w-5 h-5 ml-2" /></Button>
        </div>
      </div>
      <div className="fixed bottom-24 right-8 z-40"><img src={logo} alt="Lifetrek" className="h-8 opacity-30" /></div>
    </div>
  );
};

export default PitchDeck;
