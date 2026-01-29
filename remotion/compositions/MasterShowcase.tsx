import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// Brand colors from BRAND_BOOK.md
const BRAND = {
  corporateBlue: "#004F8F",
  corporateBlueHover: "#003D75",
  innovationGreen: "#1A7A3E",
  energyOrange: "#F07818",
  textPrimary: "#1a2332",
  textLight: "#F8FAFC",
  backgroundDark: "#0a0d12",
  backgroundDarkAlt: "#0a1628",
};

// Assets - Images
import citizenCnc from "../../src/assets/equipment/citizen-l32.webp";
import citizenNew from "../../src/assets/equipment/citizen-new.png";
import citizenL20 from "../../src/assets/equipment/citizen-l20-new.png";
import tornosGt26 from "../../src/assets/equipment/tornos-gt26.webp";
import doosan from "../../src/assets/equipment/doosan-new.png";
import robodrill from "../../src/assets/equipment/robodrill.webp";
import walter from "../../src/assets/equipment/walter.webp";
import laserMarking from "../../src/assets/equipment/laser-marking.webp";
import electropolish from "../../src/assets/equipment/electropolish-line.webp";
import electropolishNew from "../../src/assets/equipment/electropolish-line-new.png";
import receptionHero from "../../src/assets/facility/reception-hero.webp";
import cleanroomHero from "../../src/assets/facility/cleanroom.webp";
import cleanroomHeroAlt from "../../src/assets/facility/cleanroom-hero.webp";
import cleanroomCorridor from "../../src/assets/facility/cleanroom.webp";
import cleanroomWide from "../../src/assets/facility/cleanroom-hero.webp";
import cleanroomEntrance from "../../src/assets/facility/reception-hero.webp";
import exteriorHero from "../../src/assets/facility/exterior-hero.webp";
import labOverview from "../../src/assets/metrology/lab-overview.webp";
import zeissContura from "../../src/assets/metrology/zeiss-contura-new.png";
import anvisaBadge from "../../src/assets/certifications/anvisa.webp";
import isoBadge from "../../src/assets/certifications/iso.webp";
import surgicalInstruments from "../../src/assets/products/surgical-instruments-new.webp";
import orthopedicScrews from "../../src/assets/products/orthopedic-screws-optimized.webp";
import spinalImplants from "../../src/assets/products/spinal-implants-optimized.webp";
import logoImg from "../../src/assets/logo.png";

// Client logos
import cpmh from "../../src/assets/clients/cpmh-new.png";
import evolve from "../../src/assets/clients/evolve-new.png";
import fgm from "../../src/assets/clients/fgm-new.png";
import gmi from "../../src/assets/clients/gmi-new.png";
import hcs from "../../src/assets/clients/hcs-new.png";
import impol from "../../src/assets/clients/impol-new.png";
import implanfix from "../../src/assets/clients/implanfix-new.png";
import iol from "../../src/assets/clients/iol-new.png";
import neoortho from "../../src/assets/clients/neoortho-new.jpg";
import orthometric from "../../src/assets/clients/orthometric-new.png";
import traumec from "../../src/assets/clients/traumec-new.png";
import vincula from "../../src/assets/clients/vincula-new.png";

const VIDEO_FPS = 30;

// B-roll video paths
const droneRiseVideo = staticFile("remotion/broll/broll-01-drone-rise.mp4");
const facadePushVideo = staticFile("remotion/broll/broll-02-facade-push.mp4");
const cleanroomVideo = staticFile("remotion/broll/broll-03-cleanroom.mp4");
const cncVideo = staticFile("remotion/broll/broll-04-cnc.mp4");
const metrologyVideo = staticFile("remotion/broll/broll-05-metrology.mp4");
const electropolishVideo = staticFile("remotion/broll/broll-06-electropolish.mp4");
const laserVideo = staticFile("remotion/broll/broll-07-laser.mp4");

