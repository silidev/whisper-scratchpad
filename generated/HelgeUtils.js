// noinspection JSUnusedGlobalSymbols
/**
 * HelgeUtils.ts
 * @description A collection of general utility functions not connected to a
 * specific project.
 *
 * Copyright by Helge Tobias Kosuch 2024 */
export var HelgeUtils;
(function (HelgeUtils) {
    let Exceptions;
    (function (Exceptions) {
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
        Exceptions.unhandledExceptionAlert = (e) => {
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
        Exceptions.callSwallowingExceptions = (f) => {
            try {
                f();
            }
            catch (err) {
                console.log("Ignored: ");
                console.log(err);
            }
        };
        /**
         * Displays an alert with the given message and throws the message as an exception.
         *
         * @param msg {String} */
        Exceptions.alertAndThrow = (...msg) => {
            console.trace();
            alert(msg);
            throw new Error(...msg);
        };
    })(Exceptions = HelgeUtils.Exceptions || (HelgeUtils.Exceptions = {}));
    HelgeUtils.suppressUnusedWarning = (...args) => {
        const flag = false;
        if (flag) {
            console.log(args);
        }
    };
    let Tests;
    (function (Tests) {
        /** Inline this function! */
        Tests.runTestsOnlyToday = () => {
            const RUN_TESTS = new Date().toISOString().slice(0, 10) === "2024-01-24";
            HelgeUtils.suppressUnusedWarning(RUN_TESTS);
        };
        Tests.assert = (condition, ...output) => {
            if (condition)
                // Everything is fine, just return:
                return;
            // It is NOT fine! Throw an error:
            console.log(...output);
            HelgeUtils.Exceptions.alertAndThrow(...output);
        };
        Tests.assertEquals = (actual, expected, message = null) => {
            if (actual !== expected) {
                if (actual instanceof Date && expected instanceof Date
                    && actual.getTime() === expected.getTime())
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
    })(Tests = HelgeUtils.Tests || (HelgeUtils.Tests = {}));
    let Strings;
    (function (Strings) {
        var _a;
        var assertEquals = HelgeUtils.Tests.assertEquals;
        Strings.toUppercaseFirstChar = (input) => {
            if (input.length === 0)
                return input;
            const specialChars = {
                'ü': 'Ü',
                'ö': 'Ö',
                'ä': 'Ä'
            };
            const firstChar = input.charAt(0);
            return (specialChars[firstChar] || firstChar.toLocaleUpperCase()) + input.slice(1);
        };
        Strings.escapeRegExp = (str) => {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        };
        /**
         * text.substring(leftIndex, rightIndex) is the string between the delimiters. */
        class DelimiterSearch {
            constructor(delimiter) {
                this.delimiter = delimiter;
            }
            leftIndex(text, startIndex) {
                return _a.index(this.delimiter, text, startIndex, false);
            }
            rightIndex(text, startIndex) {
                return _a.index(this.delimiter, text, startIndex, true);
            }
            /** If search backwards the position after the delimiter is */
            static index(delimiter, text, startIndex, searchForward) {
                const searchBackward = !searchForward;
                if (searchBackward) {
                    if (startIndex === 0)
                        return 0;
                    // If the starIndex is at the start of a delimiter we want to return the index of the start of the string before this delimiter:
                    startIndex--;
                }
                const step = searchForward ? 1 : -1;
                for (let i = startIndex; searchForward ? i < text.length : i >= 0; i += step) {
                    if (text.substring(i, i + delimiter.length) === delimiter) {
                        return i
                            + (searchForward ? 0 : delimiter.length);
                    }
                }
                return searchForward ? text.length : 0;
            }
            ;
        } //end of class DelimiterSearch
        _a = DelimiterSearch;
        DelimiterSearch.runTests = () => {
            _a.testDelimiterSearch();
            _a.testDeleteBetweenDelimiters();
        };
        DelimiterSearch.testDelimiterSearch = () => {
            const delimiter = '---\n';
            const instance = new _a(delimiter);
            const runTest = (input, index, expected) => assertEquals(input.substring(instance.leftIndex(input, index), instance.rightIndex(input, index)), expected);
            {
                const inputStr = "abc" + delimiter;
                runTest(inputStr, 0, "abc");
                runTest(inputStr, 3, "abc");
                runTest(inputStr, 4, "");
                runTest(inputStr, 3 + delimiter.length, "");
                runTest(inputStr, 3 + delimiter.length + 1, "");
            }
            {
                const inputStr = delimiter + "abc";
                runTest(inputStr, 0, "");
                runTest(inputStr, delimiter.length, "abc");
                runTest(inputStr, delimiter.length + 3, "abc");
            }
        };
        /** Deletes a note from the given text.
         * @param input - The text to delete from.
         * @param left - The index of the left delimiter.
         * @param right - The index of the right delimiter.
         * @param delimiter - The delimiter.
         * */
        DelimiterSearch.deleteNote = (input, left, right, delimiter) => {
            const str1 = (input.substring(0, left) + input.substring(right)).replaceAll(delimiter + delimiter, delimiter);
            if (str1 === delimiter + delimiter)
                return "";
            if (str1.startsWith(delimiter))
                return str1.substring(delimiter.length);
            if (str1.endsWith(delimiter))
                return str1.substring(0, str1.length - delimiter.length);
            return str1;
        };
        DelimiterSearch.testDeleteBetweenDelimiters = () => {
            const delimiter = ')))---(((\n';
            const runTest = (cursorPosition, input, expected) => {
                const delimiterSearch = new Strings.DelimiterSearch(delimiter);
                const left = delimiterSearch.leftIndex(input, cursorPosition);
                const right = delimiterSearch.rightIndex(input, cursorPosition);
                assertEquals(_a.deleteNote(input, left, right, delimiter), expected);
            };
            runTest(0, "abc" + delimiter, "");
            runTest(delimiter.length, delimiter + "abc", "");
            runTest(delimiter.length, delimiter + "abc" + delimiter, "");
            runTest(1 + delimiter.length, "0" + delimiter + "abc" + delimiter + "1", "0" + delimiter + "1");
        };
        Strings.DelimiterSearch = DelimiterSearch;
        function runTests() {
            DelimiterSearch.runTests();
        }
        Strings.runTests = runTests;
    })(Strings = HelgeUtils.Strings || (HelgeUtils.Strings = {})); //end of namespace Strings
    HelgeUtils.runTests = () => {
        Strings.runTests();
    };
    let Transcription;
    (function (Transcription) {
        class TranscriptionError extends Error {
            constructor(payload) {
                super("TranscriptionError");
                this.name = "TranscriptionError";
                this.payload = payload;
            }
        }
        Transcription.TranscriptionError = TranscriptionError;
        const withOpenAi = async (audioBlob, apiKey, prompt) => {
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
            if (typeof result.text === "string")
                return result.text;
            return result;
        };
        const withGladia = async (audioBlob, apiKey, prompt = '') => {
            HelgeUtils.suppressUnusedWarning(prompt);
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
            const result = await (await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
                method: 'POST',
                headers: {
                    'x-gladia-key': apiKey
                },
                body: formData
            })).json();
            const resultText = result?.prediction;
            return resultText;
        };
        Transcription.transcribe = async (api, audioBlob, apiKey, prompt = '') => {
            if (!audioBlob || audioBlob.size === 0)
                return "";
            const output = api === "OpenAI" ?
                await withOpenAi(audioBlob, apiKey, prompt)
                : await withGladia(audioBlob, apiKey, prompt);
            if (typeof output === "string")
                return output;
            throw new TranscriptionError(output);
        };
    })(Transcription = HelgeUtils.Transcription || (HelgeUtils.Transcription = {}));
    let ReplaceByRules;
    (function (ReplaceByRules) {
        class ReplaceRules {
            constructor(rules) {
                this.rules = rules;
                this.applyTo = (subject) => {
                    return ReplaceByRules.replaceByRules(subject, this.rules, false, false).resultingText;
                };
                this.applyToWithLog = (subject) => {
                    return ReplaceByRules.replaceByRules(subject, this.rules, false, true);
                };
            }
        }
        ReplaceByRules.ReplaceRules = ReplaceRules;
        class WholeWordReplaceRules {
            constructor(rules) {
                this.rules = rules;
                this.applyTo = (subject) => {
                    return ReplaceByRules.replaceByRules(subject, this.rules, true, false).resultingText;
                };
                this.applyToWithLog = (subject) => {
                    return ReplaceByRules.replaceByRules(subject, this.rules, true, true);
                };
            }
        }
        ReplaceByRules.WholeWordReplaceRules = WholeWordReplaceRules;
        class WholeWordPreserveCaseReplaceRules {
            constructor(rules) {
                this.rules = rules;
                this.applyTo = (subject) => {
                    return ReplaceByRules.replaceByRules(subject, this.rules, true, false, true).resultingText;
                };
                this.applyToWithLog = (subject) => {
                    return ReplaceByRules.replaceByRules(subject, this.rules, true, true, true);
                };
            }
        }
        ReplaceByRules.WholeWordPreserveCaseReplaceRules = WholeWordPreserveCaseReplaceRules;
        /**
         * Deprecated! Use ReplaceRules or WholeWordReplaceRules instead.
         *
         * Do NOT change the syntax of the rules, because they must be kept compatible with https://github.com/No3371/obsidian-regex-pipeline#readme
         */
        ReplaceByRules.replaceByRules = (subject, allRules, wholeWords = false, logReplacements = false, preserveCase = false) => {
            const possiblyWordBoundaryMarker = wholeWords ? '\\b' : '';
            let count = 0;
            const ruleParser = /^"(.+?)"([a-z]*?)(?:\r\n|\r|\n)?->(?:\r\n|\r|\n)?"(.*?)"([a-z]*?)(?:\r\n|\r|\n)?$/gmus;
            let log = '';
            function applyRule(rawTarget, regexFlags, replacementString, replacementFlags) {
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
            let rule;
            while (rule = ruleParser.exec(allRules)) {
                const [, target, regexFlags, replacementString, replacementFlags] = rule;
                applyRule(target, regexFlags, replacementString, replacementFlags);
                if (preserveCase) {
                    applyRule(Strings.toUppercaseFirstChar(target), regexFlags, Strings.toUppercaseFirstChar(replacementString), replacementFlags);
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
        ReplaceByRules.replaceByRulesAsString = (subject, allRules) => {
            return ReplaceByRules.replaceByRules(subject, allRules, false, false).resultingText;
        };
    })(ReplaceByRules = HelgeUtils.ReplaceByRules || (HelgeUtils.ReplaceByRules = {}));
    HelgeUtils.memoize = (func) => {
        const cache = new Map();
        return (...args) => {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            else {
                const result = func(...args);
                cache.set(key, result);
                return result;
            }
        };
    };
    HelgeUtils.extractHighlights = (input) => {
        const regex = /={2,3}([^=]+)={2,3}/g;
        let matches = [];
        let match;
        while ((match = regex.exec(input)) !== null) {
            matches.push(match[1].trim());
        }
        return matches;
    };
    let Misc;
    (function (Misc) {
        /** I use "strictNullChecks": true to avoid debugging. Therefore, I need this where that is
         * too strict.
         *
         * Use example:
         * const elementWithId = (id: string) =>
         *   nullFilter<HTMLElement>(HtmlUtils.elementWithId, id);
         */
        Misc.nullFilter = (f, ...parameters) => {
            const untypedNullFilter = (input) => {
                if (input === null)
                    HelgeUtils.Exceptions.alertAndThrow(`Unexpected null value.`);
                return input;
            };
            return untypedNullFilter(f(...parameters));
        };
        // noinspection SpellCheckingInspection
        /**
         * Converts "Du" to "Ich" and "Dein" to "Mein" and so on.
         */
        Misc.du2ich = (input, replaceFunction = (rules, input) => new ReplaceByRules.WholeWordPreserveCaseReplaceRules(rules).applyTo(input)) => {
            /**
             * Only WHOLE words are replaced.
             */
            const rules1 = `
"akzentuierst"->"akzentuiere"
"allegorisierst"->"allegorisiere"
"analysierst"->"analysiere"
"antwortest"->"antworte"
"arbeitest"->"arbeite"
"assoziierst"->"assoziiere"
"authentifizierst"->"authentifiziere"
"autorisierst"->"autorisiere"
"bedankst"->"bedanke"
"bedeckst"->"bedecke"
"bedienst"->"bediene"
"begeisterst"->"begeistere"
"beginnst"->"beginne"
"beobachtest"->"beobachte"
"beschwerst"->"beschwere"
"beschützt"->"beschütze"
"bestehst"->"bestehe"
"betrachtest"->"betrachte"
"beurteilst"->"beurteile"
"bezahlst"->"bezahle"
"bist"->"bin"
"bist"->"bin"
"bleibst"->"bleibe"
"brauchst"->"brauche"
"bringst"->"bringe"
"dein"->"mein"
"deine"->"meine"
"deiner"->"meiner"
"demokratisierst"->"demokratisiere"
"demonstrierst"->"demonstriere"
"denkst"->"denke"
"diagnostizierst"->"diagnostiziere"
"dich"->"mich"
"differenzierst"->"differenziere"
"digitalisierst"->"digitalisiere"
"dir"->"mir"
"diskutierst"->"diskutiere"
"diversifizierst"->"diversifiziere"
"dramatisierst"->"dramatisiere"
"du"->"ich"
"empfiehlst"->"empfehle"
"entdeckst"->"entdecke"
"entscheidest"->"entscheide"
"entspannst"->"entspanne"
"erholst"->"erhole"
"erinnerst"->"erinnere"
"erkennst"->"erkenne"
"erklärst"->"erkläre"
"erlaubst"->"erlaube"
"ermunterst"->"ermuntere"
"erreichst"->"erreiche"
"erschreckst"->"erschrecke"
"erweiterst"->"erweitere"
"erwärmst"->"erwärme"
"findest"->"finde"
"findest"->"finde"
"fühlst"->"fühle"
"folgst"->"folge"
"fährst"->"fahre"
"fühlst"->"fühle"
"gehst"->"gehe"
"gibst"->"gebe"
"glaubst"->"glaube"
"harmonisierst"->"harmonisiere"
"hast"->"habe"
"hast"->"habe"
"hilfst"->"helfe"
"hältst"->"halte"
"hörst"->"höre"
"identifizierst"->"identifiziere"
"ideologisierst"->"ideologisiere"
"illustrierst"->"illustriere"
"individualisierst"->"individualisiere"
"inspirierst"->"inspiriere"
"intensivierst"->"intensiviere"
"interessierst"->"interessiere"
"interpretierst"->"interpretiere"
"ironisierst"->"ironisiere"
"isst"->"esse"
"kannst"->"kann"
"kannst"->"kann"
"karikierst"->"karikiere"
"kategorisierst"->"kategorisiere"
"kaufst"->"kaufe"
"klassifizierst"->"klassifiziere"
"kochst"->"koche"
"kommentierst"->"kommentiere"
"kommst"->"komme"
"kritisierst"->"kritisiere"
"lebst"->"lebe"
"legitimierst"->"legitimiere"
"leihst"->"leihe"
"lernst"->"lerne"
"liest"->"lese"
"liest"->"lese"
"logisierst"->"logisiere"
"lächelst"->"lächle"
"läufst"->"laufe"
"machst"->"mache"
"machst"->"mache"
"manifestierst"->"manifestiere"
"mathematisierst"->"mathematisiere"
"maximierst"->"maximiere"
"metaphorisierst"->"metaphorisiere"
"minimierst"->"minimiere"
"moralisierst"->"moralisiere"
"musst"->"muss"
"nennst"->"nenne"
"nimmst"->"nehme"
"optimierst"->"optimiere"
"parodierst"->"parodiere"
"philosophierst"->"philosophiere"
"poetisierst"->"poetisiere"
"politisierst"->"politisiere"
"priorisierst"->"priorisiere"
"prognostizierst"->"prognostiziere"
"präsentierst"->"präsentiere"
"qualifizierst"->"qualifiziere"
"quantifizierst"->"quantifiziere"
"rationalisierst"->"rationalisiere"
"rationalisierst"->"rationalisiere"
"redest"->"rede"
"reduzierst"->"reduziere"
"reinigst"->"reinige"
"repräsentierst"->"repräsentiere"
"resümierst"->"resümiere"
"rettest"->"rette"
"romantisierst"->"romantisiere"
"rufst"->"rufe"
"sagst"->"sage"
"sammelst"->"sammle"
"satirisierst"->"satirisiere"
"schickst"->"schicke"
"schläfst"->"schlafe"
"schreibst"->"schreibe"
"setzt"->"setze"
"siehst"->"sehe"
"sortierst"->"sortiere"
"sozialisierst"->"sozialisiere"
"spezialisierst"->"spezialisiere"
"spielst"->"spiele"
"stabilisierst"->"stabilisiere"
"standardisierst"->"standardisiere"
"stilisierst"->"stilisiere"
"studierst"->"studiere"
"symbolisierst"->"symbolisiere"
"synchronisierst"->"synchronisiere"
"synthetisierst"->"synthetisiere"
"theologisierst"->"theologisiere"
"triffst"->"treffe"
"trinkst"->"trinke"
"trägst"->"trage"
"validierst"->"validiere"
"verbesserst"->"verbessere"
"verbindest"->"verbinde"
"vereinfachst"->"vereinfache"
"verfolgst"->"verfolge"
"vergisst"->"vergesse"
"vergrößerst"->"vergrößere"
"verifizierst"->"verifiziere"
"verlierst"->"verliere"
"verlässt"->"verlasse"
"vermeidest"->"vermeide"
"versteckst"->"verstecke"
"verstehst"->"verstehe"
"versuchst"->"versuche"
"verteidigst"->"verteidige"
"vervielfältigst"->"vervielfältige"
"vervollständigst"->"vervollständige"
"verwendest"->"verwende"
"veränderst"->"verändere"
"wartest"->"warte"
"weißt"->"weiß"
"wiederholst"->"wiederhole"
"willst"->"will"
"willst"->"will"
"wirst"->"werde"
"wunderst"->"wundere"
"zeigst"->"zeige"
"zertifizierst"->"zertifiziere"
"zivilisierst"->"zivilisiere"
"änderst"->"ändere"
"ästhetisierst"->"ästhetisiere"
"öffnest"->"öffne"
"überlegst"->"überlege"
"übernimmst"->"übernehme"
"überprüfst"->"überprüfe"
"übertriffst"->"übertriff"
"überzeugst"->"überzeuge"
"klärst"->"kläre"
"wirst"->"werde"
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
            const applyRules1 = (input) => replaceFunction(rules1, input);
            // const applyRules2 = (input: string) => ReplaceByRules.withUiLog(rules2, input);
            // const applyRules3 = (input: string) => ReplaceByRules.withUiLog(rules3, input);
            return (
            // applyRules3
            (
            // applyRules2
            (applyRules1(input))));
        }; //end of namespace du2ich
    })(Misc = HelgeUtils.Misc || (HelgeUtils.Misc = {})); //end of namespace Misc
})(HelgeUtils || (HelgeUtils = {}));
//# sourceMappingURL=HelgeUtils.js.map