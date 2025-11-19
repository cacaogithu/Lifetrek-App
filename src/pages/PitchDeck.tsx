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
  Bone,
  Scissors,
  Smile,
  PawPrint,
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

// Glass Card Component
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-background/60 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 ${className}`}>
    {children}
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
    // Slide 1 - Cover Premium
    {
      id: 1,
      content: (
        <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${factoryHeroFull})` }} />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/75 to-primary-dark/90" />
          <div className="relative z-10 text-center space-y-8 px-16 max-w-7xl animate-in fade-in duration-700">
            <img src={logo} alt="Lifetrek Medical" className="h-32 mx-auto mb-8 drop-shadow-2xl" />
            <h1 className="text-7xl font-bold mb-6 tracking-tight text-white">Lifetrek Medical</h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <img src={isoLogo} alt="ISO 13485" className="h-12" />
              </div>
            </div>
            <h2 className="text-3xl font-light max-w-4xl mx-auto leading-relaxed text-white">
              Manufatura Contratada ISO 13485 para Implantes e Instrumentos Cirúrgicos
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Do CAD ao componente embalado em sala limpa, com qualidade zero-defeito e rastreabilidade regulatória completa.
            </p>
            <div className="w-full max-w-md mx-auto h-0.5 bg-gradient-to-r from-transparent via-accent-orange/30 to-transparent mt-12" />
          </div>
        </div>
      ),
    },
    // Slide 2 - Para Quem Fabricamos
    {
      id: 2,
      content: (
        <div className="relative h-full w-full bg-background overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${cleanroomHero})` }} />
          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-16 text-foreground">Para Quem Fabricamos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-8">
                {[
                  { title: "OEMs de Implantes Ortopédicos", desc: "Trauma, coluna, extremidades superiores e inferiores" },
                  { title: "Fabricantes de Dispositivos Dentais", desc: "Implantes, instrumentos e componentes protéticos" },
                  { title: "Empresas de Implantes Veterinários", desc: "Dispositivos ortopédicos para animais de grande e pequeno porte" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Check className="text-accent-orange w-8 h-8 mt-1 flex-shrink-0" />
                    <div><h3 className="text-2xl font-semibold mb-2 text-foreground">{item.title}</h3><p className="text-lg text-muted-foreground">{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="space-y-8">
                {[
                  { title: "Hospitais e Sistemas de Saúde", desc: "Instrumentos cirúrgicos customizados e ferramentas específicas" },
                  { title: "Parceiros OEM / Contract Manufacturing", desc: "Empresas que precisam de capacidade de manufatura certificada ISO 13485" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Check className="text-accent-orange w-8 h-8 mt-1 flex-shrink-0" />
                    <div><h3 className="text-2xl font-semibold mb-2 text-foreground">{item.title}</h3><p className="text-lg text-muted-foreground">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-8 border-l-4 border-primary">
              <p className="text-3xl font-semibold text-foreground leading-relaxed">
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
        <div className="h-full w-full bg-gradient-to-br from-secondary/30 via-background to-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 text-foreground">O Problema</h2>
            <p className="text-2xl text-muted-foreground mb-16">Por que terceirizar usinagem tira seu sono à noite:</p>
            <div className="grid grid-cols-2 gap-8">
              {[
                { Icon: AlertTriangle, title: "Qualidade Inconsistente", desc: "Tolerâncias que \"variam\" entre lotes, causando recalls e custos ocultos de retrabalho." },
                { Icon: FileX, title: "Documentação Fraca", desc: "Falta de rastreabilidade lote-a-lote e registros auditáveis para reguladores." },
                { Icon: Clock, title: "Atrasos em Lançamentos", desc: "Lead times imprevisíveis que atrasam estudos clínicos e aprovações de mercado." },
                { Icon: Shield, title: "Riscos de Contaminação", desc: "Oficinas sem ambiente controlado que comprometem a esterilidade do produto final." },
                { Icon: FileX, title: "Fornecedores sem ISO 13485", desc: "Parceiros que não entendem requisitos médicos e não têm sistemas de qualidade certificados." },
                { Icon: AlertTriangle, title: "Um Lote Ruim = Dano Permanente", desc: "Reputação destruída, confiança de médicos perdida e processos legais custosos." }
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300">
                  <item.Icon className="w-12 h-12 text-foreground/70 mb-4" />
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
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
        <div className="relative h-full w-full bg-background overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.08]" style={{ backgroundImage: `url(${labOverview})` }} />
          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Nossa Promessa</h2>
            <p className="text-3xl font-light text-muted-foreground mb-16">Lifetrek Medical = Manufatura "sem surpresas"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-l-2 border-accent-orange/20 pl-8">
              {[
                { Icon: Target, color: "text-primary", title: "Foco Exclusivo Médico", desc: "30+ anos exclusivamente em implantes e instrumentos cirúrgicos. Não fazemos automotive, aerospace ou consumer. Apenas medical." },
                { Icon: CheckCircle, color: "text-accent", title: "QMS Certificado", desc: "ISO 13485:2016 completo, com auditorias anuais. Sistemas de qualidade que funcionam de verdade, não apenas documentos na gaveta." },
                { Icon: Microscope, color: "text-primary", title: "Mentalidade Zero-Defeito", desc: "CMM ZEISS 3D, inspeção óptica automatizada, análise de dureza e rugosidade. Medimos tudo, documentamos tudo." },
                { Icon: Shield, color: "text-accent", title: "Audit-Ready Day One", desc: "Rastreabilidade completa desde matéria-prima até embalagem final. Seus auditores vão adorar nossos arquivos." }
              ].map((item, i) => (
                <GlassCard key={i} className="p-10">
                  <item.Icon className={`w-16 h-16 ${item.color} mb-6`} />
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
        <div className="h-full w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-16 text-foreground">O Que Fazemos</h2>
            <div className="grid grid-cols-2 gap-8">
              {[
                { Icon: Bone, bg: medicalScrew, title: "Implantes Ortopédicos", desc: "Placas e parafusos de trauma, sistemas de fusão espinhal, implantes de membros superiores/inferiores, fixação craniana." },
                { Icon: Scissors, bg: surgicalDrills, title: "Instrumentos Cirúrgicos", desc: "Brocas, fresas, alargadores, guides de perfuração, instrumentais para cirurgias complexas e ferramentas customizadas." },
                { Icon: Smile, bg: dentalInstruments, title: "Dispositivos Dentais", desc: "Implantes dentários, pilares protéticos (angulados e retos), componentes para sistemas de fixação e instrumentos específicos." },
                { Icon: PawPrint, bg: veterinaryImplant1, title: "Implantes Veterinários", desc: "Dispositivos ortopédicos para animais de grande e pequeno porte, placas, parafusos e sistemas de fixação veterinários." }
              ].map((item, i) => (
                <GlassCard key={i} className="p-10 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center opacity-[0.05]" style={{ backgroundImage: `url(${item.bg})` }} />
                  <item.Icon className="relative z-10 w-16 h-16 text-primary group-hover:text-accent-orange transition-colors duration-300 mb-6" />
                  <h3 className="relative z-10 text-3xl font-bold mb-4 text-foreground">{item.title}</h3>
                  <p className="relative z-10 text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 6 - Como Fazemos
    {
      id: 6,
      content: (
        <div className="h-full w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 text-foreground">Como Fazemos</h2>
            <p className="text-2xl text-muted-foreground mb-12">Do desenho a componentes sterile-ready em 6 etapas controladas:</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8 border-l-2 border-primary/30 pl-8">
                {[
                  { title: "DFM & Análise de Risco", desc: "CAD/CAM review, FMEA de processo, identificação de pontos críticos", accent: false },
                  { title: "Usinagem CNC", desc: "Swiss-type tornos, multi-axis, com controle estatístico de processo", accent: false },
                  { title: "Tratamento Térmico", desc: "Fornos controlados com rastreabilidade de ciclos e certificados", accent: false },
                  { title: "Acabamento Superficial", desc: "Electropolish, passivação, inspeção visual 100%", accent: false },
                  { title: "Metrologia Avançada", desc: "CMM 3D, inspeção óptica, dureza, rugosidade - tudo documentado", accent: false },
                  { title: "Embalagem Cleanroom ISO 7", desc: "60m² de salas limpas, componentes prontos para esterilização", accent: true }
                ].map((item, i) => (
                  <div key={i} className={`flex items-start gap-6 ${item.accent ? 'border-l-2 border-accent -ml-[2px] pl-[30px]' : ''}`}>
                    <div className={`${item.accent ? 'bg-accent text-background' : 'bg-primary text-primary-foreground'} rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0`}>{i + 1}</div>
                    <div><h3 className="text-2xl font-bold mb-2 text-foreground">{item.title}</h3><p className="text-lg text-muted-foreground">{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { img: citizenL20, name: "Citizen Swiss" },
                  { img: doosanNew, name: "Doosan Multi-axis" },
                  { img: robodrill, name: "FANUC Robodrill" },
                  { img: zeissContura, name: "ZEISS CMM" },
                  { img: electropolishLine, name: "Electropolish" },
                  { img: laserMarking, name: "Laser Marking" }
                ].map((item, i) => (
                  <div key={i} className="bg-card rounded-xl p-3 hover:scale-105 transition-transform">
                    <img src={item.img} alt={item.name} className="w-full h-20 object-contain mb-2" />
                    <p className="text-xs text-center text-muted-foreground">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 7 - Infraestrutura
    {
      id: 7,
      content: (
        <div className="h-full w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-16 text-foreground">Infraestrutura Que Reduz Risco</h2>
            <div className="space-y-8">
              <GlassCard className="p-8">
                <h3 className="text-3xl font-bold mb-6 text-foreground border-l-4 border-primary pl-4">Parque CNC (15+ máquinas)</h3>
                <div className="grid grid-cols-2 gap-8">
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    {["Citizen Swiss-type (L20, L32, M32)", "Tornos GT26 e GT13", "Doosan Multi-axis (4 e 5 eixos)"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2"><Check className="text-accent w-5 h-5" />{item}</li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-3 gap-3">
                    {[citizenL20, citizenM32, doosanNew].map((img, i) => (
                      <img key={i} src={img} alt="Equipment" className="w-full h-16 object-contain rounded-lg bg-card p-2" />
                    ))}
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-8">
                <h3 className="text-3xl font-bold mb-6 text-foreground border-l-4 border-primary pl-4">Laboratório de Metrologia (100m²)</h3>
                <div className="grid grid-cols-2 gap-8">
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    {["CMM ZEISS Contura (precisão 0.001mm)", "Inspeção Óptica CNC e Manual", "Dureza Vickers, Rugosidade, Metalografia"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2"><Check className="text-accent w-5 h-5" />{item}</li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-2 gap-3">
                    {[zeissContura, opticalCNC].map((img, i) => (
                      <img key={i} src={img} alt="Equipment" className="w-full h-16 object-contain rounded-lg bg-card p-2" />
                    ))}
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-8">
                <h3 className="text-3xl font-bold mb-6 text-foreground border-l-4 border-accent pl-4">Duas Salas Limpas ISO 7 (120m² total)</h3>
                <div className="grid grid-cols-2 gap-8 items-center">
                  <p className="text-lg text-muted-foreground leading-relaxed">Monitoramento contínuo de partículas, controle de temperatura e umidade, acesso controlado com paramentação completa. Embalagem final em ambiente sterile-ready.</p>
                  <img src={cleanroomHero} alt="Cleanroom" className="w-full h-48 object-cover rounded-xl shadow-lg" />
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 8 - Clientes
    {
      id: 8,
      content: (
        <div className="relative h-full w-full bg-background overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.05]" style={{ backgroundImage: `url(${factoryExterior})` }} />
          <div className="relative z-10 max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-8 text-foreground">Confiança de Líderes do Mercado</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-8 mb-12">
              {clientLogos.map((logo, index) => (
                <div key={index} className="flex items-center justify-center">
                  <img src={logo.src} alt={logo.name} className="h-12 w-auto object-contain filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 mix-blend-multiply" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-8 mt-8">
              {[
                { num: "30+", label: "Clientes Médicos Ativos", color: "text-primary" },
                { num: "15+", label: "Anos de Parcerias OEM", color: "text-primary" },
                { num: "Zero", label: "Não-conformidades Maiores", color: "text-accent" }
              ].map((item, i) => (
                <GlassCard key={i} className="p-8 text-center">
                  <div className={`text-5xl font-bold ${item.color} mb-2`}>{item.num}</div>
                  <p className="text-lg text-muted-foreground">{item.label}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // Slide 9 - Low-Risk Start
    {
      id: 9,
      content: (
        <div className="h-full w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-6 text-foreground">Comece com Baixo Risco</h2>
            <h3 className="text-4xl text-primary mb-12">Célula Piloto de Manufatura</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                {[
                  { title: "1-3 componentes críticos", desc: "Escolha as peças mais desafiadoras do seu portfólio" },
                  { title: "Processo completo", desc: "Usinagem → acabamento → metrologia → embalagem cleanroom" },
                  { title: "Documentação completa", desc: "Toda documentação para seu arquivo regulatório (DHF/DMR)" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Check className="text-accent w-8 h-8 mt-1 flex-shrink-0" />
                    <div><h4 className="text-2xl font-bold mb-2 text-foreground">{item.title}</h4><p className="text-lg text-muted-foreground">{item.desc}</p></div>
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
              <button className="bg-primary hover:bg-primary-hover text-primary-foreground text-2xl font-bold px-12 py-6 rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-105 transition-all duration-300 border-2 border-accent-orange/20 flex items-center gap-3">
                Agendar Consulta<ArrowRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      ),
    },
    // Slide 10 - Próximos Passos
    {
      id: 10,
      content: (
        <div className="h-full w-full bg-background">
          <div className="max-w-7xl mx-auto px-16 py-16 h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-16 text-foreground">Próximos Passos</h2>
            <div className="space-y-12 mb-16">
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
