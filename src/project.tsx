import {makeProject} from '@revideo/core';
import {Audio, Img, Length, makeScene2D, Txt, Video} from '@revideo/2d';
import {all, createRef, waitFor} from '@revideo/core';
import rawConfig from './video.config.json';
import type {VideoConfig, TimelineItem, VideoItem, AudioItem, ImageItem, TextItem, Animation} from './config.types';

const config = rawConfig as VideoConfig;
function* runAnimations(ref: any, animations: Animation[]) {
  let i = 0;
  while (i < animations.length) {
    const curr = animations[i];
    const next = animations[i + 1];

    const applyAnim = (anim: Animation) => {
      switch (anim.type) {
        case 'scale':
          return ref().scale(anim.to as number, anim.duration);
        case 'rotation':
          return ref().rotation(anim.to as number, anim.duration);
        case 'opacity':
          return ref().opacity(anim.to as number, anim.duration);
        case 'position': {
          const pos = anim.to as { x: number; y: number };
          return ref().position([pos.x, pos.y], anim.duration);
        }
      }
    };
    if (next && curr.duration === next.duration) {
      yield* all(applyAnim(curr), applyAnim(next));
      i += 2;
    } else {
      yield* applyAnim(curr);
      i += 1;
    }
  }
}

const scene = makeScene2D('scene', function* (view) {
  const sorted = [...config.timeline].sort((a, b) => a.startTime - b.startTime);
  const videos  = sorted.filter((i): i is VideoItem  => i.type === 'video');
  const audios  = sorted.filter((i): i is AudioItem  => i.type === 'audio');
  const images  = sorted.filter((i): i is ImageItem  => i.type === 'image');
  const texts   = sorted.filter((i): i is TextItem   => i.type === 'text');
  for (const item of videos) {
    const w = item.size.width;
    const h = item.size.height;
    const size: [Length, Length] = [w as Length, (h ?? w) as Length];
    yield view.add(
      <Video
        src={item.src}
        size={size}
        position={[item.position.x, item.position.y]}
        opacity={item.opacity}
        loop={item.loop}
        play={item.play}
      />
    );
  }

  for (const item of audios) {
    yield view.add(
      <Audio
        src={item.src}
        play={item.play}
        time={item.audioStartTime}
      />
    );
  }

  type AnimatedEntry =
    | { kind: 'image'; item: ImageItem; ref: any }
    | { kind: 'text';  item: TextItem;  ref: any };

  const animatedEntries: AnimatedEntry[] = [];

  for (const item of images) {
    const ref = createRef<Img>();
    yield view.add(
      <Img
        ref={ref}
        src={item.src}
        width={item.size.width as Length}
        position={[item.position.x, item.position.y]}
        opacity={item.opacity}
      />
    );
    animatedEntries.push({ kind: 'image', item, ref });
  }

  for (const item of texts) {
    const ref = createRef<Txt>();
    yield view.add(
      <Txt
        ref={ref}
        text={item.text}
        fontSize={item.fontSize}
        fontFamily={item.fontFamily}
        fill={item.fill}
        position={[item.position.x, item.position.y]}
        opacity={item.opacity}
      />
    );
    animatedEntries.push({ kind: 'text', item, ref });
  }
  animatedEntries.sort((a, b) => a.item.startTime - b.item.startTime);

  let cursor = 0; // current time in seconds

  for (const entry of animatedEntries) {
    const { item, ref } = entry;

    const delay = item.startTime - cursor;
    if (delay > 0) {
      yield* waitFor(delay);
      cursor = item.startTime;
    }

    if (item.animations && item.animations.length > 0) {
      const totalDuration = item.animations.reduce((sum, a) => sum + a.duration, 0);
      yield* runAnimations(ref, item.animations);
      cursor += totalDuration;
    }
  }
});
export default makeProject({
  scenes: [scene],
  settings: {
    shared: {
      size: config.settings.size,
    },
  },
});