// Audio paths
const voiceoverAudio = staticFile("remotion/voiceover.mp3");
const backgroundMusic = staticFile("remotion/background-music.mp3");

type MasterShowcaseProps = {
  useBroll?: boolean;
  useVoiceover?: boolean;
  useMusic?: boolean;
  imageOverrides?: Record<string, string>;
};

type SlideItem = {
  id: string;
  kind: "image" | "video" | "solid" | "carousel" | "clients" | "stats" | "logo-final" | "cleanroom-carousel";
  src: string;
  title: string;
  subtitle: string;
  durationInFrames: number;
  badgeSrc?: string;
  badgeSrc2?: string;
  cropVideoBottom?: boolean;
  backgroundColor?: string;
  carouselImages?: string[];
};

// Machine images for carousel
const MACHINE_CAROUSEL_IMAGES = [
  citizenNew,
  citizenL20,
  tornosGt26,
  doosan,
  robodrill,
  walter,
];

// Cleanroom images for premium carousel
const CLEANROOM_CAROUSEL_IMAGES = [
  cleanroomWide,      // Wide shot with stainless steel tables
  cleanroomCorridor,  // Corridor perspective
  cleanroomEntrance,  // Entrance with glass door
];

// Client logos for parade
const CLIENT_LOGOS = [
  cpmh, evolve, fgm, gmi, hcs, impol,
  implanfix, iol, neoortho, orthometric, traumec, vincula,
];

