import OpenAI from 'openai';
import { logger } from './logger';

export interface GenerateWithFallbackParams {
  messages: Array<any>;
  response_format?: any;
  temperature?: number;
}

export async function generateWithFallback({ messages, response_format, temperature = 0.2 }: GenerateWithFallbackParams): Promise<string> {
  const isOfflineMode = process.env.OFFLINE_MODE === 'true';

  // 1. Local Fallback Execution branch
  const runLocalFallback = async (): Promise<string> => {
    logger.info('[LLMService] Utilizing Local Model as fallback (e.g. Ollama/DeepSeek)');
    const localOpenAI = new OpenAI({
      apiKey: process.env.LOCAL_OPENAI_API_KEY || 'sk-local',
      baseURL: process.env.LOCAL_OPENAI_BASE_URL || 'http://localhost:11434/v1',
    });

    const backupResponse = await localOpenAI.chat.completions.create({
      model: process.env.LOCAL_OPENAI_MODEL || 'qwen:7b',
      temperature,
      response_format,
      messages,
    });

    const content = backupResponse.choices[0].message.content;
    if (!content) {
      throw new Error('Local fallback LLM returned an empty response.');
    }
    return content;
  };

  // 2. If explicitly forced to offline, skip online entirely
  if (isOfflineMode) {
    logger.info('[LLMService] OFFLINE_MODE is true. Bypassing online check.');
    return runLocalFallback();
  }

  // 3. Online Execution branch (Primary)
  try {
    const primaryOpenAI = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,  // Fails if undefined/empty
      baseURL: process.env.OPENAI_BASE_URL,
    });

    logger.info('[LLMService] Attempting to use Primary Online LLM.');
    const primaryResponse = await primaryOpenAI.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature,
      response_format,
      messages,
    // Add brief timeout in standard apps using a fetch wrapper or passing `options: { timeout }` in OpenAI SDK
    // The OpenAI Node SDK supports setting timeout.
    }, { timeout: 10000 }); 

    const content = primaryResponse.choices[0].message.content;
    if (!content) {
      throw new Error('Primary LLM returned an empty response.');
    }
    return content;

  } catch (error: any) {
    // 4. Online failed. Catch and route to fallback
    logger.warn(`[LLMService] Primary completion failed: ${error.message}. Routing to local fallback.`);
    return runLocalFallback();
  }
}
