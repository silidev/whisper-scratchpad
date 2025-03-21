export declare class TranscriptionError extends Error {
    payload: object;
    constructor(payload: object);
}
export type ApiName = "OpenAI" | "groq-whisper" | "Gladia" | "Deepgram-nova-2" | "Deepgram-whisper" | "gpt-4o-transcribe" | "gpt-4o-mini-transcribe" | "Speechmatics" | "tmpTest";
export declare const transcribe: (api: ApiName, audioBlob: Blob, apiKey: string, prompt?: string, language?: string, translateToEnglish?: boolean) => Promise<string>;
