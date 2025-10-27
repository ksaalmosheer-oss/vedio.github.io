import React, { useState, FormEvent } from 'react';
import { VideoDetails, Character } from '../types';
import { SparklesIcon, UserPlusIcon, TrashIcon } from './icons/Icons';

interface InputFormProps {
  onSubmit: (details: VideoDetails) => void;
  isLoading: boolean;
}

const MAX_CHARACTERS = 2;

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [isMarketing, setIsMarketing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([{ name: '', description: '' }]);

  const handleCharacterChange = (index: number, field: keyof Character, value: string) => {
    const newCharacters = [...characters];
    newCharacters[index][field] = value;
    setCharacters(newCharacters);
  };

  const addCharacter = () => {
    if (characters.length < MAX_CHARACTERS) {
      setCharacters([...characters, { name: '', description: '' }]);
    }
  };

  const removeCharacter = (index: number) => {
    const newCharacters = characters.filter((_, i) => i !== index);
    setCharacters(newCharacters);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const details: VideoDetails = {
      description: formData.get('description') as string,
      style: formData.get('style') as string,
      duration: parseInt(formData.get('duration') as string, 10),
      pacing: formData.get('pacing') as 'Dynamic / Fast' | 'Standard' | 'Slow / Meditative',
      aspectRatio: formData.get('aspectRatio') as '16:9' | '9:16' | '1:1' | '4:3',
      model: formData.get('model') as string,
      storyboardModel: showAdvanced ? formData.get('storyboardModel') as 'gemini-2.5-pro' | 'gemini-2.5-flash' : 'gemini-2.5-pro',
      imageModel: showAdvanced ? formData.get('imageModel') as 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image' : 'imagen-4.0-generate-001',
      characters: characters.filter(c => c.name && c.description),
      isMarketing: isMarketing,
      productName: isMarketing ? formData.get('productName') as string : undefined,
      benefits: isMarketing ? formData.get('benefits') as string : undefined,
      audience: isMarketing ? formData.get('audience') as string : undefined,
      cta: isMarketing ? formData.get('cta') as string : undefined,
      brandVoice: isMarketing ? formData.get('brandVoice') as string : undefined,
      negativePrompt: showAdvanced ? formData.get('negativePrompt') as string : undefined,
      musicStyle: showAdvanced ? formData.get('musicStyle') as string : undefined,
      keyframeStyle: showAdvanced ? formData.get('keyframeStyle') as string : undefined,
    };
    onSubmit(details);
  };

  const inputClasses = "mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-200 placeholder-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/60 p-6 rounded-xl border border-gray-700/50">
      <div>
        <label htmlFor="description" className={labelClasses}>Video Description</label>
        <textarea id="description" name="description" rows={4} required className={inputClasses} placeholder="e.g., A fast-paced montage of a chef preparing a gourmet meal."></textarea>
      </div>

      <div>
        <label htmlFor="style" className={labelClasses}>Video Style</label>
        <input type="text" id="style" name="style" required className={inputClasses} placeholder="e.g., Cinematic, gritty, vibrant"/>
      </div>
      
       <div className="space-y-4 rounded-lg bg-gray-900/30 p-4 border border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400">Character Definitions</h3>
           {characters.map((char, index) => (
             <div key={index} className="space-y-3 p-3 bg-gray-800/30 rounded-md border border-gray-700/50 relative">
               <div className="flex justify-between items-center">
                 <p className="text-xs font-semibold text-gray-300">Character {index + 1}</p>
                 {characters.length > 1 && (
                    <button type="button" onClick={() => removeCharacter(index)} className="text-gray-500 hover:text-red-400">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                 )}
               </div>
               <div>
                 <label htmlFor={`charName${index}`} className="block text-xs font-medium text-gray-400">Name</label>
                 <input type="text" id={`charName${index}`} value={char.name} onChange={(e) => handleCharacterChange(index, 'name', e.target.value)} className={inputClasses + " text-xs"} placeholder="e.g., Alex" />
               </div>
               <div>
                 <label htmlFor={`charDesc${index}`} className="block text-xs font-medium text-gray-400">Detailed Description</label>
                 <textarea id={`charDesc${index}`} value={char.description} onChange={(e) => handleCharacterChange(index, 'description', e.target.value)} rows={3} className={inputClasses + " text-xs"} placeholder="e.g., A young man in his 20s, with short brown hair, wearing a red hoodie and jeans."></textarea>
               </div>
             </div>
           ))}
           {characters.length < MAX_CHARACTERS && (
             <button type="button" onClick={addCharacter} className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-1.5 border border-dashed border-gray-600 text-xs font-medium rounded-md text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition-colors">
               <UserPlusIcon className="h-4 w-4" />
               Add Character
             </button>
           )}
       </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className={labelClasses}>Duration (s)</label>
          <input type="number" id="duration" name="duration" required defaultValue="30" min="1" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="aspectRatio" className={labelClasses}>Aspect Ratio</label>
          <select id="aspectRatio" name="aspectRatio" className={inputClasses}>
            <option>16:9</option>
            <option>9:16</option>
            <option>1:1</option>
            <option>4:3</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="model" className={labelClasses}>Final Video AI Model</label>
        <input
          type="text"
          id="model"
          name="model"
          required
          className={inputClasses}
          placeholder="e.g., veo-3.1-fast-generate-preview"
          defaultValue="veo-3.1-fast-generate-preview"
        />
      </div>

       <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center">
             <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="bg-gray-800/60 px-3 text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors">
              Creative & Technical Controls {showAdvanced ? '(-)' : '(+)'}
            </button>
          </div>
      </div>

      {showAdvanced && (
        <div className="space-y-4 rounded-lg bg-gray-900/30 p-4 border border-gray-700/50 animate-fade-in">
           <div>
             <label htmlFor="storyboardModel" className={labelClasses}>Storyboard AI Model</label>
             <select id="storyboardModel" name="storyboardModel" defaultValue="gemini-2.5-pro" className={inputClasses}>
               <option value="gemini-2.5-pro">Gemini 2.5 Pro (Higher Quality)</option>
               <option value="gemini-2.5-flash">Gemini 2.5 Flash (Faster)</option>
             </select>
           </div>
           <div>
             <label htmlFor="imageModel" className={labelClasses}>Keyframe Image Model</label>
             <select id="imageModel" name="imageModel" defaultValue="imagen-4.0-generate-001" className={inputClasses}>
               <option value="imagen-4.0-generate-001">Imagen 4.0 (Highest Quality)</option>
               <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image (Fast)</option>
             </select>
           </div>
           <div>
             <label htmlFor="keyframeStyle" className={labelClasses}>Keyframe Style Enhancer</label>
             <input type="text" name="keyframeStyle" id="keyframeStyle" className={inputClasses} placeholder="e.g., 8k, hyperrealistic, cinematic lighting" />
             <p className="mt-1 text-xs text-gray-500">This text will be added to every keyframe prompt.</p>
           </div>
           <div><label htmlFor="musicStyle" className={labelClasses}>Music Style / Sound Design</label><input type="text" name="musicStyle" id="musicStyle" className={inputClasses} placeholder="e.g., Upbeat cinematic score, ambient city sounds" /></div>
           <div><label htmlFor="pacing" className={labelClasses}>Overall Pacing</label><select id="pacing" name="pacing" className={inputClasses}><option>Standard</option><option>Dynamic / Fast</option><option>Slow / Meditative</option></select></div>
           <div><label htmlFor="negativePrompt" className={labelClasses}>Elements to Avoid</label><input type="text" name="negativePrompt" id="negativePrompt" className={inputClasses} placeholder="e.g., Blurry footage, unrealistic colors" /></div>
        </div>
      )}

      <div className="space-y-4 rounded-lg bg-gray-900/30 p-4 border border-gray-700/50">
          <div className="flex items-center">
            <input id="isMarketing" name="isMarketing" type="checkbox" checked={isMarketing} onChange={(e) => setIsMarketing(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500" />
            <label htmlFor="isMarketing" className="ml-3 block text-sm font-medium text-gray-300">This is a Product Marketing Video</label>
          </div>

          {isMarketing && (
            <div className="space-y-4 animate-fade-in">
              <div><label htmlFor="productName" className={labelClasses}>Product Name</label><input type="text" name="productName" id="productName" className={inputClasses} placeholder="e.g., SynthWave AI" /></div>
              <div><label htmlFor="benefits" className={labelClasses}>Key Benefits</label><textarea name="benefits" id="benefits" rows={2} className={inputClasses} placeholder="e.g., Boosts productivity, automates workflows"></textarea></div>
              <div><label htmlFor="audience" className={labelClasses}>Target Audience</label><input type="text" name="audience" id="audience" className={inputClasses} placeholder="e.g., Creative professionals, developers" /></div>
              <div><label htmlFor="cta" className={labelClasses}>Call-to-Action</label><input type="text" name="cta" id="cta" className={inputClasses} placeholder="e.g., Try for free, Learn more" /></div>
              <div><label htmlFor="brandVoice" className={labelClasses}>Brand Voice / Tone</label><input type="text" name="brandVoice" id="brandVoice" className={inputClasses} placeholder="e.g., Energetic, professional, witty" /></div>
            </div>
          )}
      </div>

      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5"/>
            Generate Storyboard & Prompt
          </>
        )}
      </button>
    </form>
  );
};
