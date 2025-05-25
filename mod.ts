/**
 * @example
 * ```ts
 * import { generateText } from 'ai'
 * import { combineLanguageModels } from '@ns/ai-fallback'
 * import { openai } from '@ai-sdk/openai'
 * import { google } from '@ai-sdk/google'
 *
 * const combinedModels = combineLanguageModels([
 *   openai('gpt-4o'),
 *   google('gemini-2.0-flash')
 * ])
 * ```
 * @module
 */

import type {
  EmbeddingModelV1,
  ImageModelV1,
  LanguageModelV1,
  SpeechModelV1,
  TranscriptionModelV1,
} from '@ai-sdk/provider'
import { modelManager } from './utils.ts'

/**
 * Combines language models
 * @param models Models
 * @returns Combined model
 */
export const combineLanguageModels = (
  models: LanguageModelV1[],
): LanguageModelV1 => {
  const manager = modelManager(models)
  return {
    defaultObjectGenerationMode: 'json',
    modelId: 'combined',
    provider: 'combined',
    specificationVersion: 'v1',
    supportsImageUrls: models.some((model) => model.supportsImageUrls),
    supportsStructuredOutputs: models.some((model) =>
      model.supportsStructuredOutputs
    ),
    doGenerate(init) {
      return manager(async (model) => {
        const generated = await model.doGenerate(init)
        if (generated.finishReason === 'error') {
          throw null
        }
        return generated
      })
    },
    doStream(options) {
      return manager(async (model) => {
        const response = await model.doStream(options)
        const [streamA, streamB] = response.stream.tee()
        response.stream = streamA

        // test with first one
        const first = await streamB.getReader().read()
        if (first.value?.type === 'error') {
          throw null
        }

        return response
      })
    },
  }
}

/**
 * Combines embedding models
 * @param models Models
 * @returns Combined model
 */
export const combineEmbeddings = (
  models: EmbeddingModelV1<unknown>[],
): EmbeddingModelV1<unknown> => {
  const manager = modelManager(models)
  return {
    modelId: 'combined',
    provider: 'combined',
    specificationVersion: 'v1',
    supportsParallelCalls: models.some((model) => model.supportsParallelCalls),
    maxEmbeddingsPerCall: models.reduce(
      (max, model) => Math.max(max, model.maxEmbeddingsPerCall ?? 0),
      0,
    ),
    doEmbed(options) {
      return manager(async (model) => {
        const embeded = await model.doEmbed(options)
        return embeded
      })
    },
  }
}

/**
 * Combines transcription models
 * @param models Models
 * @returns Combined models
 */
export const combineTranscriptions = (
  models: TranscriptionModelV1[],
): TranscriptionModelV1 => {
  const manager = modelManager(models)
  return {
    modelId: 'combined',
    provider: 'combined',
    specificationVersion: 'v1',
    doGenerate(options) {
      return manager(async (model) => await model.doGenerate(options))
    },
  }
}

/**
 * Combines image models
 * @param models Models
 * @returns Combined models
 */
export const combineImages = (
  models: ImageModelV1[],
): ImageModelV1 => {
  const manager = modelManager(models)
  return {
    modelId: 'combined',
    provider: 'combined',
    specificationVersion: 'v1',
    maxImagesPerCall: models.reduce(
      (max, model) => Math.max(max, model.maxImagesPerCall ?? 1),
      0,
    ),
    doGenerate(options) {
      return manager(async (model) => await model.doGenerate(options))
    },
  }
}

/**
 * Combines speech models
 * @param models Models
 * @returns Combined models
 */
export const combineSpeech = (
  models: SpeechModelV1[],
): SpeechModelV1 => {
  const manager = modelManager(models)
  return {
    modelId: 'combined',
    provider: 'combined',
    specificationVersion: 'v1',
    doGenerate(options) {
      return manager(async (model) => await model.doGenerate(options))
    },
  }
}
