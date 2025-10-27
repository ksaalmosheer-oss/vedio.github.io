import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VideoDetails, GeneratedOutput } from '../types';

const buildPrompt = (details: VideoDetails): string => {
  let prompt = `
You are a creative director and video-generation specialist. Your task is to generate a professional, fully-described storyboard and then create a detailed prompt for the selected generative model based on the following inputs.

INPUTS:
- Video description: ${details.description}
- Video style: ${details.style}
- Target duration: ${details.duration} seconds
- Overall Pacing: ${details.pacing} (Use this to influence scene durations and shot dynamism)
- Aspect ratio: ${details.aspectRatio}
- AI model for final video: ${details.model}
`;

  if (details.characters && details.characters.length > 0 && details.characters.some(c => c.name && c.description)) {
    prompt += `
- CHARACTER DEFINITIONS:
${details.characters.filter(c => c.name && c.description).map(c => `  - ${c.name}: ${c.description}`).join('\n')}
**CRITICAL**: When a scene involves one of these characters, refer to them by name (e.g., "${details.characters[0].name}") and ensure the visualDescription and keyframe prompts are consistent with their detailed description provided above.
`;
  }

  if (details.musicStyle) {
    prompt += `- Music Style / Sound Design: ${details.musicStyle}\n`;
  }
  if (details.negativePrompt) {
    prompt += `- Elements to avoid (negative prompt): ${details.negativePrompt}\n`;
  }
  if (details.keyframeStyle) {
    prompt += `- Keyframe Style Enhancer: "${details.keyframeStyle}" (This text MUST be appended to every single keyframe prompt you generate)\n`;
  }

  if (details.isMarketing) {
    prompt += `
This is a product marketing video.
- Product name: ${details.productName}
- Key benefit(s): ${details.benefits}
- Target audience: ${details.audience}
- Call-to-action: ${details.cta}
- Brand voice / tone: ${details.brandVoice}
`;
  }

  prompt += `
TASK:
1. Generate a professional, scene-by-scene storyboard. The number of scenes should be appropriate for a ${details.duration}-second video, keeping the requested '${details.pacing}' pacing in mind. For each scene, provide:
   - scene: The scene number.
   - duration: Approximate duration for the scene in seconds (e.g., "3-5s").
   - shotType: The type of camera shot (e.g., "Wide Shot", "Medium Close-Up", "POV", "Drone Shot").
   - cameraAngle: The angle of the camera (e.g., "Eye-Level", "Low Angle", "High Angle").
   - lighting: A brief description of the lighting style (e.g., "Golden hour, soft light", "Hard, dramatic shadows", "Neon, moody").
   - visualDescription: A detailed description of the visual action, setting, and subject matter.
   - keyframe: A detailed, vivid, and cinematic image generation prompt that captures the essence of this specific scene. This should be suitable for an image generation model.`;

  if (details.keyframeStyle) {
      prompt += ` **CRITICAL: You MUST append the "Keyframe Style Enhancer" text ("${details.keyframeStyle}") to the end of this keyframe prompt.**`;
  }

  prompt += `
   - animationPrompt: A short, dynamic prompt (2-3 sentences) for a video model to animate the keyframe. Describe the camera movement (e.g., slow pan, dolly zoom, handheld tracking shot) and the action/motion within the scene (e.g., character's movement, environmental changes like wind blowing). This should bring the static keyframe to life.
   - voiceover: The voiceover script for the scene. Use 'None' if not applicable.
   - on_screen_text: Any text that appears on screen. Use 'None' if not applicable.

2. After the storyboard, craft the final video-generation prompt for the chosen model (${details.model}). This prompt must be a comprehensive, single paragraph that incorporates all relevant parameters (style, aspect ratio, duration, music, negative prompt, product details, brand voice).
   - Preface it with: "Using model ${details.model}, generate a video..."
   - Weave the storyboard's visual and narrative cues into a cohesive set of instructions.
   - Use descriptive keywords to guide visuals (lighting, camera movement, environment, motion, color palette).
`;


  prompt += `
OUTPUT FORMAT:
Return a single JSON object with two keys: "storyboard" and "video_prompt".
The "storyboard" value should be an array of objects, where each object represents a scene with the detailed structure defined in the TASK section.
The "video_prompt" value should be a string containing the complete, final prompt.
`;
  return prompt;
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        storyboard: {
            type: Type.ARRAY,
            description: "An array of scenes that make up the storyboard.",
            items: {
                type: Type.OBJECT,
                properties: {
                    scene: { type: Type.NUMBER, description: "Scene number, starting from 1." },
                    duration: { type: Type.STRING, description: "Approximate duration of the scene, e.g., '3-5s'." },
                    shotType: { type: Type.STRING, description: "The type of camera shot (e.g., 'Wide Shot', 'Medium Close-Up')." },
                    cameraAngle: { type: Type.STRING, description: "The angle of the camera (e.g., 'Eye-Level', 'Low Angle')." },
                    lighting: { type: Type.STRING, description: "A brief description of the lighting style (e.g., 'Golden hour, soft light')." },
                    visualDescription: { type: Type.STRING, description: "A detailed description of the visual action, setting, and subject matter." },
                    keyframe: { type: Type.STRING, description: "A detailed, vivid, and cinematic image generation prompt for this scene." },
                    animationPrompt: { type: Type.STRING, description: "A short, dynamic prompt to animate the keyframe, describing camera movement and action." },
                    voiceover: { type: Type.STRING, description: "Voiceover copy for the scene. Use 'None' if not applicable." },
                    on_screen_text: { type: Type.STRING, description: "On-screen text for the scene. Use 'None' if not applicable." },
                },
                 required: ['scene', 'duration', 'shotType', 'cameraAngle', 'lighting', 'visualDescription', 'keyframe', 'animationPrompt', 'voiceover', 'on_screen_text']
            }
        },
        video_prompt: {
            type: Type.STRING,
            description: "The final, complete prompt for the video generation AI model."
        }
    },
    required: ['storyboard', 'video_prompt']
};


export const generateStoryboardAndPrompt = async (details: VideoDetails): Promise<GeneratedOutput> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = buildPrompt(details);

  try {
    const response = await ai.models.generateContent({
        model: details.storyboardModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.7,
        }
    });
    
    const jsonString = response.text;
    const parsedOutput: GeneratedOutput = JSON.parse(jsonString);
    return parsedOutput;

  } catch (error) {
    console.error("Error calling Gemini API for storyboard:", error);
    throw new Error("Failed to generate storyboard from the AI model. Please check the console for more details.");
  }
};

export const generateImageForKeyframe = async (prompt: string, aspectRatio: VideoDetails['aspectRatio'], imageModel: VideoDetails['imageModel']): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        if (imageModel === 'imagen-4.0-generate-001') {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });
    
            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            } else {
                throw new Error("No image was generated by Imagen API.");
            }
        } else { // gemini-2.5-flash-image
            const fullPrompt = `${prompt}, in a ${aspectRatio} aspect ratio.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                  parts: [{ text: fullPrompt }],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
              });
              
              for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                  const base64ImageBytes: string = part.inlineData.data;
                  return `data:image/png;base64,${base64ImageBytes}`;
                }
              }
              throw new Error("No image was generated by Gemini Flash Image API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        throw new Error("Failed to generate keyframe image. Please check the console for details.");
    }
};
