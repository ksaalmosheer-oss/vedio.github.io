import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { FilmIcon, SparklesIcon } from './components/icons/Icons';
import { VideoDetails, GeneratedOutput } from './types';
import { generateStoryboardAndPrompt, generateImageForKeyframe } from './services/geminiService';

const App: React.FC = () => {
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (details: VideoDetails) => {
    setIsLoading(true);
    setError(null);
    setGeneratedOutput(null);
    setVideoDetails(details);

    try {
      // Phase 1: Generate storyboard and prompt text
      const textOutput = await generateStoryboardAndPrompt(details);
      setGeneratedOutput(textOutput);
      setIsLoading(false); // Stop main loader, show the text content

      // Phase 2: Generate images for each scene sequentially to avoid rate limiting
      for (const [index, scene] of textOutput.storyboard.entries()) {
        try {
          const imageUrl = await generateImageForKeyframe(scene.keyframe, details.aspectRatio, details.imageModel);
          
          // Update state with the new image URL for the specific scene
          setGeneratedOutput(prevOutput => {
            if (!prevOutput) return null;
            const newStoryboard = [...prevOutput.storyboard];
            newStoryboard[index] = { ...newStoryboard[index], imageUrl };
            return { ...prevOutput, storyboard: newStoryboard };
          });

        } catch (imageError) {
          console.error(`Failed to generate image for scene ${scene.scene}:`, imageError);
          // Set an error state for this specific card
           setGeneratedOutput(prevOutput => {
            if (!prevOutput) return null;
            const newStoryboard = [...prevOutput.storyboard];
            newStoryboard[index] = { ...newStoryboard[index], imageUrl: 'error' }; 
            return { ...prevOutput, storyboard: newStoryboard };
          });
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FilmIcon className="h-8 w-8 text-cyan-400" />
              <h1 className="text-xl font-bold tracking-tight text-gray-100">
                AI Storyboard & Prompt Generator
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 min-h-[calc(100vh-12rem)] p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <SparklesIcon className="h-12 w-12 text-cyan-400 animate-pulse" />
                  <p className="mt-4 text-lg text-gray-400">Generating storyboard text...</p>
                  <p className="text-sm text-gray-500">This can take a moment.</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-red-400 text-lg">An error occurred</p>
                    <p className="text-gray-500 mt-2">{error}</p>
                  </div>
                </div>
              ) : generatedOutput && videoDetails ? (
                <OutputDisplay output={generatedOutput} model={videoDetails.model} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <SparklesIcon className="h-16 w-16 text-gray-600" />
                  <h2 className="mt-4 text-xl font-semibold text-gray-300">Ready to Create?</h2>
                  <p className="mt-2 text-gray-400 max-w-md">
                    Fill in the details on the left to generate a professional storyboard and a ready-to-use video prompt for your AI model.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
