import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import citizenCnc from "../../src/assets/equipment/citizen-l32.webp";
import receptionHero from "../../src/assets/facility/reception-hero.webp";
import cleanroomHero from "../../src/assets/facility/cleanroom.webp";
import exteriorHero from "../../src/assets/facility/exterior-hero.webp";
import anvisaBadge from "../../src/assets/certifications/anvisa.webp";
import isoBadge from "../../src/assets/certifications/iso.jpg";
import zeissMetrology from "../../src/assets/metrology/zeiss-contura.webp";
import surgicalInstruments from "../../src/assets/products/surgical-instruments-new.webp";
import orthopedicScrews from "../../src/assets/products/orthopedic-screws-optimized.webp";
import spinalImplants from "../../src/assets/products/spinal-implants-optimized.webp";

const FADE_DURATION_IN_FRAMES = 12;
const VIDEO_FPS = 30;

const droneRiseVideo = staticFile("remotion/broll/broll-01-drone-rise.mp4");
const facadePushVideo = staticFile("remotion/broll/broll-02-facade-push.mp4");

const BROLL_FLAGS = {
  cleanroom: false,
  cnc: false,
  metrology: false,
  packaging: false,
};

type MasterShowcaseProps = {
  useBroll?: boolean;
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
};

const createSlide = ({
  id,
  title,
  subtitle,
  durationSeconds,
  imageSrc,
  videoPath,
  useVideo,
  badgeSrc,
}: {
  id: string;
  title: string;
  subtitle: string;
  durationSeconds: number;
  imageSrc: string;
  videoPath?: string;
  useVideo?: boolean;
  badgeSrc?: string;
}): SlideItem => ({
  id,
  kind: useVideo && videoPath ? "video" : "image",
  src: useVideo && videoPath ? staticFile(videoPath) : imageSrc,
  title,
  subtitle,
  durationInFrames: VIDEO_FPS * durationSeconds,
  badgeSrc,
});

const resolveImageSrc = (
  id: string,
  imageSrc: string,
  imageOverrides?: Record<string, string>
) => imageOverrides?.[id] ?? imageSrc;

const createSlides = ({
  useBroll,
  imageOverrides,
}: {
  useBroll: boolean;
  imageOverrides?: Record<string, string>;
}): SlideItem[] => {
  const slides: SlideItem[] = [
    createSlide({
      id: "broll-drone",
      title: "Lifetrek Medical",
      subtitle: "Engenharia de precisão que protege vidas",
      durationSeconds: 5,
      imageSrc: resolveImageSrc("broll-drone", exteriorHero, imageOverrides),
      videoPath: "remotion/broll/broll-01-drone-rise.mp4",
      useVideo: useBroll,
    }),
    createSlide({
      id: "broll-facade",
      title: "Há mais de 30 anos",
      subtitle: "Manufatura médica para quem não pode errar",
      durationSeconds: 5,
      imageSrc: resolveImageSrc("broll-facade", receptionHero, imageOverrides),
      videoPath: "remotion/broll/broll-02-facade-push.mp4",
      useVideo: useBroll,
    }),
    createSlide({
      id: "facility-reception",
      title: "Componentes médicos de precisão",
      subtitle: "Fabricação certificada ISO 13485",
      durationSeconds: 8,
      imageSrc: resolveImageSrc("facility-reception", receptionHero, imageOverrides),
    }),
    createSlide({
      id: "facility-cleanroom",
      title: "Salas limpas controladas",
      subtitle: "Rastreabilidade e consistência em cada lote",
      durationSeconds: 8,
      imageSrc: resolveImageSrc("facility-cleanroom", cleanroomHero, imageOverrides),
      videoPath: "remotion/broll/broll-03-cleanroom.mp4",
      useVideo: useBroll && BROLL_FLAGS.cleanroom,
    }),
    createSlide({
      id: "equipment-cnc",
      title: "CNC de última geração",
      subtitle: "Tolerâncias de mícron com repetibilidade real",
      durationSeconds: 8,
      imageSrc: resolveImageSrc("equipment-cnc", citizenCnc, imageOverrides),
      videoPath: "remotion/broll/broll-04-cnc.mp4",
      useVideo: useBroll && BROLL_FLAGS.cnc,
    }),
    createSlide({
      id: "metrology",
      title: "Metrologia avançada",
      subtitle: "Dimensão crítica validada e documentada",
      durationSeconds: 7,
      imageSrc: resolveImageSrc("metrology", zeissMetrology, imageOverrides),
      videoPath: "remotion/broll/broll-05-metrology.mp4",
      useVideo: useBroll && BROLL_FLAGS.metrology,
    }),
    createSlide({
      id: "product-surgical",
      title: "Instrumentais cirúrgicos",
      subtitle: "Desempenho clínico com qualidade comprovada",
      durationSeconds: 8,
      imageSrc: resolveImageSrc("product-surgical", surgicalInstruments, imageOverrides),
    }),
    createSlide({
      id: "product-orthopedic",
      title: "Implantes ortopédicos",
      subtitle: "Precisão, confiabilidade e segurança",
      durationSeconds: 7,
      imageSrc: resolveImageSrc("product-orthopedic", orthopedicScrews, imageOverrides),
    }),
    createSlide({
      id: "product-spinal",
      title: "Implantes avançados",
      subtitle: "Consistência e rastreabilidade em escala",
      durationSeconds: 7,
      imageSrc: resolveImageSrc("product-spinal", spinalImplants, imageOverrides),
    }),
    createSlide({
      id: "certifications",
      title: "ISO 13485 e ANVISA",
      subtitle: "Processos certificados para reduzir risco",
      durationSeconds: 6,
      imageSrc: resolveImageSrc("certifications", isoBadge, imageOverrides),
      badgeSrc: anvisaBadge,
    }),
    createSlide({
      id: "facility-exterior",
      title: "Parceiros técnicos",
      subtitle: "Mais flexibilidade, velocidade e qualidade",
      durationSeconds: 8,
      imageSrc: resolveImageSrc("facility-exterior", exteriorHero, imageOverrides),
    }),
  ];

  if (BROLL_FLAGS.packaging) {
    slides.splice(
      6,
      0,
      createSlide({
        id: "packaging",
        title: "Embalagem estéril",
        subtitle: "Controle final com segurança regulatória",
        durationSeconds: 6,
        imageSrc: resolveImageSrc("packaging", surgicalInstruments, imageOverrides),
        videoPath: "remotion/broll/broll-06-packaging.mp4",
        useVideo: useBroll && BROLL_FLAGS.packaging,
      })
    );
  }

  return slides;
};