// Premium slide configuration - Storytelling version (~85s)
const createSlides = (useBroll: boolean): SlideItem[] => [
  // CENA 1 - Drone / Vista aérea (8s)
  // VO: "Do lado de fora, parece apenas mais uma fábrica..."
  {
    id: "scene-1a-drone",
    kind: useBroll ? "video" : "image",
    src: useBroll ? droneRiseVideo : exteriorHero,
    title: "Cada micrômetro importa",
    subtitle: "Um desvio mínimo pode significar uma cirurgia de revisão",
    durationInFrames: VIDEO_FPS * 5,
  },
  {
    id: "scene-1b-facade",
    kind: useBroll ? "video" : "image",
    src: useBroll ? facadePushVideo : receptionHero,
    title: "",
    subtitle: "",
    durationInFrames: VIDEO_FPS * 3,
  },

  // CENA 2 - Recepção / Stats (7s)
  // VO: "Há mais de 30 anos, a Lifetrek Medical transforma..."
  {
    id: "scene-2a-reception",
    kind: "image",
    src: receptionHero,
    title: "Lifetrek Medical",
    subtitle: "30+ anos transformando precisão em segurança",
    durationInFrames: VIDEO_FPS * 4,
  },
  {
    id: "scene-2b-stats",
    kind: "stats",
    src: "",
    title: "",
    subtitle: "",
    durationInFrames: VIDEO_FPS * 3,
    backgroundColor: BRAND.corporateBlue,
  },

  // CENA 3 - Salas limpas (8s)
  // VO: "Somos certificados ISO 13485 e aprovados pela ANVISA..."
  {
    id: "scene-3a-cleanroom",
    kind: "cleanroom-carousel",
    src: "",
    title: "ISO 13485 • ANVISA",
    subtitle: "Não é só selo em parede",
    durationInFrames: VIDEO_FPS * 5,
    badgeSrc: isoBadge,
    badgeSrc2: anvisaBadge,
    carouselImages: CLEANROOM_CAROUSEL_IMAGES,
  },
  {
    id: "scene-3b-cleanroom-detail",
    kind: "image",
    src: cleanroomCorridor,
    title: "Salas limpas ISO 7",
    subtitle: "Rastreabilidade • Controle • Consistência",
    durationInFrames: VIDEO_FPS * 3,
  },

  // CENA 4 - CNC / Máquinas (10s)
  // VO: "Em células CNC de última geração, usinamos titânio..."
  {
    id: "scene-4a-cnc",
    kind: useBroll ? "video" : "image",
    src: useBroll ? cncVideo : citizenCnc,
    title: "Tolerâncias de mícron",
    subtitle: "Titânio, PEEK e ligas especiais",
    durationInFrames: VIDEO_FPS * 4,
  },
  {
    id: "scene-4b-carousel",
    kind: "carousel",
    src: "",
    title: "Tecnologia CNC de última geração",
    subtitle: "Citizen • Tornos • Doosan • Fanuc",
    durationInFrames: VIDEO_FPS * 6,
    backgroundColor: BRAND.backgroundDarkAlt,
    carouselImages: MACHINE_CAROUSEL_IMAGES,
  },

  // CENA 5 - Metrologia (9s)
  // VO: "Nossa metrologia avançada não 'confere' a peça..."
  {
    id: "scene-5a-metrology",
    kind: useBroll ? "video" : "image",
    src: useBroll ? metrologyVideo : zeissContura,
    title: "Metrologia avançada",
    subtitle: "Cada dimensão crítica documentada",
    durationInFrames: VIDEO_FPS * 4,
  },
  {
    id: "scene-5b-lab",
    kind: "image",
    src: labOverview,
    title: "Base sólida",
    subtitle: "Para auditorias e registros regulatórios",
    durationInFrames: VIDEO_FPS * 2,
  },
  {
    id: "scene-5c-laser",
    kind: useBroll ? "video" : "image",
    src: useBroll ? laserVideo : laserMarking,
    title: "Marcação UDI",
    subtitle: "Rastreabilidade permanente",
    durationInFrames: VIDEO_FPS * 3,
  },

  // CENA 6 - Produtos (11s)
  // VO: "Da barra de material à embalagem em sala limpa ISO 7..."
  {
    id: "scene-6a-surgical",
    kind: "image",
    src: surgicalInstruments,
    title: "Instrumentais cirúrgicos",
    subtitle: "Performance clínica comprovada",
    durationInFrames: VIDEO_FPS * 3,
  },
  {
    id: "scene-6b-orthopedic",
    kind: "image",
    src: orthopedicScrews,
    title: "Implantes ortopédicos",
    subtitle: "Milhões de ciclos de carga sem falhar",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  {
    id: "scene-6c-spinal",
    kind: "image",
    src: spinalImplants,
    title: "Sistemas espinhais",
    subtitle: "Cages e parafusos pediculares",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  {
    id: "scene-6d-electropolish",
    kind: useBroll ? "video" : "image",
    src: useBroll ? electropolishVideo : electropolishNew,
    title: "Eletropolimento",
    subtitle: "Acabamento médico certificado",
    durationInFrames: VIDEO_FPS * 3,
  },

  // CENA 7 - Parceria / Clientes (7s)
  // VO: "Por isso, não nos vemos como simples fornecedores..."
  {
    id: "scene-7a-partnership",
    kind: "image",
    src: receptionHero,
    title: "Parceria técnica",
    subtitle: "Junto com seu P&D e Qualidade",
    durationInFrames: VIDEO_FPS * 3,
  },
  {
    id: "scene-7b-clients",
    kind: "clients",
    src: "",
    title: "Parceiros que confiam",
    subtitle: "",
    durationInFrames: VIDEO_FPS * 4,
    backgroundColor: "#ffffff",
  },

  // CENA 8 - Fechamento (10s)
  // VO: "Lifetrek Medical. Precisão, qualidade e parceria..."
  {
    id: "scene-8a-certifications",
    kind: "image",
    src: cleanroomHeroAlt,
    title: "ISO 13485 • ANVISA",
    subtitle: "Processos que controlam cada variável",
    durationInFrames: VIDEO_FPS * 3,
    badgeSrc: isoBadge,
    badgeSrc2: anvisaBadge,
  },
  {
    id: "scene-8b-exterior",
    kind: "image",
    src: exteriorHero,
    title: "Vamos desenhar o próximo avanço",
    subtitle: "Em saúde, juntos",
    durationInFrames: VIDEO_FPS * 4,
  },
  {
    id: "scene-8c-logo",
    kind: "logo-final",
    src: "",
    title: "Lifetrek Medical",
    subtitle: "Precisão que protege vidas",
    durationInFrames: VIDEO_FPS * 3,
    backgroundColor: BRAND.corporateBlue,
  },
];

const BASE_SLIDES = createSlides(true);

export const MASTER_SHOWCASE_FPS = 30;
export const MASTER_SHOWCASE_WIDTH = 1920;
export const MASTER_SHOWCASE_HEIGHT = 1080;
export const MASTER_SHOWCASE_DURATION_IN_FRAMES = BASE_SLIDES.reduce(
  (total, slide) => total + slide.durationInFrames,
  0
);

// Logo Watermark Component
const LogoWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, fps * 0.5], [0, 0.9], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        right: 48,
        bottom: 48,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 100,
      }}
    >
      <Img
        src={logoImg}
        style={{
          height: 50,
          width: "auto",
          filter: "brightness(1.1) drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
        }}
      />
    </div>
  );
};

