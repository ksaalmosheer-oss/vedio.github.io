export interface Character {
  name: string;
  description: string;
}

export interface VideoDetails {
  description: string;
  style: string;
  duration: number;
  pacing: 'Dynamic / Fast' | 'Standard' | 'Slow / Meditative';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  model: string;
  storyboardModel: 'gemini-2.5-pro' | 'gemini-2.5-flash';
  imageModel: 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image';
  characters?: Character[];
  isMarketing: boolean;
  productName?: string;
  benefits?: string;
  audience?: string;
  cta?: string;
  brandVoice?: string;
  negativePrompt?: string;
  musicStyle?: string;
  keyframeStyle?: string;
}

export interface StoryboardScene {
  scene: number;
  duration: string;
  shotType: string;
  cameraAngle: string;
  lighting: string;
  visualDescription: string;
  keyframe: string;
  animationPrompt: string;
  voiceover: string;
  on_screen_text: string;
  imageUrl?: string;
}

export interface GeneratedOutput {
  storyboard: StoryboardScene[];
  video_prompt: string;
}
