import React from 'react';
import { StoryboardScene } from '../types';
import { ImageIcon, MotionIcon } from './icons/Icons';

interface SceneCardProps {
  scene: StoryboardScene;
}

const TechnicalPill: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="bg-gray-700/50 px-3 py-1 rounded-full text-xs">
      <span className="font-semibold text-gray-400 mr-1.5">{label}:</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
);

const ImagePlaceholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="aspect-video bg-gray-800 rounded-md my-3 flex items-center justify-center border border-gray-700">
    {children}
  </div>
);

export const SceneCard: React.FC<SceneCardProps> = ({ scene }) => {
  return (
    <div className="bg-gray-900/40 border border-gray-700/70 rounded-lg p-4 transition-shadow hover:shadow-lg hover:shadow-cyan-500/5 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-cyan-400">Scene {scene.scene}</h3>
         <div className="text-xs bg-gray-800 px-2 py-1 rounded-full">
            <span className="font-semibold text-gray-400 mr-1.5">Duration:</span>
            <span className="text-gray-300">{scene.duration}</span>
        </div>
      </div>
      
      {scene.imageUrl === 'error' ? (
        <ImagePlaceholder>
          <div className="text-center text-red-400 p-2">
             <p className="font-semibold">Image Failed</p>
             <p className="text-xs text-red-500">Could not generate keyframe.</p>
           </div>
        </ImagePlaceholder>
      ) : scene.imageUrl ? (
        <div className="aspect-video bg-gray-800 rounded-md my-3 overflow-hidden border border-gray-700">
          <img src={scene.imageUrl} alt={`Keyframe for scene ${scene.scene}`} className="w-full h-full object-cover" />
        </div>
      ) : (
        <ImagePlaceholder>
            <div className="animate-pulse flex flex-col items-center justify-center text-gray-500">
              <ImageIcon className="h-8 w-8 mb-2" />
              <span className="text-sm">Generating Image...</span>
            </div>
        </ImagePlaceholder>
      )}

      <div className="flex items-center space-x-2 flex-wrap gap-y-2">
        <TechnicalPill label="Shot" value={scene.shotType} />
        <TechnicalPill label="Angle" value={scene.cameraAngle} />
        <TechnicalPill label="Lighting" value={scene.lighting} />
      </div>

      <p className="text-sm text-gray-300">{scene.visualDescription}</p>

      {scene.voiceover && scene.voiceover.toLowerCase() !== 'none' && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Voiceover</h4>
          <p className="text-sm text-gray-300 italic">"{scene.voiceover}"</p>
        </div>
      )}
      
      {scene.on_screen_text && scene.on_screen_text.toLowerCase() !== 'none' && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">On-screen Text</h4>
          <p className="text-sm text-gray-200 font-mono bg-gray-800/50 px-2 py-1 rounded">[{scene.on_screen_text}]</p>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Keyframe Prompt</h4>
        <pre className="mt-1 text-xs text-gray-400 bg-gray-900/70 p-2 rounded-md whitespace-pre-wrap font-mono overflow-x-auto">
          {scene.keyframe}
        </pre>
      </div>

      {scene.animationPrompt && (
         <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <MotionIcon className="h-4 w-4" />
            Animation Prompt
          </h4>
          <pre className="mt-1 text-xs text-gray-400 bg-gray-900/70 p-2 rounded-md whitespace-pre-wrap font-mono overflow-x-auto">
            {scene.animationPrompt}
          </pre>
        </div>
      )}

    </div>
  );
};
