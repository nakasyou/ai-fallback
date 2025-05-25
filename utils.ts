import type {
  EmbeddingModelV1,
  ImageModelV1,
  LanguageModelV1,
  SpeechModelV1,
  TranscriptionModelV1,
} from '@ai-sdk/provider'

export type Model =
  | LanguageModelV1
  | EmbeddingModelV1<unknown>
  | TranscriptionModelV1
  | ImageModelV1
  | SpeechModelV1

type ModelManager<T extends Model> = <R>(
  callback: (model: T) => Promise<R>,
) => Promise<R>

interface ModelState<T> {
  model: T
  score: number
}

/**
 * @internal
 */
export const modelManager = <T extends Model>(models: T[]): ModelManager<T> => {
  const states: ModelState<T>[] = models.map((model) => ({
    model,
    score: 1,
  }))

  return async (callback) => {
    let lastErr: unknown
    try {
      for (const state of states) {
        try {
          const result = await callback(state.model)
          // this model successed
          state.score *= 0.7
          return result
        } catch (err) {
          state.score *= 1.5
          lastErr = err
          continue
        }
      }
      throw lastErr
    } finally {
      for (const state of states) {
        state.score *= 0.9
      }
      // sort by score
      states.sort((a, b) => a.score - b.score)
    }
  }
}
