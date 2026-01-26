import { Composition } from "remotion";
import {
  MasterShowcase,
  MASTER_SHOWCASE_DURATION_IN_FRAMES,
  MASTER_SHOWCASE_FPS,
  MASTER_SHOWCASE_HEIGHT,
  MASTER_SHOWCASE_WIDTH,
} from "./compositions/MasterShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MasterShowcase"
        component={MasterShowcase}
        durationInFrames={MASTER_SHOWCASE_DURATION_IN_FRAMES}
        fps={MASTER_SHOWCASE_FPS}
        width={MASTER_SHOWCASE_WIDTH}
        height={MASTER_SHOWCASE_HEIGHT}
      />
      <Composition
        id="MasterShowcaseStills"
        component={MasterShowcase}
        durationInFrames={MASTER_SHOWCASE_DURATION_IN_FRAMES}
        fps={MASTER_SHOWCASE_FPS}
        width={MASTER_SHOWCASE_WIDTH}
        height={MASTER_SHOWCASE_HEIGHT}
        defaultProps={{ useBroll: false }}
      />
    </>
  );
};
