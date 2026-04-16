'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface CanvasRendererProps {
  clips: any[];
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  duration: number;
}

export function CanvasRenderer({
  clips,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlay,
  onPause,
  duration,
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const animationRef = useRef<number>();

  // Render frame to canvas
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render background grid pattern
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render clips
    clips.forEach((clip) => {
      if (
        currentTime >= clip.startTime &&
        currentTime < clip.startTime + clip.duration
      ) {
        // Render video/image clip
        if (clip.type === 'video' || clip.type === 'image') {
          ctx.fillStyle = '#4a4a4a';
          const width = canvas.width * 0.8;
          const height = canvas.height * 0.8;
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;

          ctx.fillRect(x, y, width, height);

          // Draw clip name
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(clip.name, canvas.width / 2, canvas.height / 2);
        }

        // Render text overlay
        if (clip.type === 'text') {
          ctx.fillStyle = clip.color || '#ffffff';
          ctx.font = `${clip.fontSize || 32}px ${clip.fontFamily || 'sans-serif'}`;
          ctx.textAlign = clip.align || 'center';
          ctx.fillText(
            clip.content,
            clip.x || canvas.width / 2,
            clip.y || canvas.height / 2
          );
        }
      }
    });

    // Render playhead time indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    const minutes = Math.floor(currentTime / 60);
    const seconds = (currentTime % 60).toFixed(2);
    ctx.fillText(
      `${minutes}:${seconds}`,
      10,
      canvas.height - 10
    );
  }, [clips, currentTime]);

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      renderFrame();
      onTimeUpdate(Math.min(currentTime + 1 / 30, duration)); // 30fps
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, renderFrame, onTimeUpdate]);

  // Render initial frame when not playing
  useEffect(() => {
    if (!isPlaying) {
      renderFrame();
    }
  }, [isPlaying, renderFrame]);

  // Handle canvas click for timeline scrubbing
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;
    onTimeUpdate(Math.max(0, Math.min(clickTime, duration)));
  };

  return (
    <div className="flex flex-col gap-4 bg-background p-4 rounded-lg border border-border">
      <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-auto cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Canvas Controls */}
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant={isPlaying ? 'default' : 'outline'}
          onClick={isPlaying ? onPause : onPlay}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Play
            </>
          )}
        </Button>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={(val) => {
              setVolume(val[0]);
              setIsMuted(false);
            }}
            max={100}
            step={1}
            className="w-24"
          />
        </div>

        {/* Time Display */}
        <div className="text-sm text-muted-foreground ml-auto">
          {Math.floor(currentTime / 60)}:
          {(currentTime % 60).toFixed(0).padStart(2, '0')} /{' '}
          {Math.floor(duration / 60)}:
          {(duration % 60).toFixed(0).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
