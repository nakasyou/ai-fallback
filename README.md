<!-- Thanks to Gemini 2.0 Pro Preview 03-25 -->

# @ns/ai-fallback

[![JSR Version](https://jsr.io/badges/@ns/ai-fallback)](https://jsr.io/@ns/ai-fallback)

<!-- Note: Update this if the JSR name changes -->

A utility library to create resilient AI model chains using the AI SDK provider
interface (`@ai-sdk/provider`). This library allows you to define a sequence of
models, providing automatic **fallback** capabilities.

When you make a request to a model created with this library, it attempts the
request with the first model in the sequence. If that attempt fails (due to
temporary API errors, rate limits, etc.), it automatically retries the _same_
request with the next model in the chain, continuing until a request succeeds or
all models have been attempted.

This significantly improves the robustness of your AI integrations by gracefully
handling transient issues with specific providers or models.

Supports creating fallback chains for:

- Language Models (`LanguageModelV1`) using `combineLanguageModels`
- Embedding Models (`EmbeddingModelV1`) using `combineEmbeddings`
- Transcription Models (`TranscriptionModelV1`) using `combineTranscriptions`
- Image Models (`ImageModelV1`) using `combineImages`

## Installation

This package is hosted on [JSR](https://jsr.io/@ns/ai-fallback), the JavaScript
Registry. <!-- Note: Update this if the JSR name changes -->

**Deno:**

```bash
deno add @ns/ai-fallback
```

**Bun:**

```bash
bunx jsr add --bun @ns/ai-fallback
```

**pnpm:**

```bash
pnpm dlx jsr add @ns/ai-fallback
```

**Yarn:**

```bash
yarn dlx jsr add @ns/ai-fallback
```

**npm:**

```bash
npx jsr add @ns/ai-fallback
```

You will also need the base `ai` package and provider-specific packages (e.g.,
`@ai-sdk/openai`, `@ai-sdk/google`).

## Usage

Here's a simple example creating a language model chain with OpenAI's GPT-4o as
the primary and Google's Gemini Flash as the fallback. If the request to GPT-4o
fails, the library automatically retries with Gemini Flash.

```typescript
import { generateText } from 'ai'
// Import the function to create the fallback chain
import { combineLanguageModels } from '@ns/ai-fallback'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'

// Define the model sequence for fallback.
// Requests will first try gpt-4o. If it fails (e.g., API error, rate limit),
// the *same* request will automatically be sent to the next model (gemini-2.0-flash).
const modelWithFallback = combineLanguageModels([
  openai('gpt-4o'),
  // Ensure 'gemini-2.0-flash' is a valid and accessible model ID for your setup
  google('gemini-2.0-flash'),
])

// Use the fallback-enabled model just like any other AI SDK model.
// Top-level await is used for simplicity in this example.
const { text } = await generateText({
  model: modelWithFallback, // Use the model chain here
  prompt: 'Why is the sky blue? Explain concisely.',
})

console.log(text)

// In a real application, you would likely add error handling
// for the case where *all* models in the fallback sequence fail.
```

Similar functions (`combineEmbeddings`, `combineTranscriptions`,
`combineImages`) are available for creating fallback chains for other types of
AI models. They follow the same pattern: pass an array of compatible models in
your desired fallback order, and use the returned model object with the
corresponding AI SDK function (`embed`, `transcribe`, `generateImage`).
