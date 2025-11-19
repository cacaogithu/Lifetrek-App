import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";

// Assets
import logo from "@/assets/logo-optimized.webp";
import isoLogo from "@/assets/certifications/iso.webp";
import anvisaLogo from "@/assets/certifications/anvisa.webp";
import cleanroomHero from "@/assets/facility/cleanroom-hero.webp";
import factoryExterior from "@/assets/facility/factory-exterior-hero.webp";
import receptionHero from "@/assets/facility/reception-hero.webp";

// Equipment
import citizenL20 from "@/assets/equipment/citizen-l20.webp";
import citizenM32 from "@/assets/equipment/citizen-m32.jpg";
import doosan from "@/assets/equipment/doosan.png";
import robodrill from "@/assets/equipment/robodrill.webp";
import walter from "@/assets/equipment/walter.webp";
import zeissContura from "@/assets/metrology/zeiss-contura.webp";
import opticalCNC from "@/assets/metrology/optical-cnc.webp";

// Products
import medicalScrew from "@/assets/products/medical-screw-hero.webp";
import dentalInstruments from "@/assets/products/dental-instruments-hero.webp";
import spinalImplants from "@/assets/products/spinal-implants-optimized.webp";
import surgicalDrills from "@/assets/products/surgical-drills-optimized.webp";
import orthopedicScrews from "@/assets/products/orthopedic-screws-optimized.webp";
import veterinaryImplant1 from "@/assets/products/veterinary-implant-1.jpg";
import dentalImplantsDiagram from "@/assets/products/dental-implants-diagram.webp";
import medicalImplantsDiagram from "@/assets/products/medical-implants-diagram-enhanced.webp";

// Clients
import cpmhLogo from "@/assets/clients/cpmh.webp";
import evolveLogo from "@/assets/clients/evolve.webp";
import fgmLogo from "@/assets/clients/fgm.webp";
import gmiLogo from "@/assets/clients/gmi.webp";
import hcsLogo from "@/assets/clients/hcs.webp";
import implanfixLogo from "@/assets/clients/implanfix.webp";
import medensLogo from "@/assets/clients/medens.webp";
import neoorthoLogo from "@/assets/clients/neoortho.webp";
import orthometricLogo from "@/assets/clients/orthometric.webp";
import traumecLogo from "@/assets/clients/traumec.webp";

