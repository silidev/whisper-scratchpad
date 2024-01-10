export namespace HelgeUtils {

  export namespace Exceptions {
    /**
     * Reporting of exceptions in callbacks is sometimes very bad.
     * Therefore, exceptions should always be caught and then passed
     * to this function, which alerts in a useful way.
     *
     * This also used to re-throw, but sometimes that is not good,
     * thus think about if you want to do this after calling this.
     *
     * Use this to throw an exception with a stack trace:
     *    throw new Error("Some useful error message");
     *
     * @return void
     *
     * @param e {Error} The exception, preferably of type Error,
     *        because then a stack trace will be displayed.
     <pre>
     IntelliJ Live Template
     <template name="try-catch-unhandled-exception" value="try {&#10;    $SELECTION$&#10;} catch(e) {&#10;    unhandledExceptionAlert(e);&#10;}" description="" toReformat="true" toShortenFQNames="true">
     <context>
     <option name="JAVA_SCRIPT" value="true" />
     <option name="JSX_HTML" value="false" />
     <option name="JS_CLASS" value="false" />
     <option name="JS_DOT_PROPERTY_ACCESS" value="false" />
     <option name="JS_EXPRESSION" value="false" />
     </context>
     </template>
     </pre>*/
    export const unhandledExceptionAlert = (e: Error) => {
      let str = "Unhandled EXCEPTION! :" + e;
      if (e instanceof Error) {
        str += ", Stack trace:\n";
        str += e.stack;
      }
      /* Do NOT call console.trace() here because the stack trace
         of this place here is not helpful, but instead very
         confusing. */
      console.log(str);
      alert(str);
      return str;
    };

    /**
     * Calls the function and swallows any exceptions. */
    export const callSwallowingExceptions = (f: () => void) => {
      try {
        f();
      } catch (err) {
        console.log("Ignored: ");
        console.log(err);
      }
    };
  }

  export const suppressUnusedWarning = (...args: any[]) => {
    const flag = false;
    if (flag) {
      console.log(args);
    }
  };

  export namespace Transcription {

    export class TranscriptionError extends Error {
      public payload: {};
      constructor(payload: {}) {
        super("TranscriptionError");
        this.name = "TranscriptionError";
        this.payload = payload;
      }
    }

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
      if (!audioBlob || audioBlob.size===0) return "";
      const output =
          api === "OpenAI" ?
              await withOpenAi(audioBlob, apiKey, prompt)
              : await withGladia(audioBlob, apiKey, prompt);
      if (typeof output === "string") return output;
      throw new TranscriptionError(output);
    }
  }

  export const replaceByRulesAsString = (subject: string, allRules: string) => {
    return replaceByRules(subject, allRules, false, false) as string;
  }

  /**
   * Do NOT change the syntax of the rules, because they must be kept compatible with https://github.com/No3371/obsidian-regex-pipeline#readme
   */
  export const replaceByRules = (subject: string, allRules: string, wholeWords = false
                                 , logReplacements = false) => {
    const possiblyWordBoundaryMarker = wholeWords ? '\\b' : '';
    let count = 0;
    let rule: any[];
    const ruleParser = /^"(.+?)"([a-z]*?)(?:\r\n|\r|\n)?->(?:\r\n|\r|\n)?"(.*?)"([a-z]*?)(?:\r\n|\r|\n)?$/gmus;
    let log = '';
    while (rule = ruleParser.exec(allRules)) {

      const target = possiblyWordBoundaryMarker + rule[1] + possiblyWordBoundaryMarker;
      const regexFlags = rule[2];
      const replacement = rule[3];
      const replacementFlags = rule[4];

      // console.log("\n" + target + "\n↓↓↓↓↓\n"+ replacement);
      let regex = regexFlags.length == 0 ?
          new RegExp(target, 'gm') // Noted that gm flags are basically necessary for this plugin to be useful, you seldom want to replace only 1 occurrence or operate on a note only contains 1 line.
          : new RegExp(target, regexFlags);
      if (subject.search(regex) !== -1) {
        // A match was found
        log += `${count} ${rule}\n`;
      }
      if (replacementFlags == 'x')
        subject = subject.replace(regex, '');
      else
        subject = subject.replace(regex, replacement);
      count++;
    }
    if (logReplacements) {
      return {
        result: subject,
        log: log
      };
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