// Shine Effect Component
const ShineEffect: React.FC<{ delay: number; width: number }> = ({ delay, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shineProgress = interpolate(
    frame - delay,
    [0, fps * 0.8],
    [-100, width + 200],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: shineProgress,
        width: 120,
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transform: "skewX(-20deg)",
        pointerEvents: "none",
      }}
    />
  );
};

// Stats Slide Component - Animated numbers on solid background
const StatsSlide: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { value: "30+", label: "anos" },
    { value: "30+", label: "clientes" },
    { value: "100%", label: "comprometimento" },
  ];

  // Overall fade in/out
  const fadeIn = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.4, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", easing: Easing.in(Easing.cubic) }
  );
  const containerOpacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BRAND.corporateBlue} 0%, ${BRAND.corporateBlueHover} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: containerOpacity,
      }}
    >
      {/* Subtle radial glow */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div style={{ display: "flex", gap: 140 }}>
        {stats.map((stat, index) => {
          const delay = index * fps * 0.15;
          const statSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 10, stiffness: 50, mass: 1.2 },
          });

          const scale = interpolate(statSpring, [0, 1], [0.7, 1]);
          const opacity = statSpring;
          const translateY = interpolate(statSpring, [0, 1], [40, 0]);

          return (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                transform: `scale(${scale}) translateY(${translateY}px)`,
                opacity,
              }}
            >
              <div
                style={{
                  fontSize: 110,
                  fontWeight: 800,
                  fontFamily: "Inter, system-ui, sans-serif",
                  color: BRAND.textLight,
                  lineHeight: 1,
                  textShadow: "0 4px 30px rgba(0,0,0,0.4)",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  fontFamily: "Inter, system-ui, sans-serif",
                  color: "rgba(248, 250, 252, 0.75)",
                  marginTop: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(frame, [fps * 0.5, fps * 1], [0, 250], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
          height: 4,
          background: `linear-gradient(90deg, transparent, ${BRAND.energyOrange}, transparent)`,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// Cleanroom Carousel Component - Smooth crossfade with Ken Burns
const CleanroomCarouselSlide: React.FC<{
  images: string[];
  title: string;
  subtitle: string;
  durationInFrames: number;
  badgeSrc?: string;
  badgeSrc2?: string;
}> = ({ images, title, subtitle, durationInFrames, badgeSrc, badgeSrc2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const framesPerImage = durationInFrames / images.length;
  const currentImageIndex = Math.min(
    Math.floor(frame / framesPerImage),
    images.length - 1
  );

  // Spring animations for text
  const titleSpring = spring({
    frame: frame - fps * 0.1,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });

  const subtitleSpring = spring({
    frame: frame - fps * 0.25,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });

  const badgeSpring = spring({
    frame: frame - fps * 0.5,
    fps,
    config: { damping: 12, stiffness: 60, mass: 1 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.backgroundDark }}>
      {/* Cleanroom images with smooth crossfade and Ken Burns */}
      {images.map((img, index) => {
        const imageStart = index * framesPerImage;
        const localFrame = frame - imageStart;
        const isCurrentOrPast = frame >= imageStart;
        const isNext = index === currentImageIndex + 1;

        // Smooth fade with longer crossfade duration
        const fadeIn = interpolate(
          localFrame,
          [0, fps * 0.6],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
        );

        const fadeOut = interpolate(
          localFrame,
          [framesPerImage - fps * 0.6, framesPerImage],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) }
        );

        // Ken Burns - slow zoom and pan for cinematic feel
        const scale = interpolate(
          localFrame,
          [0, framesPerImage],
          [1.0, 1.15],
          { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
        );

        // Alternate pan direction for each image
        const panX = interpolate(
          localFrame,
          [0, framesPerImage],
          index % 2 === 0 ? [0, -30] : [-30, 0],
          { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
        );

        const panY = interpolate(
          localFrame,
          [0, framesPerImage],
          index % 2 === 0 ? [0, -20] : [-20, 0],
          { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
        );

        const opacity = isCurrentOrPast ? (index === currentImageIndex ? Math.min(fadeIn, fadeOut) : 0) : 0;

        if (!isCurrentOrPast && !isNext) return null;

        return (
          <AbsoluteFill
            key={index}
            style={{
              opacity,
              overflow: "hidden",
            }}
          >
            <Img
              src={img}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
              }}
            />
          </AbsoluteFill>
        );
      })}

      {/* Premium gradient overlay - lighter for cleanroom bright images */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(
            180deg,
            rgba(0, 79, 143, 0.1) 0%,
            rgba(10, 13, 18, 0.3) 40%,
            rgba(10, 13, 18, 0.75) 75%,
            rgba(10, 13, 18, 0.9) 100%
          )`,
        }}
      />

      {/* Subtle vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Text overlay */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 100,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            transform: `translateY(${interpolate(titleSpring, [0, 1], [60, 0])}px)`,
            opacity: titleSpring,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: BRAND.textLight,
              textShadow: `0 4px 20px rgba(0, 79, 143, 0.4), 0 2px 4px rgba(0,0,0,0.3)`,
            }}
          >
            {title}
          </div>
          <ShineEffect delay={fps * 0.3} width={600} />
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.5,
            maxWidth: 800,
            color: "rgba(248, 250, 252, 0.85)",
            transform: `translateY(${interpolate(subtitleSpring, [0, 1], [40, 0])}px)`,
            opacity: subtitleSpring,
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            marginTop: 8,
            height: 4,
            width: interpolate(subtitleSpring, [0, 1], [0, 180]),
            background: `linear-gradient(90deg, ${BRAND.energyOrange}, ${BRAND.corporateBlue})`,
            borderRadius: 2,
            boxShadow: `0 0 20px ${BRAND.energyOrange}50`,
          }}
        />
      </div>

      {/* Certification badges */}
      {badgeSrc && (
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 180,
            display: "flex",
            gap: 16,
            opacity: badgeSpring,
            transform: `scale(${interpolate(badgeSpring, [0, 1], [0.8, 1])})`,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <Img src={badgeSrc} style={{ height: 80, width: "auto" }} />
          </div>
          {badgeSrc2 && (
            <div
              style={{
                background: "rgba(255,255,255,0.95)",
                padding: 16,
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <Img src={badgeSrc2} style={{ height: 80, width: "auto" }} />
            </div>
          )}
        </div>
      )}

      {/* Top brand identifier */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 60,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(frame, [0, fps * 0.5], [0, 0.7]),
        }}
      >
        <div
          style={{
            width: 4,
            height: 40,
            background: BRAND.energyOrange,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(248, 250, 252, 0.8)",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Lifetrek Medical • Manufatura de Precisão
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${BRAND.corporateBlue}, ${BRAND.energyOrange}, ${BRAND.corporateBlue})`,
        }}
      />
    </AbsoluteFill>
  );
};

// Machine Carousel Component - Smooth transitions with scale effect
const CarouselSlide: React.FC<{
  images: string[];
  title: string;
  subtitle: string;
  durationInFrames: number;
}> = ({ images, title, subtitle, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const framesPerImage = durationInFrames / images.length;
  const currentImageIndex = Math.min(
    Math.floor(frame / framesPerImage),
    images.length - 1
  );

  const titleSpring = spring({
    frame: frame - fps * 0.1,
    fps,
    config: { damping: 12, stiffness: 60, mass: 1 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BRAND.backgroundDarkAlt} 0%, ${BRAND.backgroundDark} 100%)`,
      }}
    >
      {/* Subtle grid pattern overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Machine images with smooth crossfade */}
      {images.map((img, index) => {
        const isActive = index === currentImageIndex;
        const imageStart = index * framesPerImage;
        const localFrame = frame - imageStart;

        // Smoother fade with cubic easing
        const fadeIn = interpolate(localFrame, [0, fps * 0.25], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });

        const fadeOut = interpolate(
          localFrame,
          [framesPerImage - fps * 0.25, framesPerImage],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) }
        );

        const opacity = isActive ? Math.min(fadeIn, fadeOut) : 0;

        // Smooth scale with spring-like feel
        const scale = interpolate(
          localFrame,
          [0, framesPerImage * 0.3, framesPerImage],
          [0.95, 1, 1.02],
          { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
        );

        // Subtle Y movement for depth
        const translateY = interpolate(
          localFrame,
          [0, framesPerImage],
          [10, -5],
          { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
        );

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${scale}) translateY(${translateY}px)`,
              opacity,
            }}
          >
            <Img
              src={img}
              style={{
                height: 480,
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.6))",
              }}
            />
          </div>
        );
      })}

      {/* Title overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 80,
          right: 80,
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: "Inter, system-ui, sans-serif",
            color: BRAND.textLight,
            marginBottom: 12,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            fontFamily: "Inter, system-ui, sans-serif",
            color: "rgba(248, 250, 252, 0.7)",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 16,
            height: 4,
            width: 150,
            background: `linear-gradient(90deg, ${BRAND.energyOrange}, ${BRAND.corporateBlue})`,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Progress dots */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
        }}
      >
        {images.map((_, index) => (
          <div
            key={index}
            style={{
              width: index === currentImageIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background:
                index === currentImageIndex
                  ? BRAND.energyOrange
                  : "rgba(255,255,255,0.3)",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Client Logos Slide - Scrolling logo parade
const ClientsSlide: React.FC<{ title: string; durationInFrames: number }> = ({
  title,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame: frame - fps * 0.1,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });

  // Animate logos appearing in grid
  const logosPerRow = 6;
  const rows = Math.ceil(CLIENT_LOGOS.length / logosPerRow);

  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            fontFamily: "Inter, system-ui, sans-serif",
            color: BRAND.corporateBlue,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 16,
            height: 4,
            width: 100,
            background: `linear-gradient(90deg, ${BRAND.corporateBlue}, ${BRAND.energyOrange})`,
            borderRadius: 2,
            margin: "16px auto 0",
          }}
        />
      </div>

      {/* Logo grid */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 80,
          right: 80,
          bottom: 100,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
        }}
      >
        {CLIENT_LOGOS.map((logo, index) => {
          const delay = index * fps * 0.05;
          const logoSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 100, mass: 0.5 },
          });

          return (
            <div
              key={index}
              style={{
                opacity: logoSpring,
                transform: `scale(${interpolate(logoSpring, [0, 1], [0.8, 1])})`,
              }}
            >
              <Img
                src={logo}
                style={{
                  height: 60,
                  width: "auto",
                  objectFit: "contain",
                  filter: "grayscale(30%)",
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Final Logo Slide - Brand closing
const LogoFinalSlide: React.FC<{
  title: string;
  subtitle: string;
  durationInFrames: number;
}> = ({ title, subtitle, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 60, mass: 1 },
  });

  const textSpring = spring({
    frame: frame - fps * 0.3,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BRAND.corporateBlue} 0%, ${BRAND.corporateBlueHover} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: logoSpring,
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.8, 1])})`,
        }}
      >
        <Img
          src={logoImg}
          style={{
            height: 120,
            width: "auto",
            filter: "brightness(1.2) drop-shadow(0 4px 20px rgba(0,0,0,0.3))",
          }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          marginTop: 40,
          opacity: textSpring,
          transform: `translateY(${interpolate(textSpring, [0, 1], [20, 0])}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            fontFamily: "Inter, system-ui, sans-serif",
            color: BRAND.textLight,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: "Inter, system-ui, sans-serif",
            color: "rgba(248, 250, 252, 0.85)",
            marginTop: 16,
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Accent bar */}
      <div
        style={{
          marginTop: 32,
          height: 4,
          width: interpolate(textSpring, [0, 1], [0, 200]),
          background: `linear-gradient(90deg, ${BRAND.energyOrange}, ${BRAND.innovationGreen})`,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// Premium Slide Component - Standard image/video slides
const Slide: React.FC<SlideItem> = ({
  kind,
  src,
  title,
  subtitle,
  durationInFrames,
  badgeSrc,
  badgeSrc2,
  cropVideoBottom,
  backgroundColor,
  carouselImages,
}) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();

  // Handle special slide types
  if (kind === "stats") {
    return <StatsSlide durationInFrames={durationInFrames} />;
  }

  if (kind === "cleanroom-carousel" && carouselImages) {
    return (
      <CleanroomCarouselSlide
        images={carouselImages}
        title={title}
        subtitle={subtitle}
        durationInFrames={durationInFrames}
        badgeSrc={badgeSrc}
        badgeSrc2={badgeSrc2}
      />
    );
  }

  if (kind === "carousel" && carouselImages) {
    return (
      <CarouselSlide
        images={carouselImages}
        title={title}
        subtitle={subtitle}
        durationInFrames={durationInFrames}
      />
    );
  }

  if (kind === "clients") {
    return <ClientsSlide title={title} durationInFrames={durationInFrames} />;
  }

  if (kind === "logo-final") {
    return (
      <LogoFinalSlide
        title={title}
        subtitle={subtitle}
        durationInFrames={durationInFrames}
      />
    );
  }

  // Smooth fade transitions with longer crossfade for cinematic feel
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", easing: Easing.in(Easing.cubic) }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Ken Burns with smoother, more cinematic movement
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.12], {
    easing: Easing.out(Easing.quad),
  });

  // Smoother pan with bezier-like easing
  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -25],
    { easing: Easing.out(Easing.cubic) }
  );
  const translateX = interpolate(
    frame,
    [0, durationInFrames],
    [0, -12],
    { easing: Easing.out(Easing.cubic) }
  );

  // Spring animations for text
  const titleSpring = spring({
    frame: frame - fps * 0.1,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });

  const subtitleSpring = spring({
    frame: frame - fps * 0.25,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });

  const accentSpring = spring({
    frame: frame - fps * 0.4,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.5 },
  });

  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = titleSpring;
  const subtitleY = interpolate(subtitleSpring, [0, 1], [40, 0]);
  const subtitleOpacity = subtitleSpring;
  const accentWidth = interpolate(accentSpring, [0, 1], [0, 180]);

  // Badge animations
  const badgeSpring = spring({
    frame: frame - fps * 0.5,
    fps,
    config: { damping: 12, stiffness: 60, mass: 1 },
  });

  // Skip text for empty titles (transition slides)
  const hasText = title || subtitle;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background media with Ken Burns */}
      <div
        style={{
          position: "absolute",
          inset: cropVideoBottom ? "-5% 0 -15% 0" : 0,
          overflow: "hidden",
        }}
      >
        {kind === "video" ? (
          <Video
            src={src}
            muted
            style={{
              width: "100%",
              height: cropVideoBottom ? "120%" : "100%",
              objectFit: "cover",
              objectPosition: "center top",
              transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            }}
          />
        ) : (
          <Img
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            }}
          />
        )}
      </div>

      {/* Premium gradient overlay - Brand Blue tint */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(
            180deg,
            rgba(0, 79, 143, 0.15) 0%,
            rgba(10, 13, 18, 0.5) 40%,
            rgba(10, 13, 18, 0.85) 75%,
            rgba(10, 13, 18, 0.95) 100%
          )`,
        }}
      />

      {/* Subtle vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Glass card for text - Brand styling */}
      {hasText && (
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 100,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Title with shine effect */}
          {title && (
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                transform: `translateY(${titleY}px)`,
                opacity: titleOpacity,
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  fontFamily: "Inter, system-ui, sans-serif",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: BRAND.textLight,
                  textShadow: `0 4px 20px rgba(0, 79, 143, 0.4), 0 2px 4px rgba(0,0,0,0.3)`,
                }}
              >
                {title}
              </div>
              <ShineEffect delay={fps * 0.3} width={800} />
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 400,
                fontFamily: "Inter, system-ui, sans-serif",
                lineHeight: 1.5,
                maxWidth: 800,
                color: "rgba(248, 250, 252, 0.85)",
                transform: `translateY(${subtitleY}px)`,
                opacity: subtitleOpacity,
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Accent bar with gradient - Energy Orange */}
          <div
            style={{
              marginTop: 8,
              height: 4,
              width: accentWidth,
              background: `linear-gradient(90deg, ${BRAND.energyOrange}, ${BRAND.corporateBlue})`,
              borderRadius: 2,
              boxShadow: `0 0 20px ${BRAND.energyOrange}50`,
            }}
          />
        </div>
      )}

      {/* Certification badges */}
      {badgeSrc && (
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 180,
            display: "flex",
            gap: 16,
            opacity: badgeSpring,
            transform: `scale(${interpolate(badgeSpring, [0, 1], [0.8, 1])})`,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <Img src={badgeSrc} style={{ height: 80, width: "auto" }} />
          </div>
          {badgeSrc2 && (
            <div
              style={{
                background: "rgba(255,255,255,0.95)",
                padding: 16,
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <Img src={badgeSrc2} style={{ height: 80, width: "auto" }} />
            </div>
          )}
        </div>
      )}

      {/* Top brand identifier - subtle */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 60,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(frame, [0, fps * 0.5], [0, 0.7]),
        }}
      >
        <div
          style={{
            width: 4,
            height: 40,
            background: BRAND.energyOrange,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(248, 250, 252, 0.8)",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Lifetrek Medical • Manufatura de Precisão
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${BRAND.corporateBlue}, ${BRAND.energyOrange}, ${BRAND.corporateBlue})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const MasterShowcase: React.FC<MasterShowcaseProps> = ({
  useBroll = true,
  useVoiceover = false,
  useMusic = false,
  imageOverrides,
}) => {
  let startFrame = 0;
  const slides = createSlides(useBroll);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.backgroundDark }}>
      {/* Audio tracks */}
      {useVoiceover && (
        <Audio src={voiceoverAudio} volume={1} />
      )}
      {useMusic && (
        <Audio src={backgroundMusic} volume={0.15} />
      )}

      {slides.map((slide, index) => {
        const from = startFrame;
        startFrame += slide.durationInFrames;

        return (
          <Sequence
            key={`${slide.id}-${index}`}
            from={from}
            durationInFrames={slide.durationInFrames}
          >
            <Slide {...slide} />
          </Sequence>
        );
      })}

      {/* Persistent logo watermark */}
      <LogoWatermark />
    </AbsoluteFill>
  );
};
