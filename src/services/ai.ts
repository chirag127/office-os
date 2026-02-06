/**
 * Office OS - AI Service
 * AI features powered by Puter.ai
 */

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<string>;
        img2txt: (image: string | Blob) => Promise<string>;
        txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>;
      };
    };
  }
}

export interface AIResponse {
  result: string;
  model: string;
  processingTime: number;
}

/**
 * Check if Puter AI is available
 */
export function isPuterAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.puter?.ai;
}

/**
 * Chat with AI
 */
export async function chat(
  prompt: string,
  options: { model?: string } = {}
): Promise<AIResponse> {
  if (!isPuterAvailable()) {
    throw new Error('Puter AI not available. Please ensure Puter.js is loaded.');
  }

  const startTime = Date.now();
  const model = options.model || 'gpt-4o-mini';

  const result = await window.puter.ai.chat(prompt, { model });

  return {
    result,
    model,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Summarize document text
 */
export async function summarizeText(
  text: string,
  options: {
    style?: 'bullet' | 'paragraph' | 'brief';
    maxPoints?: number;
  } = {}
): Promise<AIResponse> {
  const { style = 'bullet', maxPoints = 5 } = options;

  let prompt: string;
  switch (style) {
    case 'bullet':
      prompt = `Summarize the following document in ${maxPoints} key bullet points. Be concise and focus on the main ideas:\n\n${text}`;
      break;
    case 'paragraph':
      prompt = `Write a comprehensive summary of the following document in 2-3 paragraphs:\n\n${text}`;
      break;
    case 'brief':
      prompt = `Provide a one-sentence summary of the following document:\n\n${text}`;
      break;
  }

  return chat(prompt);
}

/**
 * Translate text
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<AIResponse> {
  const fromLang = sourceLanguage ? `from ${sourceLanguage} ` : '';
  const prompt = `Translate the following text ${fromLang}to ${targetLanguage}. Only provide the translation, no explanations:\n\n${text}`;

  return chat(prompt);
}

/**
 * Generate quiz from content
 */
export async function generateQuiz(
  text: string,
  options: {
    questionCount?: number;
    type?: 'multiple-choice' | 'true-false' | 'short-answer' | 'mixed';
    difficulty?: 'easy' | 'medium' | 'hard';
  } = {}
): Promise<AIResponse> {
  const { questionCount = 5, type = 'multiple-choice', difficulty = 'medium' } = options;

  let questionFormat: string;
  switch (type) {
    case 'multiple-choice':
      questionFormat = 'multiple choice questions with 4 options (A, B, C, D) and mark the correct answer';
      break;
    case 'true-false':
      questionFormat = 'true/false questions with the correct answer';
      break;
    case 'short-answer':
      questionFormat = 'short answer questions with brief expected answers';
      break;
    case 'mixed':
      questionFormat = 'a mix of multiple choice, true/false, and short answer questions';
      break;
  }

  const prompt = `Based on the following content, create ${questionCount} ${difficulty} difficulty ${questionFormat}. Format clearly with question numbers.

Content:
${text}`;

  return chat(prompt);
}

/**
 * Rewrite text
 */
export async function rewriteText(
  text: string,
  style: 'professional' | 'casual' | 'academic' | 'simple' | 'creative'
): Promise<AIResponse> {
  const styleInstructions: Record<string, string> = {
    professional: 'in a professional, business-appropriate tone',
    casual: 'in a casual, friendly, conversational tone',
    academic: 'in a formal, academic style with proper terminology',
    simple: 'in simple, easy-to-understand language (suitable for a general audience)',
    creative: 'in a creative, engaging, and unique style',
  };

  const prompt = `Rewrite the following text ${styleInstructions[style]}. Maintain the original meaning but improve the writing:\n\n${text}`;

  return chat(prompt);
}

/**
 * Chat with document (Q&A about content)
 */
export async function chatWithDocument(
  documentText: string,
  question: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<AIResponse> {
  const historyText = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a helpful assistant answering questions about a document. Use only the information from the document to answer. If the answer isn't in the document, say so.

Document:
${documentText}

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}User question: ${question}`;

  return chat(prompt);
}

/**
 * Extract key information from document
 */
export async function extractKeyInfo(
  text: string,
  infoTypes: string[]
): Promise<AIResponse> {
  const prompt = `Extract the following information from the document. If information is not found, indicate "Not found".

Information to extract:
${infoTypes.map((type, i) => `${i + 1}. ${type}`).join('\n')}

Document:
${text}`;

  return chat(prompt);
}

/**
 * Grammar and spelling check
 */
export async function checkGrammar(text: string): Promise<AIResponse> {
  const prompt = `Check the following text for grammar, spelling, and punctuation errors. List each error found with the correction, then provide the fully corrected text at the end:

${text}`;

  return chat(prompt);
}

/**
 * Get available AI models
 */
export function getAvailableModels(): Array<{ id: string; name: string; description: string }> {
  return [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient for most tasks' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model for complex tasks' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Great for analysis and writing' },
  ];
}
