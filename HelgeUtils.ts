// noinspection JSUnusedGlobalSymbols

/**
 * HelgeUtils.ts
 * @description A collection of general utility functions not connected to a
 * specific project.
 *
 * Copyright by Helge Tobias Kosuch 2024 */
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

    /**
     * Displays an alert with the given message and throws the message as an exception.
     *
     * @param msg {String} */
    export const alertAndThrow = (...msg: any) => {
      console.trace();
      alert(msg);
      throw new Error(...msg);
    };

  }

  export const suppressUnusedWarning = (...args: any[]) => {
    const flag = false;
    if (flag) {
      console.log(args);
    }
  };

  export namespace Tests {
    /** Inline this function! */
    export const runTestsOnlyToday = () => {
      const RUN_TESTS = new Date().toISOString().slice(0, 10) === "2024-01-24";
      suppressUnusedWarning(RUN_TESTS)
    };

    export const assert = (condition: boolean, ...output: any[]) => {
      if (condition)
          // Everything is fine, just return:
        return;
      // It is NOT fine! Throw an error:
      console.log(...output);
      HelgeUtils.Exceptions.alertAndThrow(...output);
    };

    export const assertEquals = (actual: any, expected: any, message: string = null) => {
      if (actual !== expected) {
        if (actual instanceof Date && expected instanceof Date
            && actual.getTime()===expected.getTime())
          return;
        console.log("*************** expected:\n" + expected);
        console.log("*************** actual  :\n" + actual);
        if (typeof expected === 'string' && typeof actual === 'string') {
          const expectedShortened = expected.substring(0, 20).replace(/\n/g, '');
          const actualShortened = actual.substring(0, 20).replace(/\n/g, '');
          HelgeUtils.Exceptions.alertAndThrow(message
              || `Assertion failed: Expected ${expectedShortened}, but got ${actualShortened}`);
        }
        HelgeUtils.Exceptions.alertAndThrow(message
            || `Assertion failed: Expected ${expected}, but got ${actual}`);
      }
    };
  }

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
automatic single language	default value and recommended choice for most cases - the model will auto-detect the prominent language in the audio, then transcribe the full audio to that language. Segments in other languages will automatically be translated to the prominent language. The mode is also recommended for scenarios where the audio starts in one language for a short while and then switches to another for the majority of the duration
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

  export namespace ReplaceByRules {
    export class ReplaceRules {
      public constructor(private rules: string) {
      }

      public applyTo = (subject: string) => {
        return replaceByRules(subject, this.rules, false, false).resultingText;
      };
      public applyToWithLog = (subject: string) => {
        return replaceByRules(subject, this.rules, false, true);
      }
    }

    export class WholeWordReplaceRules {
      public constructor(private rules: string) {
      }

      public applyTo = (subject: string) => {
        return replaceByRules(subject, this.rules, true, false).resultingText;
      };
      public applyToWithLog = (subject: string) => {
        return replaceByRules(subject, this.rules, true, true);
      }
    }

    export class WholeWordPreserveCaseReplaceRules {
      public constructor(private rules: string) {
      }

      public applyTo = (subject: string) => {
        return replaceByRules(subject, this.rules, true, false, true).resultingText;
      };
      public applyToWithLog = (subject: string) => {
        return replaceByRules(subject, this.rules, true, true, true);
      }
    }

    /**
     * Deprecated! Use ReplaceRules or WholeWordReplaceRules instead.
     *
     * Do NOT change the syntax of the rules, because they must be kept compatible with https://github.com/No3371/obsidian-regex-pipeline#readme
     */
    export const replaceByRules = (subject: string, allRules: string, wholeWords = false
        , logReplacements = false, preserveCase = false) => {
      const possiblyWordBoundaryMarker = wholeWords ? '\\b' : '';
      let count = 0;
      const ruleParser = /^"(.+?)"([a-z]*?)(?:\r\n|\r|\n)?->(?:\r\n|\r|\n)?"(.*?)"([a-z]*?)(?:\r\n|\r|\n)?$/gmus;
      let log = '';

      function applyRule(rawTarget: string, regexFlags: string, replacementString: string, replacementFlags: string) {
        const target = possiblyWordBoundaryMarker + rawTarget + possiblyWordBoundaryMarker;
        // console.log("\n" + target + "\n↓↓↓↓↓\n"+ replacement);
        let regex = regexFlags.length == 0 ?
            new RegExp(target, 'gm') // Noted that gm flags are basically necessary for this plugin to be useful, you seldom want to replace only 1 occurrence or operate on a note only contains 1 line.
            : new RegExp(target, regexFlags);
        if (logReplacements && subject.search(regex) !== -1) {
          log += `${count} ${rule}\n`;
        }
        if (replacementFlags == 'x')
          subject = subject.replace(regex, '');
        else
          subject = subject.replace(regex, replacementString);
        count++;
      }

      let rule: RegExpExecArray;
      while (rule = ruleParser.exec(allRules)) {
        const [
          , target
          , regexFlags
          , replacementString
          , replacementFlags
        ] = rule;
        applyRule(target, regexFlags, replacementString, replacementFlags);
        if (preserveCase) {
          applyRule(
              Strings.toUppercaseFirstChar(target), regexFlags,
              Strings.toUppercaseFirstChar(replacementString), replacementFlags);
        }
      }
      return {
        resultingText: subject,
        log: log
      };
    };

  /**
   * Deprecated! Use ReplaceRules or WholeWordReplaceRules instead.
   */
    export const replaceByRulesAsString = (subject: string, allRules: string) => {
      return replaceByRules(subject, allRules, false, false).resultingText;
    }
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
  };

  export const extractHighlights = (input: string): string[] => {
    const regex = /={2,3}([^=]+)={2,3}/g;
    let matches = [];
    let match: string[];

    while ((match = regex.exec(input)) !== null) {
      matches.push(match[1].trim());
    }

    return matches;
  };

  export namespace Strings {
    export const toUppercaseFirstChar = (input: string): string => {
      if (input.length === 0) return input;

      const specialChars: { [key: string]: string } = {
        'ü': 'Ü',
        'ö': 'Ö',
        'ä': 'Ä'
      };

      const firstChar = input.charAt(0);
      return (specialChars[firstChar] || firstChar.toLocaleUpperCase()) + input.slice(1);
    };

    export const escapeRegExp = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    };
  }

  export namespace Misc {
    // noinspection SpellCheckingInspection
    /**
     * Converts "Du" to "Ich" and "Dein" to "Mein" and so on.
     */
    export const du2ich = (input: string,
         replaceFunction = (rules: string,input: string) =>
         new ReplaceByRules.WholeWordPreserveCaseReplaceRules(rules).applyTo(input)
    ) => {
/**
 * Only WHOLE words are replaced.
 */
const rules1 = `
"findest"->"finde"
"bist"->"bin"
"dein"->"mein"
"deine"->"meine"
"deiner"->"meiner"
"dich"->"mich"
"dir"->"mir"
"du"->"ich"
"hast"->"habe"
"liest"->"lese"
"machst"->"mache"
"willst"->"will"
"kannst"->"kann"
"wirst"->"werde"
:: by GPT-4:
"bist"->"bin"
"hast"->"habe"
"sagst"->"sage"
"machst"->"mache"
"gehst"->"gehe"
"weißt"->"weiß"
"kommst"->"komme"
"siehst"->"sehe"
"willst"->"will"
"kannst"->"kann"
"musst"->"muss"
"nimmst"->"nehme"
"findest"->"finde"
"gibst"->"gebe"
"arbeitest"->"arbeite"
"spielst"->"spiele"
"lernst"->"lerne"
"verstehst"->"verstehe"
"brauchst"->"brauche"
"liest"->"lese"
"schreibst"->"schreibe"
"lebst"->"lebe"
"denkst"->"denke"
"fühlst"->"fühle"
"nennst"->"nenne"
"zeigst"->"zeige"
"hörst"->"höre"
"hältst"->"halte"
"bringst"->"bringe"
"bleibst"->"bleibe"
"schläfst"->"schlafe"
"trägst"->"trage"
"fährst"->"fahre"
"isst"->"esse"
"trinkst"->"trinke"
"läufst"->"laufe"
"redest"->"rede"
"wartest"->"warte"
"kaufst"->"kaufe"
"kochst"->"koche"
"triffst"->"treffe"
"setzt"->"setze"
"öffnest"->"öffne"
"lächelst"->"lächle"
"verlierst"->"verliere"
"vergisst"->"vergesse"
"beginnst"->"beginne"
"leihst"->"leihe"
"rettest"->"rette"
"hilfst"->"helfe"
"entscheidest"->"entscheide"
"erinnerst"->"erinnere"
"versuchst"->"versuche"
"verwendest"->"verwende"
"änderst"->"ändere"
"glaubst"->"glaube"
"betrachtest"->"betrachte"
"erreichst"->"erreiche"
"verlässt"->"verlasse"
"schickst"->"schicke"
"empfiehlst"->"empfehle"
"sammelst"->"sammle"
"erkennst"->"erkenne"
"studierst"->"studiere"
"diskutierst"->"diskutiere"
"überlegst"->"überlege"
"vermeidest"->"vermeide"
"beobachtest"->"beobachte"
"übernimmst"->"übernehme"
"bezahlst"->"bezahle"
"bestehst"->"bestehe"
"versteckst"->"verstecke"
"entdeckst"->"entdecke"
"überzeugst"->"überzeuge"
"bedienst"->"bediene"
"beschwerst"->"beschwere"
"erklärst"->"erkläre"
"entspannst"->"entspanne"
"erholst"->"erhole"
"wunderst"->"wundere"
"reinigst"->"reinige"
"rufst"->"rufe"
"antwortest"->"antworte"
"folgst"->"folge"
"bedankst"->"bedanke"
"interessierst"->"interessiere"
"erschreckst"->"erschrecke"
"verfolgst"->"verfolge"
"veränderst"->"verändere"
"überprüfst"->"überprüfe"
"bedeckst"->"bedecke"
"beschützt"->"beschütze"
"erwärmst"->"erwärme"
"erlaubst"->"erlaube"
"verbesserst"->"verbessere"
"wiederholst"->"wiederhole"
"verteidigst"->"verteidige"
"beurteilst"->"beurteile"
"sortierst"->"sortiere"
"verbindest"->"verbinde"
"vergrößerst"->"vergrößere"
"reduzierst"->"reduziere"
"begeisterst"->"begeistere"
"ermunterst"->"ermuntere"
"inspirierst"->"inspiriere"
"übertriffst"->"übertriff"
"vereinfachst"->"vereinfache"
"vervollständigst"->"vervollständige"
"erweiterst"->"erweitere"
"vervielfältigst"->"vervielfältige"
"stabilisierst"->"stabilisiere"
"intensivierst"->"intensiviere"
"optimierst"->"optimiere"
"standardisierst"->"standardisiere"
"maximierst"->"maximiere"
"minimierst"->"minimiere"
"rationalisierst"->"rationalisiere"
"individualisierst"->"individualisiere"
"priorisierst"->"priorisiere"
"diversifizierst"->"diversifiziere"
"spezialisierst"->"spezialisiere"
"akzentuierst"->"akzentuiere"
"harmonisierst"->"harmonisiere"
"synchronisierst"->"synchronisiere"
"analysierst"->"analysiere"
"diagnostizierst"->"diagnostiziere"
"prognostizierst"->"prognostiziere"
"synthetisierst"->"synthetisiere"
"resümierst"->"resümiere"
"kommentierst"->"kommentiere"
"kritisierst"->"kritisiere"
"interpretierst"->"interpretiere"
"illustrierst"->"illustriere"
"manifestierst"->"manifestiere"
"demonstrierst"->"demonstriere"
"präsentierst"->"präsentiere"
"repräsentierst"->"repräsentiere"
"assozierst"->"assoziiere"
"differenzierst"->"differenziere"
"klassifizierst"->"klassifiziere"
"kategorisierst"->"kategorisiere"
"identifizierst"->"identifiziere"
"quantifizierst"->"quantifiziere"
"qualifizierst"->"qualifiziere"
"validierst"->"validiere"
"zertifizierst"->"zertifiziere"
"autorisierst"->"autorisiere"
"legitimierst"->"legitimiere"
"verifizierst"->"verifiziere"
"authentifizierst"->"authentifiziere"
"zivilisierst"->"zivilisiere"
"sozialisierst"->"sozialisiere"
"demokratisierst"->"demokratisiere"
"politisierst"->"politisiere"
"ideologisierst"->"ideologisiere"
"symbolisierst"->"symbolisiere"
"metaphorisierst"->"metaphorisiere"
"allegorisierst"->"allegorisiere"
"ironisierst"->"ironisiere"
"satirisierst"->"satirisiere"
"parodierst"->"parodiere"
"karikierst"->"karikiere"
"stilisierst"->"stilisiere"
"ästhetisierst"->"ästhetisiere"
"dramatisierst"->"dramatisiere"
"romantisierst"->"romantisiere"
"poetisierst"->"poetisiere"
"philosophierst"->"philosophiere"
"theologisierst"->"theologisiere"
"ethisierst"->"ethisiere"
"moralisierst"->"moralisiere"
"rationalisierst"->"rationalisiere"
"logisierst"->"logisiere"
"mathematisierst"->"mathematisiere"
"digitalisierst"->"digitalisiere"
`;
      /**
       * Here also partial words are replaced.*/
// const rules2 = `
//     "I"->"Ist"
//     "i"->"ist"
// "\\berst\\b"->"x(ersxt)x"
// :: Bug: The following does not work for all occurrences: //TODOh
// "st\\b"->""
// `;
// noinspection SpellCheckingInspection
      /**
       * Here also partial words are replaced.*/
// const rules3 = `
// "\\bx\\(ersxt\\)x\\b"->"erst"
// `;
      const applyRules1 = (input: string) => replaceFunction(rules1, input);
// const applyRules2 = (input: string) => ReplaceByRules.withUiLog(rules2, input);
// const applyRules3 = (input: string) => ReplaceByRules.withUiLog(rules3, input);
      return (
// applyRules3
          (
// applyRules2
          (
              applyRules1(input))));
    } //end of namespace du2ich

  }
}