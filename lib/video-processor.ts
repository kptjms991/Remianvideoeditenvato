// Video Processing Utilities
export interface VideoClip {
  id: string;
  name: string;
  type: 'video' | 'image' | 'text' | 'audio';
  startTime: number;
  duration: number;
  trackIndex: number;
  content?: string; // for text clips
  url?: string; // for media files
  effects?: VideoEffect[];
  metadata?: {
    width?: number;
    height?: number;
    fps?: number;
  };
}

export interface VideoEffect {
  id: string;
  type: 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'fade' | 'zoom' | 'rotate' | 'saturation';
  value: number;
  duration?: number;
}

export interface VideoExportOptions {
  format: 'mp4' | 'webm' | 'mov' | 'gif';
  resolution: '480p' | '720p' | '1080p' | '2k' | '4k';
  bitrate?: number;
  fps?: number;
  quality?: number;
}

// Get video metadata
export async function getVideoMetadata(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  fps: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.addEventListener('loadedmetadata', () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        fps: 30, // Default to 30fps
      });
      URL.revokeObjectURL(url);
    });

    video.addEventListener('error', () => {
      reject(new Error('Failed to load video metadata'));
      URL.revokeObjectURL(url);
    });

    video.src = url;
  });
}

// Process video clip with effects
export function applyEffectsToCanvas(
  ctx: CanvasRenderingContext2D,
  effects: VideoEffect[]
): void {
  effects.forEach((effect) => {
    switch (effect.type) {
      case 'blur':
        ctx.filter = `blur(${effect.value}px)`;
        break;
      case 'brightness':
        ctx.filter = `brightness(${effect.value}%)`;
        break;
      case 'contrast':
        ctx.filter = `contrast(${effect.value}%)`;
        break;
      case 'grayscale':
        ctx.filter = `grayscale(${effect.value}%)`;
        break;
      case 'saturation':
        ctx.filter = `saturate(${effect.value}%)`;
        break;
      case 'rotate':
        ctx.transform = `rotate(${effect.value}deg)`;
        break;
    }
  });
}

// Calculate video composition dimensions
export function getCompositionDimensions(resolution: string): {
  width: number;
  height: number;
} {
  const dimensions: Record<string, { width: number; height: number }> = {
    '480p': { width: 854, height: 480 },
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '2k': { width: 2560, height: 1440 },
    '4k': { width: 3840, height: 2160 },
  };
  return dimensions[resolution] || dimensions['1080p'];
}

// Get bitrate based on resolution and quality
export function getBitrate(resolution: string, quality: number = 85): number {
  const bitrateMap: Record<string, number> = {
    '480p': 2500,
    '720p': 5000,
    '1080p': 8000,
    '2k': 15000,
    '4k': 25000,
  };

  const baseBitrate = bitrateMap[resolution] || 8000;
  return Math.floor(baseBitrate * (quality / 100));
}

// Create video composition command for FFmpeg
export function generateFFmpegCommand(
  clips: VideoClip[],
  options: VideoExportOptions
): string {
  const { width, height } = getCompositionDimensions(options.resolution);
  const bitrate = getBitrate(options.resolution, options.quality);
  const fps = options.fps || 30;

  let command = 'ffmpeg';

  // Input files
  clips.forEach((clip) => {
    if (clip.url) {
      command += ` -i "${clip.url}"`;
    }
  });

  // Filter complex for composition
  let filterComplex = `[0:v]scale=${width}:${height}`;

  // Add effects
  if (clips[0]?.effects) {
    clips[0].effects.forEach((effect) => {
      switch (effect.type) {
        case 'blur':
          filterComplex += `,boxblur=${effect.value}:${effect.value}`;
          break;
        case 'brightness':
          filterComplex += `,eq=brightness=${effect.value / 100}`;
          break;
        case 'contrast':
          filterComplex += `,eq=contrast=${effect.value / 100}`;
          break;
      }
    });
  }

  filterComplex += '[v]';

  command += ` -filter_complex "${filterComplex}"`;
  command += ` -c:v libx264 -b:v ${bitrate}k -r ${fps}`;
  command += ` -c:a aac -b:a 128k`;
  command += ` -y output.${getFileExtension(options.format)}`;

  return command;
}

function getFileExtension(format: string): string {
  const extensions: Record<string, string> = {
    mp4: 'mp4',
    webm: 'webm',
    mov: 'mov',
    gif: 'gif',
  };
  return extensions[format] || 'mp4';
}

// Merge audio tracks
export function mergeAudioTracks(audioClips: VideoClip[]): VideoClip {
  return {
    id: 'merged-audio',
    name: 'Merged Audio',
    type: 'audio',
    startTime: 0,
    duration: Math.max(...audioClips.map((c) => c.startTime + c.duration)),
    trackIndex: 0,
  };
}

// Validate clip overlap
export function validateClipOverlap(clips: VideoClip[]): boolean {
  for (let i = 0; i < clips.length; i++) {
    for (let j = i + 1; j < clips.length; j++) {
      const clip1 = clips[i];
      const clip2 = clips[j];

      // Check if clips are on same track
      if (clip1.trackIndex === clip2.trackIndex) {
        const clip1End = clip1.startTime + clip1.duration;
        const clip2End = clip2.startTime + clip2.duration;

        // Check for overlap
        if (
          clip1.startTime < clip2End &&
          clip2.startTime < clip1End
        ) {
          return false; // Overlap detected
        }
      }
    }
  }
  return true; // No overlaps
}

// Calculate total video duration
export function calculateTotalDuration(clips: VideoClip[]): number {
  if (clips.length === 0) return 0;
  return Math.max(...clips.map((c) => c.startTime + c.duration));
}
