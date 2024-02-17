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
         * Wraps the given void function in a try-catch block and swallows any exceptions.
         *
         * Example use:
         *     const produceError = () => {throw "error"}
         *     const noError = swallowAll(produceError);
         *     noError(); // Does NOT throw an exception.
         *
         * @param func
         */
        Exceptions.swallowAll = (func) => {
            return (...args) => {
                try {
                    func(...args);
                }
                catch (e) {
                }
            };
        };
        /** Alias for swallowAll
         * @deprecated */
        Exceptions.catchAll = Exceptions.swallowAll;
        /** Alias for swallowAll
         * @deprecated */
        Exceptions.unthrow = Exceptions.swallowAll;
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
        /**
         * Trim whitespace but leave a single newline at the end if there is
         * any whitespace that includes a newline.
         */
        Strings.trimExceptASingleNewlineAtTheEnd = (input) => {
            // Check for whitespace including a newline at the end
            if (/\s*\n\s*$/.test(input)) {
                // Trim and leave a single newline at the end
                return input.replace(/\s+$/, '\n');
            }
            else {
                // Just trim normally
                return input.trim();
            }
        };
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
        const withOpenAi = async (audioBlob, apiKey, prompt, language = "", translateToEnglish = false) => {
            const formData = new FormData();
            formData.append('file', audioBlob);
            formData.append('model', 'whisper-1'); // Using the largest model
            formData.append('prompt', prompt);
            /* Language. Anything in a different language will be translated to the target language. */
            formData.append('language', language); // e.g. "en"
            /* Docs: https://platform.openai.com/docs/api-reference/audio/createTranscription */
            const response = await fetch("https://api.openai.com/v1/audio/"
                + (translateToEnglish ? 'translations' : 'transcriptions'), {
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
        const withGladia = async (audioBlob, apiKey, prompt = '', language = null) => {
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
            if (language)
                formData.append('language_behaviour', 'automatic multiple languages');
            formData.append('toggle_diarization', 'false');
            // formData.append('transcription_hint', prompt)
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
        Transcription.transcribe = async (api, audioBlob, apiKey, prompt = '', language = "", translateToEnglish = false) => {
            if (!audioBlob || audioBlob.size === 0)
                return "";
            const output = api === "OpenAI" ?
                await withOpenAi(audioBlob, apiKey, prompt, language, translateToEnglish)
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
         * Do NOT change the syntax of the rules, because they must be kept compatible with
         * https://github.com/No3371/obsidian-regex-pipeline#readme
         *
         * @param subject - The text to replace in.
         * @param allRules - The rules to apply.
         * @param wholeWords - If true, only whole words are replaced.
         * @param logReplacements - If true, a log of the replacements is returned.
         * @param preserveCase - If true, the case of the replaced word is preserved.
         */
        ReplaceByRules.replaceByRules = (subject, allRules, wholeWords = false, logReplacements = false, preserveCase = false) => {
            const possiblyWordBoundaryMarker = wholeWords ? '\\b' : '';
            let count = 0;
            const ruleParser = /^"(.+?)"([a-z]*?)(?:\r\n|\r|\n)?->(?:\r\n|\r|\n)?"(.*?)"([a-z]*?)(?:\r\n|\r|\n)?$/gmus;
            let log = '';
            function applyRule(rawTarget, regexFlags, replacementString, replacementFlags) {
                const target = possiblyWordBoundaryMarker + rawTarget + possiblyWordBoundaryMarker;
                // console.log("\n" + target + "\n↓↓↓↓↓\n"+ replacement)
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
        /**
         * Throws an exception if the input is null.
         *
         * I use "strictNullChecks": true to avoid bugs. Therefore, I need this
         * where that is too strict.
         *
         * Use example:
         * const elementWithId = (id: string) =>
         *   nullFilter<HTMLElement>(HtmlUtils.elementWithId, id)
         */
        Misc.nullFilter = (f, ...parameters) => {
            const untypedNullFilter = (input) => {
                if (input === null)
                    Exceptions.alertAndThrow(`Unexpected null value.`);
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
             * Only WHOLE words are replaced. Gotchas: Do NOT only search for a word
             * boundary at the end, because e. g. "du" and "hast" might be endings of
             * unrelated words!
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
"lächelst"->"lächle"
"läufst"->"laufe"
"machst"->"mache"
"machst"->"mache"
"manifestierst"->"manifestiere"
"mathematisierst"->"mathematisiere"
"maximierst"->"maximiere"
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
"darfst"->"darf"
"stellst"->"stelle"
"anstellst"->"anstelle"
"abstellst"->"abstelle"
"vorstellst"->"vorstelle"
"könnest"->"könnte"
`;
            /* Produced with the prompts:
            1) bringe diese komplette Liste von Verben in den zweiten Fall ("du"). zB aus
             "wirken" mache "wirst". Aus "zielen" mache "zielst". Es bleibt nur das reine Verb in der Liste, also immer nur ein Wort! zB aus "zuordnen" wird "ordnest", aus "zusammenstoßen" wird "stoßt".
            
            
             */
            const rules2 = `
"gibst"->"gebe"
"kommst"->"komme"
"rufst"->"rufe"
"aktivierst"->"aktiviere"
"aktualisierst"->"aktualisiere"
"akzeptierst"->"akzeptiere"
"bietest"->"biete"
"änderst"->"ändere"
"fängst"->"fange"
"fragst"->"frage"
"gibst"->"gebe"
"legst"->"lege"
"meldest"->"melde"
"nimmst"->"nehme"
"passt"->"passe"
"rufst"->"rufe"
"scheinst"->"scheine"
"schließt"->"schließe"
"siehst"->"sehe"
"antwortest"->"antworte"
"zeigst"->"zeige"
"arbeitest"->"arbeite"
"assoziiert"->"assoziiere"
"hörst"->"höre"
"nimmst"->"nehme"
"trittst"->"trete"
"weist"->"weise"
"führst"->"führe"
"gestaltest"->"gestalte"
"richtest"->"richte"
"siehst"->"sehe"
"äußerst"->"äußere"
"wählst"->"wähle"
"wirkst"->"wirke"
"autorisierst"->"autorisiere"
"basiert"->"basiere"
"baust"->"baue"
"beachtest"->"beachte"
"bearbeitest"->"bearbeite"
"bedenkst"->"bedenke"
"bedeutest"->"bedeute"
"beeinflusst"->"beeinflusse"
"beeinträchtigst"->"beeinträchtige"
"beendest"->"beende"
"befasst"->"befasse"
"befindest"->"befinde"
"beginnst"->"beginne"
"begrüßt"->"begrüße"
"behältst"->"behalte"
"behandelst"->"behandle"
"behauptest"->"behaupte"
"behältst"->"behalte"
"enthältst"->"enthalte"
"trägst"->"trage"
"bekämpfst"->"bekämpfe"
"bekommst"->"bekomme"
"bemühst"->"bemühe"
"benötigst"->"benötige"
"benutzt"->"benutze"
"beobachtest"->"beobachte"
"berechnest"->"berechne"
"stellst"->"stelle"
"berichtest"->"berichte"
"berücksichtigst"->"berücksichtige"
"beruhst"->"beruhe"
"beschäftigst"->"beschäftige"
"beschleunigst"->"beschleunige"
"beschränkst"->"beschränke"
"besitzt"->"besitze"
"bestätigst"->"bestätige"
"bestehst"->"bestehe"
"bestimmst"->"bestimme"
"besuchst"->"besuche"
"betonst"->"betone"
"betrachtest"->"betrachte"
"betrifft"->"betrifft"
"betreibst"->"betreibe"
"bewegst"->"bewege"
"beweist"->"beweise"
"bewertest"->"bewerte"
"bewirkst"->"bewirke"
"zahlst"->"zahle"
"beziehst"->"beziehe"
"bietest"->"biete"
"bildest"->"bilde"
"bittest"->"bitte"
"bleibst"->"bleibe"
"brauchst"->"brauche"
"brichst"->"breche"
"breitest"->"breite"
"bringst"->"bringe"
"dankst"->"danke"
"stellst"->"stelle"
"deaktivierst"->"deaktiviere"
"deckst"->"decke"
"definierst"->"definiere"
"denkst"->"denke"
"dienst"->"diene"
"diskutierst"->"diskutiere"
"doppelst"->"dopple"
"drehst"->"drehe"
"drittelst"->"drittele"
"druckst"->"drucke"
"drückst"->"drücke"
"führst"->"führe"
"misst"->"messe"
"darfst"->"darf"
"echoest"->"echoe"
"einst"->"ein"
"fügst"->"füge"
"gibst"->"gebe"
"gehst"->"gehe"
"einst"->"ein"
"richtest"->"richte"
"schließt"->"schließe"
"setzt"->"setze"
"stellst"->"stelle"
"empfängst"->"empfange"
"empfiehlst"->"empfehle"
"endest"->"ende"
"entfernst"->"entferne"
"enthältst"->"enthalte"
"entscheidest"->"entscheide"
"entschuldigst"->"entschuldige"
"entsprichst"->"entspreche"
"entstehst"->"entstehe"
"entwickelst"->"entwickle"
"erfährst"->"erfahre"
"erfasst"->"erfasse"
"erfolgst"->"erfolge"
"erforderst"->"erfordere"
"erfüllst"->"erfülle"
"ergibst"->"ergebe"
"ergreifst"->"ergreife"
"erhältst"->"erhalte"
"erhebst"->"erhebe"
"erhöhst"->"erhöhe"
"erinnerst"->"erinnere"
"erkennst"->"erkenne"
"erklärst"->"erkläre"
"erlässt"->"erlasse"
"erlaubst"->"erlaube"
"erlebst"->"erlebe"
"erleichterst"->"erleichtere"
"ermittelst"->"ermittle"
"ermöglichst"->"ermögliche"
"erreichst"->"erreiche"
"erscheinst"->"erscheine"
"ersiehst"->"ersiehe"
"ersetzt"->"ersetze"
"erstellst"->"erstelle"
"erstreckst"->"erstrecke"
"ersuchst"->"ersuche"
"erteilst"->"erteile"
"erwartest"->"erwarte"
"erweiterst"->"erweitere"
"erzählst"->"erzähle"
"erzeugst"->"erzeuge"
"erzielst"->"erziele"
"isst"->"esse"
"exportierst"->"exportiere"
"fährst"->"fahre"
"fällst"->"falle"
"fällst"->"falle"
"fängst"->"fange"
"fasert"->"fasere"
"feierst"->"feiere"
"legst"->"lege"
"stellst"->"stelle"
"findest"->"finde"
"fliegst"->"fliege"
"folgst"->"folge"
"forderst"->"fordere"
"förderst"->"fördere"
"formst"->"forme"
"setzt"->"setze"
"fragst"->"frage"
"freist"->"freie"
"friedest"->"friede"
"fügst"->"füge"
"fühlst"->"fühle"
"führst"->"führe"
"funktionierst"->"funktioniere"
"garantierst"->"garantiere"
"gibst"->"gebe"
"gebietest"->"gebiete"
"gefällst"->"gefalle"
"gefällst"->"gefalle"
"gehst"->"gehe"
"gehörst"->"gehöre"
"gelangst"->"gelange"
"leitest"->"leite"
"giltst"->"gelte"
"genießt"->"genieße"
"gerätst"->"gerate"
"geschieht"->"geschehe"
"gestaltest"->"gestalte"
"gestattest"->"gestatte"
"gewährst"->"gewähre"
"gewährleistest"->"gewährleiste"
"gewinnst"->"gewinne"
"glaubst"->"glaube"
"gleichst"->"gleiche"
"globalisierst"->"globalisiere"
"grenzt"->"grenze"
"gründest"->"gründe"
"hast"->"habe"
"hakst"->"hake"
"hältst"->"halte"
"handelst"->"handle"
"hängst"->"hänge"
"heiratest"->"heirate"
"heißt"->"heiße"
"hilfst"->"helfe"
"findest"->"finde"
"schiebst"->"schiebe"
"stellst"->"stelle"
"lädst"->"lade"
"ragst"->"rage"
"wagst"->"wage"
"fügst"->"füge"
"hoffst"->"hoffe"
"holst"->"hole"
"hörst"->"höre"
"identifizierst"->"identifiziere"
"importierst"->"importiere"
"informierst"->"informiere"
"installierst"->"installiere"
"investierst"->"investiere"
"jungst"->"junge"
"kämpfst"->"kämpfe"
"kantest"->"kante"
"kaufst"->"kaufe"
"kennst"->"kenne"
"klickst"->"klicke"
"knotest"->"knote"
"kommst"->"komme"
"komplizierst"->"kompliziere"
"konfigurierst"->"konfiguriere"
"kannst"->"kann"
"kontrollierst"->"kontrolliere"
"konzentrierst"->"konzentriere"
"kopierst"->"kopiere"
"korrigierst"->"korrigiere"
"kostest"->"koste"
"kriegst"->"kriege"
"krümelst"->"krümele"
"kümmerst"->"kümmere"
"lachst"->"lache"
"lädst"->"lade"
"ländest"->"lande"
"langst"->"lange"
"lässt"->"lasse"
"lastest"->"laste"
"läufst"->"laufe"
"lebst"->"lebe"
"legst"->"lege"
"leibst"->"leibe"
"leidest"->"leide"
"leistest"->"leiste"
"lernst"->"lerne"
"liest"->"lese"
"liebst"->"liebe"
"lieferst"->"liefere"
"liegst"->"liege"
"linkst"->"linke"
"listest"->"liste"
"loderst"->"lodere"
"löschst"->"lösche"
"löst"->"löse"
"machst"->"mache"
"markierst"->"markiere"
"meinst"->"meine"
"meisterst"->"meistere"
"meldest"->"melde"
"mengst"->"menge"
"misst"->"messe"
"teilst"->"teile"
"magst"->"mag"
"moserst"->"mosere"
"musst"->"muss"
"navigierst"->"navigiere"
"nimmst"->"nehme"
"nennst"->"nenne"
"normst"->"norme"
"nutest"->"nute"
"nutzt"->"nutze"
"öffnest"->"öffne"
"passt"->"passe"
"passierst"->"passiere"
"pflanzt"->"pflanze"
"planst"->"plane"
"polst"->"polste"
"positionierst"->"positioniere"
"postest"->"poste"
"preist"->"preise"
"probst"->"probe"
"profitierst"->"profitiere"
"prüfst"->"prüfe"
"punktest"->"punkte"
"qualifizierst"->"qualifiziere"
"quellst"->"quelle"
"rahmst"->"rahme"
"reagierst"->"reagiere"
"rechnest"->"rechne"
"rechtst"->"rechte"
"redest"->"rede"
"reduzierst"->"reduziere"
"regelst"->"regele"
"reichst"->"reiche"
"reifst"->"reife"
"reist"->"reise"
"rennst"->"renne"
"rettst"->"rette"
"richtest"->"richte"
"riechst"->"rieche"
"rinnst"->"rinne"
"rollst"->"rolle"
"rückst"->"rücke"
"rufst"->"rufe"
"sagst"->"sage"
"sammelst"->"sammle"
"säufst"->"säufe"
"schadest"->"schade"
"schaffst"->"schaffe"
"schaltest"->"schalte"
"schattest"->"schatte"
"schätzt"->"schätze"
"schaust"->"schaue"
"scheidest"->"scheide"
"scheinst"->"scheine"
"scherst"->"scherze"
"schichtest"->"schichte"
"schickst"->"schicke"
"schläfst"->"schlafe"
"schlägst"->"schlage"
"schließt"->"schließe"
"schmilzt"->"schmelze"
"schmerzt"->"schmerze"
"schneidest"->"schneide"
"schnellst"->"schnelle"
"schönst"->"schöne"
"schreibst"->"schreibe"
"schreitest"->"schreite"
"schuldest"->"schulde"
"schützt"->"schütze"
"schwellst"->"schwelle"
"siehst"->"sehe"
"seihst"->"seihe"
"bist"->"bin"
"sendest"->"sende"
"senkst"->"senke"
"setzt"->"setze"
"sicherst"->"sichere"
"stellst"->"stelle"
"siebst"->"siebe"
"sitzt"->"sitze"
"sollst"->"soll"
"sonderst"->"sondere"
"sorgst"->"sorge"
"spaltest"->"spalte"
"sparst"->"spare"
"speicherst"->"speichere"
"spielst"->"spiele"
"sprichst"->"spreche"
"spürst"->"spüre"
"stammst"->"stamme"
"stärkst"->"stärke"
"startest"->"starte"
"findet"->"finde"
"stehst"->"stehe"
"steigerst"->"steigere"
"stellst"->"stelle"
"stirbst"->"sterbe"
"steuerst"->"steuere"
"stimmst"->"stimme"
"stopst"->"stopfe"
"stundest"->"stunde"
"stürzt"->"stürze"
"stützt"->"stütze"
"stützt"->"stütze"
"suchst"->"suche"
"tagst"->"tage"
"tanzt"->"tanze"
"teilst"->"teile"
"nimmst"->"nehme"
"testest"->"teste"
"tickst"->"ticke"
"tötest"->"töte"
"trägst"->"trage"
"triffst"->"treffe"
"treibst"->"treibe"
"trennst"->"trenne"
"trittst"->"trete"
"trinkst"->"trinke"
"tust"->"tue"
"kommst"->"komme"
"fragst"->"frage"
"überlebst"->"überlebe"
"überlegst"->"überlege"
"überliegst"->"überliege"
"übermittelst"->"übermittele"
"übernimmst"->"übernehme"
"überprüfst"->"überprüfe"
"überschreist"->"überschreie"
"überträgst"->"übertrage"
"überwachst"->"überwache"
"überzeugst"->"überzeuge"
"bringst"->"bringe"
"umfasst"->"umfasse"
"umgibst"->"umgebe"
"setzt"->"setze"
"unterliegst"->"unterliege"
"unternimmst"->"unternehme"
"unterscheidest"->"unterscheide"
"unterstützt"->"unterstütze"
"untersuchst"->"untersuche"
"veränderst"->"verändere"
"verbesserst"->"verbessere"
"verbindest"->"verbinde"
"verbrichst"->"verbriche"
"verbringst"->"verbringe"
"verdienst"->"verdiene"
"verfährst"->"verfahre"
"verfolgst"->"verfolge"
"verfügst"->"verfüge"
"vergisst"->"vergesse"
"vergleichst"->"vergleiche"
"verhältst"->"verhalte"
"verhinderst"->"verhindere"
"verkaufst"->"verkaufe"
"verlangst"->"verlange"
"verleihst"->"verleihe"
"verlierst"->"verliere"
"vermeidest"->"vermeide"
"veröffentlichst"->"veröffentliche"
"verrätst"->"verrate"
"verringerst"->"verringere"
"verscheidest"->"verscheide"
"verschiebst"->"verschiebe"
"verschilfst"->"verschilfe"
"verschneist"->"verschneie"
"verschwindest"->"verschwinde"
"versehst"->"versehe"
"versprichst"->"verspreche"
"verstärkst"->"verstärke"
"versteckst"->"verstecke"
"verstehst"->"verstehe"
"versuchst"->"versuche"
"verteidigst"->"verteidige"
"vertraust"->"vertraue"
"vertrittst"->"vertrete"
"verwaltest"->"verwalte"
"verwehst"->"verwehe"
"verwendest"->"verwende"
"verzichtest"->"verzichte"
"bereitest"->"bereite"
"gehst"->"gehe"
"habst"->"habe"
"legst"->"lege"
"liegst"->"liege"
"nimmst"->"nehme"
"schläfst"->"schlafe"
"stellst"->"stelle"
"wirfst"->"werfe"
"wagst"->"wage"
"wählst"->"wähle"
"wartest"->"warte"
"webst"->"webe"
"wechselst"->"wechsle"
"weist"->"weise"
"weißt"->"weiß"
"wendest"->"wende"
"wirst"->"werde"
"wertest"->"werte"
"west"->"weste"
"wettest"->"wette"
"stellst"->"stelle"
"wiederholst"->"wiederhole"
"winkst"->"winke"
"wirkst"->"wirke"
"weißt"->"weiß"
"wohnst"->"wohne"
"willst"->"will"
"nimmst"->"nehme"
"wünschst"->"wünsche"
"zahlst"->"zahle"
"zählst"->"zähle"
"zeichnest"->"zeichne"
"zeigst"->"zeige"
"verfährst"->"verfahre"
"zerstörst"->"zerstöre"
"ziehst"->"ziehe"
"zielst"->"ziele"
"greifst"->"greife"
"lässt"->"lasse"
"ordnest"->"ordne"
"stoßt"->"stoße"
"stimmst"->"stimme"
"weist"->"weise"
`;
            /**
             * Here also partial words are replaced.*/
            // const rules3 = `
            //     "I"->"Ist"
            //     "i"->"ist"
            // "\\berst\\b"->"x(ersxt)x"
            // :: Bug: The following does not work for all occurrences: //TODOh
            // "st\\b"->""
            // `
            // noinspection SpellCheckingInspection
            /**
             * Here also partial words are replaced.*/
            // const rules4 = `
            // "\\bx\\(ersxt\\)x\\b"->"erst"
            // `
            const applyRules1 = (input) => replaceFunction(rules1, input);
            const applyRules2 = (input) => replaceFunction(rules2, input);
            // const applyRules3 = (input: string) => ReplaceByRules.withUiLog(rules3,input)
            // const applyRules4 = (input: string) => ReplaceByRules.withUiLog(rules3,input)
            return (
            // applyRules3
            (
            // applyRules2
            (applyRules1(input))));
        }; //end of namespace du2ich
    })(Misc = HelgeUtils.Misc || (HelgeUtils.Misc = {})); //end of namespace Misc
})(HelgeUtils || (HelgeUtils = {}));
//# sourceMappingURL=HelgeUtils.js.map