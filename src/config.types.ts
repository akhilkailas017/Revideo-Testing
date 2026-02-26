export type AnimationType = 'scale' | 'rotation' | 'opacity' | 'position';

export interface Animation {
  type: AnimationType;
  to: number | { x: number; y: number };
  duration: number;
}

export interface BaseItem {
  id: string;
  startTime: number;
}

export interface VideoItem extends BaseItem {
  type: 'video';
  src: string;
  duration: number;
  position: { x: number; y: number };
  size: { width: number | string; height?: number | string };
  opacity: number;
  loop: boolean;
  play: boolean;
}

export interface AudioItem extends BaseItem {
  type: 'audio';
  src: string;
  audioStartTime: number;
  play: boolean;
}

export interface ImageItem extends BaseItem {
  type: 'image';
  src: string;
  position: { x: number; y: number };
  size: { width: number | string };
  opacity: number;
  animations: Animation[];
}

export interface TextItem extends BaseItem {
  type: 'text';
  text: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  fill: string;
  opacity: number;
  animations: Animation[];
}

export type TimelineItem = VideoItem | AudioItem | ImageItem | TextItem;

export interface VideoConfig {
  settings: {
    size: { x: number; y: number };
    background: string;
  };
  timeline: TimelineItem[];
}