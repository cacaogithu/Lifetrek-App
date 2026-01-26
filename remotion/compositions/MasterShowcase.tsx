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
};

// Assets
import citizenCnc from "../../src/assets/equipment/citizen-l32.webp";
import tornosGt26 from "../../src/assets/equipment/tornos-gt26.webp";
import robodrill from "../../src/assets/equipment/robodrill.webp";
import laserMarking from "../../src/assets/equipment/laser-marking.webp";
import electropolish from "../../src/assets/equipment/electropolish-line.webp";
import receptionHero from "../../src/assets/facility/reception-hero.webp";
import cleanroomHero from "../../src/assets/facility/cleanroom.webp";
import cleanroomHeroAlt from "../../src/assets/facility/cleanroom-hero.webp";
import exteriorHero from "../../src/assets/facility/exterior-hero.webp";
import anvisaBadge from "../../src/assets/certifications/anvisa.webp";
import isoBadge from "../../src/assets/certifications/iso.webp";
import zeissMetrology from "../../src/assets/metrology/zeiss-contura.webp";
import surgicalInstruments from "../../src/assets/products/surgical-instruments-new.webp";
import orthopedicScrews from "../../src/assets/products/orthopedic-screws-optimized.webp";
import spinalImplants from "../../src/assets/products/spinal-implants-optimized.webp";
import logoImg from "../../src/assets/logo.png";

const VIDEO_FPS = 30;

// B-roll video paths
const droneRiseVideo = staticFile("remotion/broll/broll-01-drone-rise.mp4");
const facadePushVideo = staticFile("remotion/broll/broll-02-facade-push.mp4");
const cleanroomVideo = staticFile("remotion/broll/broll-03-cleanroom.mp4");

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
  kind: "image" | "video";
  src: string;
  title: string;
  subtitle: string;
  durationInFrames: number;
  badgeSrc?: string;
  badgeSrc2?: string;
  cropVideoBottom?: boolean; // Crop bottom to remove Veo watermark
};

// Premium slide configuration - FASTER CUTS for dynamic feel
const createSlides = (useBroll: boolean): SlideItem[] => [
  // Opening - Drone shot (3.5s)
  {
    id: "opening-drone",
    kind: useBroll ? "video" : "image",
    src: useBroll ? droneRiseVideo : exteriorHero,
    title: "Lifetrek Medical",
    subtitle: "Engenharia de precisão que protege vidas",
    durationInFrames: VIDEO_FPS * 3.5,
  },
  // Facade approach (3s)
  {
    id: "facade",
    kind: useBroll ? "video" : "image",
    src: useBroll ? facadePushVideo : receptionHero,
    title: "Há mais de 30 anos",
    subtitle: "Manufatura médica para quem não pode errar",
    durationInFrames: VIDEO_FPS * 3,
  },
  // Reception (2.5s)
  {
    id: "reception",
    kind: "image",
    src: receptionHero,
    title: "Excelência em cada detalhe",
    subtitle: "Parceria técnica com os maiores fabricantes",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  // Cleanroom video (4s) - CROP BOTTOM for Veo watermark
  {
    id: "cleanroom-video",
    kind: useBroll ? "video" : "image",
    src: useBroll ? cleanroomVideo : cleanroomHero,
    title: "Salas limpas ISO Classe 7",
    subtitle: "Ambiente controlado para máxima qualidade",
    durationInFrames: VIDEO_FPS * 4,
    cropVideoBottom: true,
  },
  // Cleanroom alt (2.5s)
  {
    id: "cleanroom-detail",
    kind: "image",
    src: cleanroomHeroAlt,
    title: "Rastreabilidade total",
    subtitle: "Cada lote documentado e validado",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  // CNC Citizen (3s)
  {
    id: "cnc-citizen",
    kind: "image",
    src: citizenCnc,
    title: "CNC Swiss de última geração",
    subtitle: "Tolerâncias de mícron com repetibilidade real",
    durationInFrames: VIDEO_FPS * 3,
  },
  // CNC Tornos (2.5s)
  {
    id: "cnc-tornos",
    kind: "image",
    src: tornosGt26,
    title: "Tornos GT26",
    subtitle: "Precisão suíça em escala industrial",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  // Robodrill (2.5s)
  {
    id: "robodrill",
    kind: "image",
    src: robodrill,
    title: "Centro de usinagem FANUC",
    subtitle: "Velocidade e precisão integradas",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  // Metrology (3s)
  {
    id: "metrology",
    kind: "image",
    src: zeissMetrology,
    title: "Metrologia Zeiss",
    subtitle: "Cada dimensão crítica validada",
    durationInFrames: VIDEO_FPS * 3,
  },
  // Laser marking (2.5s)
  {
    id: "laser",
    kind: "image",
    src: laserMarking,
    title: "Marcação a laser UDI",
    subtitle: "Rastreabilidade permanente",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  // Electropolish (2.5s)
  {
    id: "electropolish",
    kind: "image",
    src: electropolish,
    title: "Eletropolimento médico",
    subtitle: "Acabamento superior para implantes",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  // Products - Surgical (3s)
  {
    id: "surgical",
    kind: "image",
    src: surgicalInstruments,
    title: "Instrumentais cirúrgicos",
    subtitle: "Desempenho clínico comprovado",
    durationInFrames: VIDEO_FPS * 3,
  },
  // Products - Orthopedic (2.5s)
  {
    id: "orthopedic",
    kind: "image",
    src: orthopedicScrews,
    title: "Implantes ortopédicos",
    subtitle: "Precisão que restaura movimento",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  // Products - Spinal (2.5s)
  {
    id: "spinal",
    kind: "image",
    src: spinalImplants,
    title: "Sistemas espinhais",
    subtitle: "Tecnologia que transforma vidas",
    durationInFrames: VIDEO_FPS * 2.5,
  },
  // Certifications (3.5s)
  {
    id: "certifications",
    kind: "image",
    src: cleanroomHero,
    title: "ISO 13485 • ANVISA",
    subtitle: "Certificações que garantem confiança",
    durationInFrames: VIDEO_FPS * 3.5,
    badgeSrc: isoBadge,
    badgeSrc2: anvisaBadge,
  },
  // Closing (4s)
  {
    id: "closing",
    kind: "image",
    src: exteriorHero,
    title: "Seu parceiro técnico",
    subtitle: "Qualidade, velocidade e flexibilidade",
    durationInFrames: VIDEO_FPS * 4,
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

// Premium Slide Component
const Slide: React.FC<SlideItem> = ({
  kind,
  src,
  title,
  subtitle,
  durationInFrames,
  badgeSrc,
  badgeSrc2,
  cropVideoBottom,
}) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();

  // Smooth fade transitions
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

  const opacity = Math.min(fadeIn, fadeOut);

  // Ken Burns with more dramatic movement
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.12], {
    easing: Easing.out(Easing.quad),
  });
  const translateY = interpolate(frame, [0, durationInFrames], [0, -30]);
  const translateX = interpolate(frame, [0, durationInFrames], [0, -15]);

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

        {/* Subtitle */}
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
