import React, { useState } from 'react';
import { GeneratedOutput, VideoDetails } from '../types';
import { SceneCard } from './SceneCard';
import { CopyIcon } from './icons/Icons';

interface OutputDisplayProps {
  output: GeneratedOutput;
  model: VideoDetails['model'];
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, model }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output.video_prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const promptTitle = 'Video Generation Prompt';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Storyboard</h2>
        <div className="space-y-4">
          {output.storyboard.map((scene) => (
            <SceneCard key={scene.scene} scene={scene} />
          ))}
        </div>
      </div>
      
      <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-800/60 px-3 text-sm font-medium text-gray-400">Final Prompt</span>
          </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">{promptTitle}</h2>
        <div className="relative">
          <pre className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-gray-300 whitespace-pre-wrap text-sm font-mono overflow-x-auto">
            {output.video_prompt}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200"
            title="Copy to clipboard"
          >
            <CopyIcon className="h-5 w-5" />
            {copied && <span className="absolute -left-2 top-10 text-xs bg-green-500 text-white px-2 py-1 rounded">Copied!</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
