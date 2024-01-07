export namespace HelgeUtils {

  export const suppressUnusedWarning = (...args: any[]) => {
    const flag = false;
    if (flag) {
      console.log(args);
    }
  };

  export namespace Audio {

    export type ApiName = "OpenAI" | "Gladia";

    const withOpenAi = async (audioBlob: Blob, apiKey: string, prompt: string) => {
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('model', 'whisper-1'); // Using the largest model
      formData.append('prompt', prompt);
      /* Language. Anything in a different language will be translated to the target language. */
      formData.append('language', "");

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });
      const result = await response.json();
      if (typeof result.text === "string") return result.text;
      return result;
    };

    const withGladia = async (audioBlob: Blob, apiKey: string, prompt: string = '') => {
      suppressUnusedWarning(prompt);
      // Docs: https://docs.gladia.io/reference/pre-recorded
      const formData = new FormData();
      formData.append('audio', audioBlob);
      /*Value	Description
manual	manually define the language of the transcription using the language parameter
automatic single language	default value and recommended choice for most cases - the model will auto detect the prominent language in the audio, then transcribe the full audio to that language. Segments in other languages will automatically be translated to the prominent language. The mode is also recommended for scenarios where the audio starts in one language for a short while and then switches to another for the majority of the duration
automatic multiple languages	For specific scenarios where language is changed multiple times throughout the audio (e.g. a conversation between 2 people, each speaking a different language.).
The model will continuously detect the spoken language and switch the transcription language accordingly.
Please note that certain strong accents can possibly cause this mode to transcribe to the wrong language.
*/
      // formData.append('language_behaviour', 'automatic multiple languages');
      formData.append('toggle_diarization', 'false');
      // formData.append('transcription_hint', prompt);
      formData.append('output_format', 'txt');

      interface GladiaResult {
        prediction: string;
      }
      const result: GladiaResult = await (await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
        method: 'POST',
        headers: {
          'x-gladia-key': apiKey
        },
        body: formData
      })).json();
      const resultText = result?.prediction ?? "";
      if (typeof resultText === "string") return resultText;
      return result;
    };

    export const transcribe = async (api: ApiName, audioBlob: Blob, apiKey: string
        , prompt: string = '') => {
      if (!audioBlob) return "";
      const output =
          api === "OpenAI" ?
              await withOpenAi(audioBlob, apiKey, prompt)
              : await withGladia(audioBlob, apiKey, prompt);
      if (typeof output === "string") return output;
      else return JSON.stringify(output, null, 2)
          + '\nYou need an API key. You can get one at https://platform.openai.com/api-keys">.' +
          ' If you want to try it out beforehand, you can try it in the ChatGPT Android and iOS' +
          ' apps for free without API key.\n\n';
    }
  }

  export const replaceByRules = (subject: string, ruleText: string, wholewords = false) => {
    const wordBoundaryMarker = wholewords ? '\\b' : '';
    let count = 0;
    let ruleMatches: any[];
    const ruleParser = /^"(.+?)"([a-z]*?)(?:\r\n|\r|\n)?->(?:\r\n|\r|\n)?"(.*?)"([a-z]*?)(?:\r\n|\r|\n)?$/gmus;
    while (ruleMatches = ruleParser.exec(ruleText)) {
      const target = wordBoundaryMarker+ruleMatches[1]+wordBoundaryMarker;
      console.log("\n" + target + "\n↓↓↓↓↓\n"+ ruleMatches[3]);
      let matchRule = ruleMatches[2].length == 0 ?
          new RegExp(target, 'gmu')
          : new RegExp(target, ruleMatches[2]);
      if (ruleMatches[4] == 'x')
        subject = subject.replace(matchRule, '');
      else
        subject = subject.replace(matchRule, ruleMatches[3]);
      count++;
    }
    return subject;
  }

  export const memoize = <T, R>(func: (...args: T[]) => R): (...args: T[]) => R => {
    const cache = new Map<string, R>();

    return (...args: T[]): R => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key)!;
      } else {
        const result = func(...args);
        cache.set(key, result);
        return result;
      }
    };
  }

  export const extractHighlights = (input: string): string[] => {
    const regex = /={2,3}([^=]+)={2,3}/g;
    let matches = [];
    let match: string[];

    while ((match = regex.exec(input)) !== null) {
      matches.push(match[1].trim());
    }

    return matches;
  };
}