const BASE_SLIDES = createSlides({ useBroll: true, imageOverrides: {} });

export const MASTER_SHOWCASE_FPS = 30;
export const MASTER_SHOWCASE_WIDTH = 1920;
export const MASTER_SHOWCASE_HEIGHT = 1080;
export const MASTER_SHOWCASE_DURATION_IN_FRAMES =
  BASE_SLIDES.reduce((total, slide) => total + slide.durationInFrames, 0);

const Slide: React.FC<SlideItem> = ({
  kind,
  src,
  title,
  subtitle,
  durationInFrames,
  badgeSrc,
}) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  const fadeIn = interpolate(
    frame,
    [0, FADE_DURATION_IN_FRAMES],
    [0, 1],
    {
      extrapolateRight: "clamp",
    }
  );

  const fadeOut = interpolate(
    frame,
    [durationInFrames - FADE_DURATION_IN_FRAMES, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.08]);
  const translateY = interpolate(frame, [0, durationInFrames], [0, -24]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {kind === "video" ? (
        <Video
          src={src}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translateY(${translateY}px)`,
          }}
        />
      ) : (
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translateY(${translateY}px)`,
          }}
        />
      )}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(11, 15, 22, 0.1) 0%, rgba(11, 15, 22, 0.65) 65%, rgba(11, 15, 22, 0.9) 100%)",
        }}
      />
      {badgeSrc ? (
        <Img
          src={badgeSrc}
          style={{
            position: "absolute",
            right: 96,
            bottom: 96,
            width: 140,
            height: "auto",
            background: "rgba(248, 250, 252, 0.9)",
            padding: 12,
            borderRadius: 12,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          bottom: 96,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "#F8FAFC",
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1.4,
            maxWidth: 900,
            color: "rgba(248, 250, 252, 0.85)",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 12,
            height: 3,
            width: 140,
            background: "#38BDF8",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 72,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(248, 250, 252, 0.7)",
        }}
      >
        Lifetrek Medical
      </div>
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 108,
          fontSize: 14,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(148, 163, 184, 0.9)",
        }}
      >
        Manufatura de Precisão
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Math.max(height * 0.08, 72),
          background: "rgba(11, 15, 22, 0.85)",
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};

export const MasterShowcase: React.FC<MasterShowcaseProps> = ({
  useBroll = true,
  imageOverrides,
}) => {
  let startFrame = 0;
  const slides = createSlides({ useBroll, imageOverrides });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F16" }}>
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
    </AbsoluteFill>
  );
};
