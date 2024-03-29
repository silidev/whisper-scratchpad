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
     *    throw new Error("Some useful error message")
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
    export const unhandledExceptionAlert = (e: Error | string) => {
      let str = "Unhandled EXCEPTION! :" + e
      if (e instanceof Error) {
        str += ", Stack trace:\n"
        str += e.stack
      }
      /* Do NOT call console.trace() here because the stack trace
         of this place here is not helpful, but instead very
         confusing. */
      console.log(str)
      alert(str)
      return str
    }

    // noinspection JSArrowFunctionBracesCanBeRemoved
    /** swallowAll
     * Wraps the given void function in a try-catch block and swallows any exceptions.
     *
     * Example use:
          const produceError = () => {throw "error"}
          const noError = swallowAll(produceError);
          noError(); // Does NOT throw an exception.
     *
     * @param func
     */
    export const swallowAll =
        <T>(func: (...args: T[]) => void): (...args: T[]) => void => {
          return (...args: T[]): void => {
            try {
              func(...args)
            } catch (e) {
            }
          }
        }
    ;

    /** Alias for swallowAll
     * @deprecated */
    export const catchAll = swallowAll;

    /** Alias for swallowAll
     * @deprecated */
    export const unthrow = swallowAll;

    /**
     * Calls the function and swallows any exceptions. */
    export const callSwallowingExceptions = (f: () => void) => {
      try {
        f()
      } catch (err) {
        console.log("Ignored: ")
        console.log(err)
      }
    }

    /**
     * Displays an alert with the given message and throws the message as an exception.
     *
     * @param msg {String} */
    export const alertAndThrow = (...msg: any) => {
      console.trace()
      alert(msg)
      throw new Error(...msg)
    }

  }

  export const suppressUnusedWarning = (...args: any[]) => {
    const flag = false
    if (flag) {
      console.log(args)
    }
  }

  export namespace Tests {
    /** Inline this function! */
    export const runTestsOnlyToday = () => {
      const RUN_TESTS = new Date().toISOString().slice(0, 10) === "2024-01-24"
      suppressUnusedWarning(RUN_TESTS)
    }

    export const assert = (condition: boolean, ...output: any[]) => {
      if (condition)
          // Everything is fine, just return:
        return
      // It is NOT fine! Throw an error:
      console.log(...output)
      HelgeUtils.Exceptions.alertAndThrow(...output)
    }

    export const assertEquals = (actual: any, expected: any, message: string | null = null) => {
      if (actual !== expected) {
        if (actual instanceof Date && expected instanceof Date
            && actual.getTime()===expected.getTime())
          return
        console.log("*************** expected:\n" + expected)
        console.log("*************** actual  :\n" + actual)
        // if (typeof expected === 'string' && typeof actual === 'string') {
        //   const expectedShortened = expected.substring(0, 20).replace(/\n/g, '')
        //   const actualShortened = actual.substring(0, 20).replace(/\n/g, '')
        //   // HelgeUtils.Exceptions.alertAndThrow(message
        //   //     || `Assertion failed: Expected ${expectedShortened}, but got ${actualShortened}`)
        // }
        console.log(message
             || `Assertion failed: Expected ${expected}, but got ${actual}`)
      }
    }
  }

  export namespace Strings {
    import assertEquals = HelgeUtils.Tests.assertEquals

    /** Returns the index of the first occurrence of the given regex in the string.
     *
     * @param input
     * @param regex
     * @param startpos
     */
    export const regexIndexOf = (input: string, regex: RegExp, startpos: number) => {
      const indexOf = input.substring(startpos || 0).search(regex);
      return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    };

    /**
     * @deprecated Use regexIndexOf instead.
     * @see regexIndexOf
     */
    export const indexOfWithRegex = regexIndexOf

    export const regexLastIndexOf = (input: string, regex: RegExp, startpos: number) => {
      regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiline ? "m" : ""));
      if(typeof (startpos) == "undefined") {
        startpos = input.length;
      } else if(startpos < 0) {
        startpos = 0;
      }
      const stringToWorkWith = input.substring(0, startpos + 1);
      let lastIndexOf = -1;
      let nextStop = 0;
      let result;
      while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
      }
      return lastIndexOf;
    };

    /**
     * @deprecated Use regexLastIndexOf instead.
     */
    export const lastIndexOfWithRegex = regexLastIndexOf

    /**
     * Trim whitespace but leave a single newline at the end if there is
     * any whitespace that includes a newline.
     */
    export const trimExceptASingleNewlineAtTheEnd = (input: string): string => {
      // Check for whitespace including a newline at the end
      if (/\s*\n\s*$/.test(input)) {
        // Trim and leave a single newline at the end
        return input.replace(/\s+$/, '\n')
      } else {
        // Just trim normally
        return input.trim()
      }
    }

    export const toUppercaseFirstChar = (input: string): string => {
      if (input.length === 0) return input

      const specialChars: { [key: string]: string } = {
        'ü': 'Ü',
        'ö': 'Ö',
        'ä': 'Ä'
      }

      const firstChar = input.charAt(0)
      return (specialChars[firstChar] || firstChar.toLocaleUpperCase()) + input.slice(1)
    }

    export const escapeRegExp = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    /**
     * text.substring(leftIndex, rightIndex) is the string between the delimiters. */
    export class DelimiterSearch {
      constructor(public delimiter: string) {
      }
      public leftIndex(text: string, startIndex: number) {
        return DelimiterSearch.index(this.delimiter, text, startIndex, false)
      }
      public rightIndex(text: string, startIndex: number) {
        return DelimiterSearch.index(this.delimiter, text, startIndex, true)
      }
      /** If search backwards the position after the delimiter is */
      private static index(delimiter: string, text: string, startIndex: number, searchForward: boolean) {
        const searchBackward = !searchForward
        if (searchBackward) {
          if (startIndex === 0) return 0
          // If the starIndex is at the start of a delimiter we want to return the index of the start of the string before this delimiter:
          startIndex--
        }
        const step = searchForward ? 1 : -1
        for (let i = startIndex; searchForward ? i < text.length : i >= 0; i += step) {
          if (text.substring(i, i + delimiter.length) === delimiter) {
            return i
                + (searchForward ? 0 : delimiter.length)
          }
        }
        return searchForward ? text.length : 0
      }
      public static runTests = () => {
        this.testDelimiterSearch()
        this.testDeleteBetweenDelimiters()
      }
      private static testDelimiterSearch = () => {
        const delimiter = '---\n'
        const instance = new DelimiterSearch(delimiter)

        const runTest = (input: string, index: number, expected: string) =>
            assertEquals(input.substring(
                    instance.leftIndex(input, index),
                    instance.rightIndex(input, index)),
                expected)
        {
          const inputStr = "abc" + delimiter
          runTest(inputStr, 0, "abc")
          runTest(inputStr, 3, "abc")
          runTest(inputStr, 4, "")
          runTest(inputStr, 3+delimiter.length, "")
          runTest(inputStr, 3+delimiter.length+1, "")
        }
        {
          const inputStr =  delimiter + "abc"
          runTest(inputStr, 0, "")
          runTest(inputStr, delimiter.length, "abc")
          runTest(inputStr, delimiter.length+3, "abc")
        }
      }
      /** Deletes a note from the given text.
       * @param input - The text to delete from.
       * @param left - The index of the left delimiter.
       * @param right - The index of the right delimiter.
       * @param delimiter - The delimiter.
       * */
      public static deleteNote = (input: string, left: number, right: number, delimiter: string) => {
        const str1 = (input.substring(0, left) + input.substring(right)).replaceAll(delimiter+delimiter, delimiter)
        if (str1===delimiter+delimiter) return ""
        if (str1.startsWith(delimiter)) return str1.substring(delimiter.length)
        if (str1.endsWith(delimiter)) return str1.substring(0, str1.length - delimiter.length)
        return str1
      }
      private static testDeleteBetweenDelimiters = () => {
        const delimiter = ')))---(((\n'
        const runTest = (cursorPosition: number, input: string, expected: string) => {
          const delimiterSearch = new Strings.DelimiterSearch(delimiter)
          const left = delimiterSearch.leftIndex(input, cursorPosition)
          const right = delimiterSearch.rightIndex(input, cursorPosition)
          assertEquals(DelimiterSearch.deleteNote(input, left, right, delimiter), expected)
        }
        runTest(0, "abc" + delimiter, "")
        runTest(delimiter.length, delimiter + "abc", "")
        runTest(delimiter.length, delimiter + "abc" + delimiter, "")
        runTest(1+delimiter.length, "0" + delimiter + "abc" + delimiter + "1",  "0"+delimiter+"1")
      }
    } //end of class DelimiterSearch
    export function runTests() {
      DelimiterSearch.runTests()
    }
  } //end of namespace Strings

  export const runTests = () => {
    Strings.runTests()
  }

  export namespace Transcription {

    export class TranscriptionError extends Error {
      public payload: {}
      constructor(payload: {}) {
        super("TranscriptionError")
        this.name = "TranscriptionError"
        this.payload = payload
      }
    }

    export type ApiName = "OpenAI" | "Gladia"

    /** Transcribes the given audio blob using the given API key and prompt.
     *
     * @param audioBlob
     * @param apiKey
     * @param prompt Ignored if translateToEnglish==true
     * @param language
     * @param translateToEnglish
     */
    const withOpenAi = async (audioBlob: Blob, apiKey: string, prompt: string,
                              language: string = "", translateToEnglish = false) => {
      const formData = new FormData()
      formData.append('file', audioBlob)
      formData.append('model', 'whisper-1'); // Using the largest model
      if (!translateToEnglish)
        formData.append('prompt', prompt)
      /*  */
      formData.append('language', language) // e.g. "en". The language of the input audio. Supplying the input language in ISO-639-1 format will improve accuracy and latency.

      // formData.append('temperature', WHISPER_TEMPERATURE) // temperature number Optional
      // Defaults to 0 The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use log probability to automatically increase the temperature until certain thresholds are hit. https://platform.openai.com/docs/api-reference/audio/createTranscription#audio-createtranscription-temperature

      /* Docs: https://platform.openai.com/docs/api-reference/audio/createTranscription */
      const response = await fetch(
          "https://api.openai.com/v1/audio/"
          +(translateToEnglish?'translations':'transcriptions')
          , {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      })
      const result = await response.json()
      if (typeof result.text === "string") return result.text
      return result
    }

    const withGladia = async (audioBlob: Blob, apiKey: string, prompt: string = '',
                              language: string | null = null) => {
      suppressUnusedWarning(prompt)
      // Docs: https://docs.gladia.io/reference/pre-recorded
      const formData = new FormData()
      formData.append('audio', audioBlob)
      /*Value	Description
manual	manually define the language of the transcription using the language parameter
automatic single language	default value and recommended choice for most cases - the model will auto-detect the prominent language in the audio, then transcribe the full audio to that language. Segments in other languages will automatically be translated to the prominent language. The mode is also recommended for scenarios where the audio starts in one language for a short while and then switches to another for the majority of the duration
automatic multiple languages	For specific scenarios where language is changed multiple times throughout the audio (e.g. a conversation between 2 people, each speaking a different language.).
The model will continuously detect the spoken language and switch the transcription language accordingly.
Please note that certain strong accents can possibly cause this mode to transcribe to the wrong language.
*/
      if (language)
        formData.append('language_behaviour', 'automatic multiple languages')

      formData.append('toggle_diarization', 'false')
      // formData.append('transcription_hint', prompt)
      formData.append('output_format', 'txt')

      interface GladiaResult {
        prediction: string
      }
      const result: GladiaResult = await (await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
        method: 'POST',
        headers: {
          'x-gladia-key': apiKey
        },
        body: formData
      })).json()
      const resultText = result?.prediction
      return resultText
    }

    export const transcribe = async (api: ApiName, audioBlob: Blob, apiKey: string,
                                     prompt: string = '', language: string = "",
                                     translateToEnglish = false) =>
    {
      if (!audioBlob || audioBlob.size===0) return ""
      const output =
          api === "OpenAI" ?
              await withOpenAi(audioBlob, apiKey, prompt, language, translateToEnglish)
              : await withGladia(audioBlob, apiKey, prompt)
      if (typeof output === "string") return output
      throw new TranscriptionError(output)
    }
  }

  /* NOT reliable in Anki and AnkiDroid. */
  export namespace ReplaceByRules {
    export class ReplaceRules {
      public constructor(private rules: string) {
      }

      public applyTo = (subject: string) => {
        return replaceByRules(subject, this.rules, false, false).resultingText
      }
      public applyToWithLog = (subject: string) => {
        return replaceByRules(subject, this.rules, false, true)
      }
    }

    export class WholeWordReplaceRules {
      public constructor(private rules: string) {
      }

      public applyTo = (subject: string) => {
        return replaceByRules(subject, this.rules, true, false).resultingText
      }
      public applyToWithLog = (subject: string) => {
        return replaceByRules(subject, this.rules, true, true)
      }
    }

    export class WholeWordPreserveCaseReplaceRules {
      public constructor(private rules: string) {
      }

      public applyTo = (subject: string) => {
        return replaceByRules(subject, this.rules, true, false, true).resultingText
      }
      public applyToWithLog = (subject: string) => {
        return replaceByRules(subject, this.rules, true, true, true)
      }
    }

    /**
     * NOT reliable in Anki and AnkiDroid.
     *
     * Deprecated! Use ReplaceRules or WholeWordReplaceRules instead.
     *
     * Do NOT change the syntax of the rules, because they must be kept compatible with
     * https://github.com/No3371/obsidian-regex-pipeline#readme
     *
     * @param subject - The text to replace in.
     * @param allRules - The rules to apply.
     * @param wholeWords - If true, only whole words are replaced.
     * @param logReplacements - If true, a log of the replacements is returned.
     * @param preserveCase - If true, the case of the replaced word is preserved.
     */
    export const replaceByRules = (subject: string, allRules: string, wholeWords = false
        , logReplacements = false, preserveCase = false) => {
      const possiblyWordBoundaryMarker = wholeWords ? '\\b' : ''
      let count = 0
      let log = ''

      function applyRule(rawTarget: string, regexFlags: string,
                         replacementString: string, replacementFlags: string) {
        const target = possiblyWordBoundaryMarker + rawTarget
            + possiblyWordBoundaryMarker
        // console.log("\n" + target + "\n↓↓↓↓↓\n"+ replacement)
        let regex = regexFlags.length == 0 ?
            new RegExp(target, 'gm') // Noted that gm flags are basically
            // necessary for this plugin to be useful, you seldom want to
            // replace only 1 occurrence or operate on a note only contains 1 line.
            : new RegExp(target, regexFlags)
        if (logReplacements && subject.search(regex) !== -1) {
          log += `${count} ${rule}\n`
        }
        if (replacementFlags == 'x')
          subject = subject.replace(regex, '')
        else
          subject = subject.replace(regex, replacementString)
        count++
      }

      let rule: RegExpExecArray | null
      const ruleParser = /^"(.+?)"([a-z]*?)(?:\r\n|\r|\n)?->(?:\r\n|\r|\n)?"(.*?)"([a-z]*?)(?:\r\n|\r|\n)?$/gmus
      while (
          rule = ruleParser.exec(allRules) /* This works fine in a Chrome
           but at least sometimes returns falsely null inside Anki and
            AnkiDroid. */
          ) {
        const [
          , target
          , regexFlags
          , replacementString
          , replacementFlags
        ] = rule
        applyRule(target, regexFlags, replacementString, replacementFlags)
        if (preserveCase) {
          applyRule(
              Strings.toUppercaseFirstChar(target), regexFlags,
              Strings.toUppercaseFirstChar(replacementString), replacementFlags)
        }
      }
      return {
        resultingText: subject,
        log: log
      }
    }

  /**
   * Deprecated! Use ReplaceRules or WholeWordReplaceRules instead.
   */
    export const replaceByRulesAsString = (subject: string, allRules: string) => {
      return replaceByRules(subject, allRules, false, false).resultingText
    }
  }

  export const memoize = <T, R>(func: (...args: T[]) => R): (...args: T[]) => R => {
    const cache = new Map<string, R>()

    return (...args: T[]): R => {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)!
      } else {
        const result = func(...args)
        cache.set(key, result)
        return result
      }
    }
  }

  export const extractHighlights = (input: string): string[] => {
    const regex = /={2,3}([^=]+)={2,3}/g
    let matches: string[] = []
    let match: string[] | null

    while ((match = regex.exec(input)) !== null) {
      matches.push(match[1].trim())
    }

    return matches
  }

  export namespace Misc {
    /** nullFilter
     *
     * Throws an exception if the input is null.
     *
     * I use "strictNullChecks": true to avoid bugs. Therefore, I need this
     * where that is too strict.
     *
     * Use example:
     * const elementWithId = (id: string) =>
     *   nullFilter<HTMLElement>(HtmlUtils.elementWithId, id)
     */
    export const nullFilter = <T>(f: Function, ...parameters: any ): T => {
      const untypedNullFilter = (input: any) => {
        if (input === null)
          Exceptions.alertAndThrow(`Unexpected null value.`)
        return input
      }
      return untypedNullFilter(f(...parameters)) as T
    }

    // noinspection SpellCheckingInspection
    /**
     * Converts "Du" to "Ich" and "Dein" to "Mein" and so on.
     */
    export const du2ich = (input: string) => {
      const replacements = [
              ["abstellst","abstelle"                ],
          ["aktivierst","aktiviere"              ],
          ["aktualisierst","aktualisiere"        ],
          ["akzentuierst","akzentuiere"          ],
          ["akzeptierst","akzeptiere"            ],
          ["allegorisierst","allegorisiere"      ],
          ["analysierst","analysiere"            ],
          ["anstellst","anstelle"                ],
          ["antwortest","antworte"               ],
          ["arbeitest","arbeite"                 ],
          ["assoziierst","assoziiere"            ],
          ["assoziiert","assoziiere"             ],
          ["authentifizierst","authentifiziere"  ],
          ["autorisierst","autorisiere"          ],
          ["basiert","basiere"                   ],
          ["baust","baue"                        ],
          ["beachtest","beachte"                 ],
          ["bearbeitest","bearbeite"             ],
          ["bedankst","bedanke"                  ],
          ["bedeckst","bedecke"                  ],
          ["bedenkst","bedenke"                  ],
          ["bedeutest","bedeute"                 ],
          ["bedienst","bediene"                  ],
          ["beeinflusst","beeinflusse"           ],
          ["beeinträchtigst","beeinträchtige"    ],
          ["beendest","beende"                   ],
          ["befasst","befasse"                   ],
          ["befindest","befinde"                 ],
          ["begeisterst","begeistere"            ],
          ["beginnst","beginne"                  ],
          ["begrüßt","begrüße"                   ],
          ["behandelst","behandle"               ],
          ["behauptest","behaupte"               ],
          ["behältst","behalte"                  ],
          ["bekommst","bekomme"                  ],
          ["bekämpfst","bekämpfe"                ],
          ["bemühst","bemühe"                    ],
          ["benutzt","benutze"                   ],
          ["benötigst","benötige"                ],
          ["beobachtest","beobachte"             ],
          ["berechnest","berechne"               ],
          ["bereitest","bereite"                 ],
          ["berichtest","berichte"               ],
          ["beruhst","beruhe"                    ],
          ["berücksichtigst","berücksichtige"    ],
          ["beschleunigst","beschleunige"        ],
          ["beschränkst","beschränke"            ],
          ["beschwerst","beschwere"              ],
          ["beschäftigst","beschäftige"          ],
          ["beschützt","beschütze"               ],
          ["besitzt","besitze"                   ],
          ["bestehst","bestehe"                  ],
          ["bestimmst","bestimme"                ],
          ["bestätigst","bestätige"              ],
          ["besuchst","besuche"                  ],
          ["betonst","betone"                    ],
          ["betrachtest","betrachte"             ],
          ["betreibst","betreibe"                ],
          ["betrifft","betrifft"                 ],
          ["beurteilst","beurteile"              ],
          ["bewegst","bewege"                    ],
          ["beweist","beweise"                   ],
          ["bewertest","bewerte"                 ],
          ["bewirkst","bewirke"                  ],
          ["bezahlst","bezahle"                  ],
          ["beziehst","beziehe"                  ],
          ["bietest","biete"                     ],
          ["bildest","bilde"                     ],
          ["bist","bin"                          ],
          ["bittest","bitte"                     ],
          ["bleibst","bleibe"                    ],
          ["brauchst","brauche"                  ],
          ["breitest","breite"                   ],
          ["brichst","breche"                    ],
          ["bringst","bringe"                    ],
          ["dankst","danke"                      ],
          ["darfst","darf"                       ],
          ["deaktivierst","deaktiviere"          ],
          ["deckst","decke"                      ],
          ["definierst","definiere"              ],
          ["dein","mein"                         ],
          ["deine","meine"                       ],
          ["deiner","meiner"                     ],
          ["demokratisierst","demokratisiere"    ],
          ["demonstrierst","demonstriere"        ],
          ["denkst","denke"                      ],
          ["diagnostizierst","diagnostiziere"    ],
          ["dich","mich"                         ],
          ["dienst","diene"                      ],
          ["differenzierst","differenziere"      ],
          ["digitalisierst","digitalisiere"      ],
          ["dir","mir"                           ],
          ["diskutierst","diskutiere"            ],
          ["diversifizierst","diversifiziere"    ],
          ["doppelst","dopple"                   ],
          ["dramatisierst","dramatisiere"        ],
          ["drehst","drehe"                      ],
          ["drittelst","drittele"                ],
          ["druckst","drucke"                    ],
          ["drückst","drücke"                    ],
          ["du","ich"                            ],
          ["einst","ein"                         ],
          ["empfiehlst","empfehle"               ],
          ["empfängst","empfange"                ],
          ["endest","ende"                       ],
          ["entdeckst","entdecke"                ],
          ["entfernst","entferne"                ],
          ["enthältst","enthalte"                ],
          ["entscheidest","entscheide"           ],
          ["entschuldigst","entschuldige"        ],
          ["entspannst","entspanne"              ],
          ["entsprichst","entspreche"            ],
          ["entstehst","entstehe"                ],
          ["entwickelst","entwickle"             ],
          ["erfasst","erfasse"                   ],
          ["erfolgst","erfolge"                  ],
          ["erforderst","erfordere"              ],
          ["erfährst","erfahre"                  ],
          ["erfüllst","erfülle"                  ],
          ["ergibst","ergebe"                    ],
          ["ergreifst","ergreife"                ],
          ["erhebst","erhebe"                    ],
          ["erholst","erhole"                    ],
          ["erhältst","erhalte"                  ],
          ["erhöhst","erhöhe"                    ],
          ["erinnerst","erinnere"                ],
          ["erkennst","erkenne"                  ],
          ["erklärst","erkläre"                  ],
          ["erlaubst","erlaube"                  ],
          ["erlebst","erlebe"                    ],
          ["erleichterst","erleichtere"          ],
          ["erlässt","erlasse"                   ],
          ["ermittelst","ermittle"               ],
          ["ermunterst","ermuntere"              ],
          ["ermöglichst","ermögliche"            ],
          ["erreichst","erreiche"                ],
          ["erscheinst","erscheine"              ],
          ["erschreckst","erschrecke"            ],
          ["ersetzt","ersetze"                   ],
          ["erstellst","erstelle"                ],
          ["erstreckst","erstrecke"              ],
          ["ersuchst","ersuche"                  ],
          ["erteilst","erteile"                  ],
          ["erwartest","erwarte"                 ],
          ["erweiterst","erweitere"              ],
          ["erwärmst","erwärme"                  ],
          ["erzeugst","erzeuge"                  ],
          ["erzielst","erziele"                  ],
          ["erzählst","erzähle"                  ],
          ["exportierst","exportiere"            ],
          ["fasert","fasere"                     ],
          ["feierst","feiere"                    ],
          ["findest","finde"                     ],
          ["findet","finde"                      ],
          ["fliegst","fliege"                    ],
          ["folgst","folge"                      ],
          ["forderst","fordere"                  ],
          ["formst","forme"                      ],
          ["fragst","frage"                      ],
          ["freist","freie"                      ],
          ["funktionierst","funktioniere"        ],
          ["fährst","fahre"                      ],
          ["fällst","falle"                      ],
          ["fängst","fange"                      ],
          ["förderst","fördere"                  ],
          ["fügst","füge"                        ],
          ["fühlst","fühle"                      ],
          ["führst","führe"                      ],
          ["garantierst","garantiere"            ],
          ["gebietest","gebiete"                 ],
          ["gefällst","gefalle"                  ],
          ["gehst","gehe"                        ],
          ["gehörst","gehöre"                    ],
          ["gelangst","gelange"                  ],
          ["genießt","genieße"                   ],
          ["gerätst","gerate"                    ],
          ["geschieht","geschehe"                ],
          ["gestaltest","gestalte"               ],
          ["gestattest","gestatte"               ],
          ["gewinnst","gewinne"                  ],
          ["gewährleistest","gewährleiste"       ],
          ["gewährst","gewähre"                  ],
          ["gibst","gebe"                        ],
          ["giltst","gelte"                      ],
          ["glaubst","glaube"                    ],
          ["gleichst","gleiche"                  ],
          ["globalisierst","globalisiere"        ],
          ["greifst","greife"                    ],
          ["grenzt","grenze"                     ],
          ["gründest","gründe"                   ],
          ["hast","habe"                        ],
          ["hakst","hake"                        ],
          ["handelst","handle"                   ],
          ["harmonisierst","harmonisiere"        ],
          ["hast","habe"                         ],
          ["heiratest","heirate"                 ],
          ["heißt","heiße"                       ],
          ["hilfst","helfe"                      ],
          ["hoffst","hoffe"                      ],
          ["holst","hole"                        ],
          ["hältst","halte"                      ],
          ["hängst","hänge"                      ],
          ["hörst","höre"                        ],
          ["identifizierst","identifiziere"      ],
          ["ideologisierst","ideologisiere"      ],
          ["illustrierst","illustriere"          ],
          ["importierst","importiere"            ],
          ["informierst","informiere"            ],
          ["inspirierst","inspiriere"            ],
          ["installierst","installiere"          ],
          ["intensivierst","intensiviere"        ],
          ["interessierst","interessiere"        ],
          ["interpretierst","interpretiere"      ],
          ["investierst","investiere"            ],
          ["ironisierst","ironisiere"            ],
          ["isst","esse"                         ],
          ["jungst","junge"                      ],
          ["kannst","kann"                       ],
          ["kantest","kante"                     ],
          ["karikierst","karikiere"              ],
          ["kategorisierst","kategorisiere"      ],
          ["kaufst","kaufe"                      ],
          ["kennst","kenne"                      ],
          ["klassifizierst","klassifiziere"      ],
          ["klickst","klicke"                    ],
          ["klärst","kläre"                      ],
          ["knotest","knote"                     ],
          ["kochst","koche"                      ],
          ["kommentierst","kommentiere"          ],
          ["kommst","komme"                      ],
          ["komplizierst","kompliziere"          ],
          ["konfigurierst","konfiguriere"        ],
          ["kontrollierst","kontrolliere"        ],
          ["konzentrierst","konzentriere"        ],
          ["kopierst","kopiere"                  ],
          ["korrigierst","korrigiere"            ],
          ["kostest","koste"                     ],
          ["kriegst","kriege"                    ],
          ["kritisierst","kritisiere"            ],
          ["krümelst","krümele"                  ],
          ["kämpfst","kämpfe"                    ],
          ["könnest","könnte"                    ],
          ["kümmerst","kümmere"                  ],
          ["lachst","lache"                      ],
          ["langst","lange"                      ],
          ["lastest","laste"                     ],
          ["lebst","lebe"                        ],
          ["legitimierst","legitimiere"          ],
          ["legst","lege"                        ],
          ["leidest","leide"                     ],
          ["leihst","leihe"                      ],
          ["leistest","leiste"                   ],
          ["leitest","leite"                     ],
          ["lernst","lerne"                      ],
          ["liebst","liebe"                      ],
          ["lieferst","liefere"                  ],
          ["liegst","liege"                      ],
          ["liest","lese"                        ],
          ["linkst","linke"                      ],
          ["listest","liste"                     ],
          ["loderst","lodere"                    ],
          ["lächelst","lächle"                   ],
          ["lädst","lade"                        ],
          ["ländest","lande"                     ],
          ["lässt","lasse"                       ],
          ["läufst","laufe"                      ],
          ["löschst","lösche"                    ],
          ["löst","löse"                         ],
          ["machst","mache"                      ],
          ["magst","mag"                         ],
          ["manifestierst","manifestiere"        ],
          ["markierst","markiere"                ],
          ["mathematisierst","mathematisiere"    ],
          ["maximierst","maximiere"              ],
          ["meinst","meine"                      ],
          ["meisterst","meistere"                ],
          ["meldest","melde"                     ],
          ["mengst","menge"                      ],
          ["minimierst","minimiere"              ],
          ["misst","messe"                       ],
          ["moralisierst","moralisiere"          ],
          ["moserst","mosere"                    ],
          ["musst","muss"                        ],
          ["navigierst","navigiere"              ],
          ["nennst","nenne"                      ],
          ["nimmst","nehme"                      ],
          ["nutzt","nutze"                       ],
          ["optimierst","optimiere"              ],
          ["ordnest","ordne"                     ],
          ["parodierst","parodiere"              ],
          ["passierst","passiere"                ],
          ["passt","passe"                       ],
          ["pflanzt","pflanze"                   ],
          ["philosophierst","philosophiere"      ],
          ["planst","plane"                      ],
          ["poetisierst","poetisiere"            ],
          ["politisierst","politisiere"          ],
          ["positionierst","positioniere"        ],
          ["postest","poste"                     ],
          ["preist","preise"                     ],
          ["priorisierst","priorisiere"          ],
          ["probst","probe"                      ],
          ["profitierst","profitiere"            ],
          ["prognostizierst","prognostiziere"    ],
          ["präsentierst","präsentiere"          ],
          ["prüfst","prüfe"                      ],
          ["punktest","punkte"                   ],
          ["qualifizierst","qualifiziere"        ],
          ["quantifizierst","quantifiziere"      ],
          ["ragst","rage"                        ],
          ["rahmst","rahme"                      ],
          ["rationalisierst","rationalisiere"    ],
          ["reagierst","reagiere"                ],
          ["rechnest","rechne"                   ],
          ["redest","rede"                       ],
          ["reduzierst","reduziere"              ],
          ["regelst","regele"                    ],
          ["reichst","reiche"                    ],
          ["reifst","reife"                      ],
          ["reinigst","reinige"                  ],
          ["reist","reise"                       ],
          ["rennst","renne"                      ],
          ["repräsentierst","repräsentiere"      ],
          ["resümierst","resümiere"              ],
          ["rettest","rette"                     ],
          ["rettest","rette"                      ],
          ["richtest","richte"                   ],
          ["riechst","rieche"                    ],
          ["rinnst","rinne"                      ],
          ["rollst","rolle"                      ],
          ["romantisierst","romantisiere"        ],
          ["rufst","rufe"                        ],
          ["rückst","rücke"                      ],
          ["sagst","sage"                        ],
          ["sammelst","sammle"                   ],
          ["schadest","schade"                   ],
          ["schaffst","schaffe"                  ],
          ["schaltest","schalte"                 ],
          ["schaust","schaue"                    ],
          ["scheidest","scheide"                 ],
          ["scheinst","scheine"                  ],
          ["scherst","scherze"                   ],
          ["schichtest","schichte"               ],
          ["schickst","schicke"                  ],
          ["schiebst","schiebe"                  ],
          ["schließt","schließe"                 ],
          ["schläfst","schlafe"                  ],
          ["schlägst","schlage"                  ],
          ["schmerzt","schmerze"                 ],
          ["schmilzt","schmelze"                 ],
          ["schneidest","schneide"               ],
          ["schnellst","schnelle"                ],
          ["schreibst","schreibe"                ],
          ["schreitest","schreite"               ],
          ["schuldest","schulde"                 ],
          ["schätzt","schätze"                   ],
          ["schönst","schöne"                    ],
          ["schützt","schütze"                   ],
          ["sendest","sende"                     ],
          ["senkst","senke"                      ],
          ["setzt","setze"                       ],
          ["sicherst","sichere"                  ],
          ["siebst","siebe"                      ],
          ["siehst","sehe"                       ],
          ["sitzt","sitze"                       ],
          ["sollst","soll"                       ],
          ["sonderst","sondere"                  ],
          ["sorgst","sorge"                      ],
          ["sortierst","sortiere"                ],
          ["sozialisierst","sozialisiere"        ],
          ["spaltest","spalte"                   ],
          ["sparst","spare"                      ],
          ["speicherst","speichere"              ],
          ["spezialisierst","spezialisiere"      ],
          ["spielst","spiele"                    ],
          ["sprichst","spreche"                  ],
          ["spürst","spüre"                      ],
          ["stabilisierst","stabilisiere"        ],
          ["stammst","stamme"                    ],
          ["standardisierst","standardisiere"    ],
          ["startest","starte"                   ],
          ["stehst","stehe"                      ],
          ["steigerst","steigere"                ],
          ["stellst","stelle"                    ],
          ["steuerst","steuere"                  ],
          ["stilisierst","stilisiere"            ],
          ["stimmst","stimme"                    ],
          ["stirbst","sterbe"                    ],
          ["stopfst","stopfe"                     ],
          ["stoßt","stoße"                       ],
          ["studierst","studiere"                ],
          ["stundest","stunde"                   ],
          ["stärkst","stärke"                    ],
          ["stürzt","stürze"                     ],
          ["stützt","stütze"                     ],
          ["suchst","suche"                      ],
          ["symbolisierst","symbolisiere"        ],
          ["synchronisierst","synchronisiere"    ],
          ["synthetisierst","synthetisiere"      ],
          ["säufst","säufe"                      ],
          ["tagst","tage"                        ],
          ["tanzt","tanze"                       ],
          ["teilst","teile"                      ],
          ["testest","teste"                     ],
          ["tickst","ticke"                      ],
          ["treibst","treibe"                    ],
          ["trennst","trenne"                    ],
          ["triffst","treffe"                    ],
          ["trinkst","trinke"                    ],
          ["trittst","trete"                     ],
          ["trägst","trage"                      ],
          ["tust","tue"                          ],
          ["tötest","töte"                       ],
          ["umfasst","umfasse"                   ],
          ["umgibst","umgebe"                    ],
          ["unterliegst","unterliege"            ],
          ["unternimmst","unternehme"            ],
          ["unterscheidest","unterscheide"       ],
          ["unterstützt","unterstütze"           ],
          ["untersuchst","untersuche"            ],
          ["validierst","validiere"              ],
          ["verbesserst","verbessere"            ],
          ["verbindest","verbinde"               ],
          ["verbrichst","verbreche"              ],
          ["verbringst","verbringe"              ],
          ["verdienst","verdiene"                ],
          ["vereinfachst","vereinfache"          ],
          ["verfolgst","verfolge"                ],
          ["verfährst","verfahre"                ],
          ["verfügst","verfüge"                  ],
          ["vergisst","vergesse"                 ],
          ["vergleichst","vergleiche"            ],
          ["vergrößerst","vergrößere"            ],
          ["verhinderst","verhindere"            ],
          ["verhältst","verhalte"                ],
          ["verifizierst","verifiziere"          ],
          ["verkaufst","verkaufe"                ],
          ["verlangst","verlange"                ],
          ["verleihst","verleihe"                ],
          ["verlierst","verliere"                ],
          ["verlässt","verlasse"                 ],
          ["vermeidest","vermeide"               ],
          ["verringerst","verringere"            ],
          ["verrätst","verrate"                  ],
          ["verscheidest","verscheide"           ],
          ["verschiebst","verschiebe"            ],
          ["verschwindest","verschwinde"         ],
          ["versprichst","verspreche"            ],
          ["versteckst","verstecke"              ],
          ["verstehst","verstehe"                ],
          ["verstärkst","verstärke"              ],
          ["versuchst","versuche"                ],
          ["verteidigst","verteidige"            ],
          ["vertraust","vertraue"                ],
          ["vertrittst","vertrete"               ],
          ["vervielfältigst","vervielfältige"    ],
          ["vervollständigst","vervollständige"  ],
          ["verwaltest","verwalte"               ],
          ["verwehst","verwehe"                  ],
          ["verwendest","verwende"               ],
          ["verzichtest","verzichte"             ],
          ["veränderst","verändere"              ],
          ["veröffentlichst","veröffentliche"    ],
          ["vorstellst","vorstelle"              ],
          ["wagst","wage"                        ],
          ["wartest","warte"                     ],
          ["webst","webe"                        ],
          ["wechselst","wechsle"                 ],
          ["weist","weise"                       ],
          ["weißt","weiß"                        ],
          ["wendest","wende"                     ],
          ["wertest","werte"                     ],
          ["west","weste"                        ],
          ["wettest","wette"                     ],
          ["wiederholst","wiederhole"            ],
          ["willst","will"                       ],
          ["winkst","winke"                      ],
          ["wirfst","werfe"                      ],
          ["wirkst","wirke"                      ],
          ["wirst","werde"                       ],
          ["wohnst","wohne"                      ],
          ["wunderst","wundere"                  ],
          ["wählst","wähle"                      ],
          ["wünschst","wünsche"                  ],
          ["zahlst","zahle"                      ],
          ["zeichnest","zeichne"                 ],
          ["zeigst","zeige"                      ],
          ["zerstörst","zerstöre"                ],
          ["zertifizierst","zertifiziere"        ],
          ["ziehst","ziehe"                      ],
          ["zielst","ziele"                      ],
          ["zivilisierst","zivilisiere"          ],
          ["zählst","zähle"                      ],
          ["änderst","ändere"                    ],
          ["äußerst","äußere"                    ],
          ["öffnest","öffne"                     ],
          ["überlebst","überlebe"                ],
          ["überlegst","überlege"                ],
          ["übermittelst","übermittele"          ],
          ["übernimmst","übernehme"              ],
          ["überprüfst","überprüfe"              ],
          ["übertriffst","übertriff"             ],
          ["überträgst","übertrage"              ],
          ["überwachst","überwache"              ],
          ["überzeugst","überzeuge"              ],
          ["überziehst","überziehe"              ],
          ["übst","übe"                          ]
    ];
      let output = input
      for (const [duWort, ichWort] of replacements) {
        const regExp1 = new RegExp(`\\b${duWort}\\b`, 'g');
        const regExp2 = new RegExp(`\\b${Strings.toUppercaseFirstChar(duWort)
            }\\b`, 'g');
        output = output
            .replaceAll(regExp1, ichWort)
            .replaceAll(regExp2, Strings.toUppercaseFirstChar(ichWort))
      }
      return output
    }
  } //end of namespace Misc

  /** @deprecated Inline this and replace the error handler with your own
   * error reporting. */
  export namespace clipboard {
    /** @deprecated Inline this and replace the error handler with your own
     * error reporting. */
    export const read = (f: (text: string) => void) => {
      navigator.clipboard.readText().then(text => {
        f(text);
      }).catch(err => {
        console.error('Failed to read clipboard contents: ', err);
        throw err
      })
    }

    /** @deprecated Rather use read() */
    export const readText = () => navigator.clipboard.readText();

    export const writeText = (text: string) => navigator.clipboard.writeText(text);
  }

  /**
   * Source: https://stackoverflow.com/questions/17528749/semaphore-like-queue-in-javascript
   */
  export namespace Semaphore {
    export class Queue {
      private running: any;
      private readonly autorun: boolean;
      private queue: any[];

      constructor(autorun = true, queue = []) {
        this.running = false;
        this.autorun = autorun;
        this.queue = queue;
      }

      //ts-ignore
      add(cb: (arg0: any) => any) {
        this.queue.push((value: any) => {
          const finished = new Promise((resolve, reject) => {
            const callbackResponse = cb(value);

            if (callbackResponse !== false) {
              resolve(callbackResponse);
            } else {
              reject(callbackResponse);
            }
          });
          finished.then(this.dequeue.bind(this), (() => {
          }));
        });

        if (this.autorun && !this.running) {
          // @ts-ignore
          this.dequeue();
        }
        return this;
      }

      dequeue(value: any) {
        this.running = this.queue.shift();
        if (this.running) {
          this.running(value);
        }
        return this.running;
      }

      get next() {
        return this.dequeue;
      }
    }

    // noinspection JSUnusedLocalSymbols
    const test = () => {
      // passing false into the constructor makes it so
      // the queue does not start till we tell it to
      const q = new Queue(false).add(function () {
        //start running something
      }).add(function () {
        //start running something 2
      }).add(function () {
        //start running something 3
      });

      setTimeout(function () {
        // start the queue
        // @ts-ignore
        q.next();
      }, 2000);
    }
    suppressUnusedWarning(test)
  }

}