const PitchDeck = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1 - Cover
    {
      id: 1,
      content: (
        <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary-dark text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/src/assets/facility/factory-hero-full.svg')] opacity-10 bg-cover bg-center" />
          <div className="z-10 text-center space-y-8 px-8 animate-in fade-in duration-700">
            <img src={logo} alt="Lifetrek Medical" className="h-24 mx-auto mb-12" />
            <h1 className="text-7xl font-bold mb-6 tracking-tight">
              Lifetrek Medical
            </h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <img src={isoLogo} alt="ISO 13485" className="h-16 bg-white/10 backdrop-blur-sm rounded-lg p-2" />
              <img src={anvisaLogo} alt="ANVISA" className="h-16 bg-white/10 backdrop-blur-sm rounded-lg p-2" />
            </div>
            <h2 className="text-3xl font-light max-w-4xl mx-auto leading-relaxed">
              Manufatura Contratada ISO 13485 para Implantes e Instrumentos Cirúrgicos
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Do CAD ao componente embalado em sala limpa, com qualidade zero-defeito e rastreabilidade regulatória completa.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 2 - Who We Serve
    {
      id: 2,
      content: (
        <div className="h-full w-full bg-background p-16">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <h2 className="text-5xl font-bold mb-12 text-foreground">Para Quem Fabricamos</h2>
            <div className="grid grid-cols-2 gap-12 flex-1">
              <div className="space-y-8">
                <div className="bg-card p-8 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <img src={orthopedicScrews} alt="Orthopedic" className="w-32 h-32 object-cover rounded-lg" />
                    <div>
                      <h3 className="text-2xl font-semibold mb-3 text-primary">OEMs de Implantes Ortopédicos</h3>
                      <p className="text-muted-foreground">Trauma, coluna, fixação e membros superiores/inferiores</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-8 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <img src={dentalImplantsDiagram} alt="Dental" className="w-32 h-32 object-cover rounded-lg" />
                    <div>
                      <h3 className="text-2xl font-semibold mb-3 text-primary">Fabricantes de Dispositivos Dentais</h3>
                      <p className="text-muted-foreground">Implantes, instrumentos de cirurgia oral e componentes protéticos</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-8 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <img src={veterinaryImplant1} alt="Veterinary" className="w-32 h-32 object-cover rounded-lg" />
                    <div>
                      <h3 className="text-2xl font-semibold mb-3 text-primary">Empresas de Implantes Veterinários</h3>
                      <p className="text-muted-foreground">Placas, parafusos e instrumentos adaptados para aplicações veterinárias</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-card p-8 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <img src={surgicalDrills} alt="Hospitals" className="w-32 h-32 object-cover rounded-lg" />
                    <div>
                      <h3 className="text-2xl font-semibold mb-3 text-primary">Hospitais e Sistemas de Saúde</h3>
                      <p className="text-muted-foreground">Instrumentos customizados e suporte para P&D</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-8 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <img src={medicalScrew} alt="OEM Partners" className="w-32 h-32 object-cover rounded-lg" />
                    <div>
                      <h3 className="text-2xl font-semibold mb-3 text-primary">Parceiros OEM / Contract Manufacturing</h3>
                      <p className="text-muted-foreground">Componentes de alta precisão para manufatura contratada</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-xl border-2 border-primary/30">
                  <p className="text-2xl font-semibold text-foreground leading-relaxed">
                    Se seu produto entra em um corpo humano ou animal, <span className="text-primary">nós fabricamos como se nossa própria vida dependesse disso.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 3 - The Problem
    {
      id: 3,
      content: (
        <div className="h-full w-full bg-gradient-to-br from-destructive/10 via-background to-background p-16">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
            <h2 className="text-5xl font-bold mb-8 text-foreground">O Problema</h2>
            <p className="text-2xl text-muted-foreground mb-12">Por que terceirizar usinagem tira seu sono à noite:</p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-xl border-l-4 border-destructive shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-destructive">❌ Qualidade Inconsistente</h3>
                <p className="text-lg text-muted-foreground">Validações fracassadas e lotes rejeitados que atrasam lançamentos</p>
              </div>
              
              <div className="bg-card p-8 rounded-xl border-l-4 border-destructive shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-destructive">❌ Sem ISO 13485</h3>
                <p className="text-lg text-muted-foreground">Fornecedores sem certificação ou experiência em dispositivos médicos</p>
              </div>
              
              <div className="bg-card p-8 rounded-xl border-l-4 border-destructive shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-destructive">❌ Documentação Fraca</h3>
                <p className="text-lg text-muted-foreground">Rastreabilidade inadequada que compromete auditorias regulatórias</p>
              </div>
              
              <div className="bg-card p-8 rounded-xl border-l-4 border-destructive shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-destructive">❌ Prototipagem Lenta</h3>
                <p className="text-lg text-muted-foreground">Atrasos em lançamentos por controle de mudanças ineficiente</p>
              </div>
              
              <div className="bg-card p-8 rounded-xl border-l-4 border-destructive shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-destructive">❌ Risco de Contaminação</h3>
                <p className="text-lg text-muted-foreground">Sem sala limpa ou embalagem apropriada para dispositivos médicos</p>
              </div>
              
              <div className="bg-gradient-to-br from-destructive/20 to-destructive/10 p-8 rounded-xl border-2 border-destructive">
                <h3 className="text-2xl font-bold mb-4 text-destructive">⚠️ Um lote ruim = </h3>
                <p className="text-lg font-semibold">Recalls, perda de receita e dano à marca.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4 - Our Promise
    {
      id: 4,
      content: (
        <div className="h-full w-full bg-gradient-to-br from-primary/5 via-background to-background p-16">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
            <div className="text-center mb-12">
              <h2 className="text-6xl font-bold mb-6 text-foreground">Nossa Promessa</h2>
              <p className="text-3xl text-primary font-semibold">Lifetrek Medical = Manufatura "Sem Surpresas"</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="bg-card p-10 rounded-xl border-l-4 border-primary shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">🎯</div>
                  <h3 className="text-2xl font-semibold text-primary">Foco Exclusivo em Médico</h3>
                </div>
                <p className="text-lg text-muted-foreground">30+ anos especializados em implantes e componentes cirúrgicos</p>
              </div>
              
              <div className="bg-card p-10 rounded-xl border-l-4 border-primary shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <img src={isoLogo} alt="ISO" className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary">QMS Certificado</h3>
                </div>
                <p className="text-lg text-muted-foreground">ISO 13485 para design, usinagem e embalagem em sala limpa</p>
              </div>
              
              <div className="bg-card p-10 rounded-xl border-l-4 border-primary shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">🔬</div>
                  <h3 className="text-2xl font-semibold text-primary">Mentalidade Zero-Defeito</h3>
                </div>
                <p className="text-lg text-muted-foreground">Metrologia avançada e inspeção 100% em features críticas</p>
              </div>
              
              <div className="bg-card p-10 rounded-xl border-l-4 border-primary shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">📋</div>
                  <h3 className="text-2xl font-semibold text-primary">Pronto para Auditoria</h3>
                </div>
                <p className="text-lg text-muted-foreground">Histórico completo do dispositivo e rastreabilidade de material desde o dia um</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary-dark p-12 rounded-2xl text-white text-center shadow-2xl">
              <p className="text-3xl font-bold leading-relaxed">
                Nosso objetivo: ser a opção óbvia "categoria-de-um" na sua cabeça,<br />
                não apenas mais uma usinagem.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5 - What We Make
    {
      id: 5,
      content: (
        <div className="h-full w-full bg-background p-16">
          <div className="max-w-7xl mx-auto h-full">
            <h2 className="text-5xl font-bold mb-12 text-foreground text-center">O Que Fabricamos</h2>
            
            <div className="grid grid-cols-2 gap-8 h-[calc(100%-8rem)]">
              <div className="space-y-6">
                <div className="bg-card rounded-xl overflow-hidden border border-border shadow-xl hover:shadow-2xl transition-all h-[calc(50%-12px)]">
                  <div className="h-48 overflow-hidden">
                    <img src={medicalImplantsDiagram} alt="Orthopedics" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-3xl font-bold mb-3 text-primary">Ortopedia</h3>
                    <p className="text-lg text-muted-foreground">
                      Placas e parafusos para trauma, sistemas de fusão espinal, implantes de membros superiores/inferiores, fixação craniana
                    </p>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl overflow-hidden border border-border shadow-xl hover:shadow-2xl transition-all h-[calc(50%-12px)]">
                  <div className="h-48 overflow-hidden">
                    <img src={dentalInstruments} alt="Surgical" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-3xl font-bold mb-3 text-primary">Instrumentos Cirúrgicos</h3>
                    <p className="text-lg text-muted-foreground">
                      Brocas, alargadores, machos, guias de corte, instrumentos customizados
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-xl overflow-hidden border border-border shadow-xl hover:shadow-2xl transition-all h-[calc(50%-12px)]">
                  <div className="h-48 overflow-hidden">
                    <img src={dentalImplantsDiagram} alt="Dental" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-3xl font-bold mb-3 text-primary">Dental</h3>
                    <p className="text-lg text-muted-foreground">
                      Implantes de titânio, pilares, kits cirúrgicos, brocas para osso
                    </p>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl overflow-hidden border border-border shadow-xl hover:shadow-2xl transition-all h-[calc(50%-12px)]">
                  <div className="h-48 overflow-hidden">
                    <img src={veterinaryImplant1} alt="Veterinary" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-3xl font-bold mb-3 text-primary">Veterinário</h3>
                    <p className="text-lg text-muted-foreground">
                      Placas, parafusos e instrumentos adaptados para aplicações veterinárias
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 6 - How We Do It
    {
      id: 6,
      content: (
        <div className="h-full w-full bg-gradient-to-br from-background via-primary/5 to-background p-16">
          <div className="max-w-7xl mx-auto h-full">
            <h2 className="text-5xl font-bold mb-8 text-foreground text-center">Como Fazemos</h2>
            <p className="text-2xl text-center text-muted-foreground mb-12">
              Do desenho às peças prontas para esterilização em 6 etapas controladas
            </p>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-card p-8 rounded-xl border-t-4 border-primary shadow-xl">
                <div className="text-5xl font-bold text-primary mb-4">01</div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">DFM & Análise de Risco</h3>
                <p className="text-lg text-muted-foreground">CAD/CAM, FMEA e validação de processo</p>
              </div>
              
              <div className="bg-card p-8 rounded-xl border-t-4 border-primary shadow-xl">
                <div className="text-5xl font-bold text-primary mb-4">02</div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Usinagem CNC</h3>
                <p className="text-lg text-muted-foreground">Tipo suíço, multi-eixos, Ø 0.5–32 mm</p>
                <img src={citizenL20} alt="CNC" className="w-full h-32 object-cover rounded-lg mt-4" />
              </div>
              
              <div className="bg-card p-8 rounded-xl border-t-4 border-primary shadow-xl">
                <div className="text-5xl font-bold text-primary mb-4">03</div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Acabamento Superficial</h3>
                <p className="text-lg text-muted-foreground">Eletropolimento, passivação, acabamento espelho</p>
              </div>
              
              <div className="bg-card p-8 rounded-xl border-t-4 border-primary shadow-xl">
                <div className="text-5xl font-bold text-primary mb-4">04</div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Metrologia & Documentação</h3>
                <p className="text-lg text-muted-foreground">CMM, ótico, registros completos</p>
                <img src={zeissContura} alt="CMM" className="w-full h-32 object-cover rounded-lg mt-4" />
              </div>
              
              <div className="bg-card p-8 rounded-xl border-t-4 border-primary shadow-xl">
                <div className="text-5xl font-bold text-primary mb-4">05</div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Embalagem ISO 7</h3>
                <p className="text-lg text-muted-foreground">Sala limpa classe ISO 7</p>
                <img src={cleanroomHero} alt="Cleanroom" className="w-full h-32 object-cover rounded-lg mt-4" />
              </div>
              
              <div className="bg-card p-8 rounded-xl border-t-4 border-primary shadow-xl">
                <div className="text-5xl font-bold text-primary mb-4">06</div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Liberação Final</h3>
                <p className="text-lg text-muted-foreground">Sob ISO 13485 com rastreabilidade total</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 7 - Infrastructure
    {
      id: 7,
      content: (
        <div className="h-full w-full bg-background p-16">
          <div className="max-w-7xl mx-auto h-full">
            <h2 className="text-5xl font-bold mb-12 text-foreground text-center">
              Infraestrutura Que Reduz o Risco do Seu Lançamento
            </h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-card p-8 rounded-xl border border-border shadow-xl">
                <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-3">
                  <span className="text-3xl">🏭</span> Parque CNC
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <img src={citizenL20} alt="Citizen" className="w-full h-24 object-cover rounded-lg" />
                  <img src={doosan} alt="Doosan" className="w-full h-24 object-cover rounded-lg" />
                  <img src={robodrill} alt="Robodrill" className="w-full h-24 object-cover rounded-lg" />
                </div>
                <p className="text-muted-foreground mt-4">Citizen, Tornos, Doosan, Walter, FANUC Robodrill</p>
              </div>
              
              <div className="bg-card p-8 rounded-xl border border-border shadow-xl">
                <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-3">
                  <span className="text-3xl">🔬</span> Laboratório de Metrologia
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <img src={zeissContura} alt="ZEISS" className="w-full h-24 object-cover rounded-lg" />
                  <img src={opticalCNC} alt="Optical" className="w-full h-24 object-cover rounded-lg" />
                </div>
                <p className="text-muted-foreground mt-4">CMM ZEISS, inspeção ótica, dureza e verificações superficiais</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-xl border border-border shadow-xl">
                <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-3">
                  <span className="text-3xl">🏥</span> Salas Limpas ISO 7
                </h3>
                <img src={cleanroomHero} alt="Cleanroom" className="w-full h-40 object-cover rounded-lg mb-4" />
                <p className="text-muted-foreground">Duas salas limpas ISO 7 (60 m² cada)</p>
              </div>
              
              <div className="bg-card p-8 rounded-xl border border-border shadow-xl">
                <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-3">
                  <span className="text-3xl">📋</span> Certificação e Rastreabilidade
                </h3>
                <img src={isoLogo} alt="ISO" className="h-24 mx-auto mb-4" />
                <p className="text-muted-foreground">Certificação completa de material e rastreabilidade de lote</p>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-xl border-l-4 border-primary">
              <p className="text-2xl font-semibold text-foreground text-center">
                Você fornece o design. <span className="text-primary">Nós fornecemos produção estável e validada.</span>
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 8 - Proof & Clients
    {
      id: 8,
      content: (
        <div className="h-full w-full bg-gradient-to-br from-background via-primary/5 to-background p-16">
          <div className="max-w-7xl mx-auto h-full">
            <h2 className="text-5xl font-bold mb-12 text-foreground text-center">
              Confiança de Marcas Líderes em Dispositivos Médicos
            </h2>
            
            <div className="grid grid-cols-5 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={traumecLogo} alt="Traumec" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={orthometricLogo} alt="Orthometric" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={evolveLogo} alt="Evolve" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={fgmLogo} alt="FGM" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={gmiLogo} alt="GMI" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={hcsLogo} alt="HCS" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={implanfixLogo} alt="Implanfix" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={medensLogo} alt="Medens" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={neoorthoLogo} alt="Neoortho" className="w-full h-16 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                <img src={cpmhLogo} alt="CPMH" className="w-full h-16 object-contain" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="bg-card p-10 rounded-xl border-l-4 border-primary shadow-xl text-center">
                <div className="text-6xl font-bold text-primary mb-4">30+</div>
                <p className="text-xl text-muted-foreground">Clientes médicos atendidos</p>
              </div>
              
              <div className="bg-card p-10 rounded-xl border-l-4 border-primary shadow-xl text-center">
                <div className="text-6xl font-bold text-primary mb-4">15+</div>
                <p className="text-xl text-muted-foreground">Anos de parcerias OEM de longo prazo</p>
              </div>
              
              <div className="bg-card p-10 rounded-xl border-l-4 border-primary shadow-xl text-center">
                <div className="text-6xl font-bold text-primary mb-4">Zero</div>
                <p className="text-xl text-muted-foreground">Não-conformidades maiores em auditorias ISO 13485 externas</p>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-primary via-primary/90 to-primary-dark p-10 rounded-2xl text-white text-center shadow-2xl">
              <p className="text-3xl font-bold">
                Provas {'>'} Promessas
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 9 - Low Risk Start
    {
      id: 9,
      content: (
        <div className="h-full w-full bg-gradient-to-br from-primary/5 via-background to-background p-16">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
            <h2 className="text-5xl font-bold mb-8 text-foreground text-center">
              Comece com Baixo Risco: Célula Piloto de Manufatura
            </h2>
            
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-8">
                <div className="bg-card p-8 rounded-xl border-l-4 border-primary shadow-xl">
                  <h3 className="text-3xl font-semibold mb-4 text-primary">O Que Inclui:</h3>
                  <ul className="space-y-4 text-lg text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-primary text-2xl">✓</span>
                      <span>1–3 componentes críticos do seu projeto</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary text-2xl">✓</span>
                      <span>Processo completo: usinagem, acabamento, metrologia, embalagem em sala limpa</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary text-2xl">✓</span>
                      <span>Conjunto completo de documentação para seu dossiê regulatório</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-xl border-2 border-primary/30">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">Garantia de Satisfação:</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Se não atendermos suas especificações técnicas e de qualidade no piloto, você sai com toda a documentação, relatórios de medição e lições aprendidas para seu processo interno.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <img src={factoryExterior} alt="Factory" className="w-full h-64 object-cover rounded-xl shadow-2xl mb-8" />
                <img src={receptionHero} alt="Reception" className="w-full h-64 object-cover rounded-xl shadow-2xl" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary-dark p-12 rounded-2xl text-white text-center shadow-2xl">
              <p className="text-3xl font-bold leading-relaxed">
                Este é seu primeiro passo sem risco:<br />
                <span className="text-white/90">Alto valor para você, baixo compromisso, vitória claramente definida.</span>
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 10 - Next Steps
    {
      id: 10,
      content: (
        <div className="h-full w-full bg-gradient-to-br from-primary via-primary/90 to-primary-dark text-white p-16">
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
            <h2 className="text-6xl font-bold mb-16 text-center">Próximos Passos</h2>
            
            <div className="grid grid-cols-4 gap-8 mb-16">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all">
                <div className="text-6xl font-bold mb-4">01</div>
                <h3 className="text-2xl font-semibold mb-3">NDA</h3>
                <p className="text-white/80">Assinamos acordo de confidencialidade</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all">
                <div className="text-6xl font-bold mb-4">02</div>
                <h3 className="text-2xl font-semibold mb-3">Compartilhe</h3>
                <p className="text-white/80">Desenhos + volumes + requisitos</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all">
                <div className="text-6xl font-bold mb-4">03</div>
                <h3 className="text-2xl font-semibold mb-3">DFM + Cotação</h3>
                <p className="text-white/80">Análise e orçamento em dias úteis</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all">
                <div className="text-6xl font-bold mb-4">04</div>
                <h3 className="text-2xl font-semibold mb-3">Piloto → Série</h3>
                <p className="text-white/80">Aprove piloto e escale para produção seriada</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-16 rounded-2xl border-2 border-white/30 text-center">
              <p className="text-4xl font-bold mb-8 leading-relaxed">
                "Vamos revisar um projeto atual ou futuro e ver se<br />
                podemos reduzir o risco do seu cronograma e qualidade."
              </p>
              
              <div className="flex gap-6 justify-center mt-12">
                <div className="text-left">
                  <p className="text-xl font-semibold mb-2">Contato:</p>
                  <p className="text-white/90">contato@lifetrekmedical.com</p>
                  <p className="text-white/90">+55 (47) 3025-2828</p>
                </div>
                <div className="text-left">
                  <p className="text-xl font-semibold mb-2">Endereço:</p>
                  <p className="text-white/90">Joinville, SC - Brasil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Slide Content */}
      <div className="w-full h-full transition-all duration-500 ease-in-out">
        {slides[currentSlide].content}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-background/80 backdrop-blur-sm px-8 py-4 rounded-full border border-border shadow-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="hover:bg-primary/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <span className="text-sm text-muted-foreground font-medium min-w-[4rem] text-center">
          {currentSlide + 1} / {slides.length}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="hover:bg-primary/10"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Top Bar Actions */}
      <div className="absolute top-8 right-8 flex gap-4">
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
        <Button variant="default" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Baixar PDF
        </Button>
      </div>

      {/* Logo Corner */}
      <div className="absolute top-8 left-8">
        <img src={logo} alt="Lifetrek Medical" className="h-12" />
      </div>
    </div>
  );
};

export default PitchDeck;
