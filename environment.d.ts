declare global {
    namespace NodeJS {
        interface ProcessEnv {
        TTS_ENDPOINT: string,
        TTS_FISH_AUDIO_API_KEY: string
        TTS_ENABLED: boolean
        // Transcription
        TRANSCRIBE_ENABLED: boolean
        TRANSCRIBE_PROVIDER?: string
        TRANSCRIBE_MAX_MB?: string
        OPENAI_API_KEY?: string
        GEMINI_API_KEY?: string
    }
}
}

  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
export {}