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
    })(Exceptions = HelgeUtils.Exceptions || (HelgeUtils.Exceptions = {}));
    HelgeUtils.suppressUnusedWarning = (...args) => {
        const flag = false;
        if (flag) {
            console.log(args);
        }
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
            const resultText = result?.prediction ?? "";
            if (typeof resultText === "string")
                return resultText;
            return result;
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
                    applyRule(target.toUpperCase(), regexFlags, replacementString.toUpperCase(), replacementFlags);
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
    let Strings;
    (function (Strings) {
        Strings.uppercaseFirstChar = (input) => {
            if (input.length === 0)
                return input;
            const specialChars = {
                'ü': 'Ü',
                'ö': 'Ö',
                'ä': 'Ä'
            };
            const firstChar = input.charAt(0);
            const upperFirstChar = specialChars[firstChar] || firstChar.toLocaleUpperCase();
            return upperFirstChar + input.slice(1);
        };
        Strings.escapeRegExp = (str) => {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        };
    })(Strings = HelgeUtils.Strings || (HelgeUtils.Strings = {}));
    let Misc;
    (function (Misc) {
        // noinspection SpellCheckingInspection
        /**
         * Converts "Du" to "Ich" and "Dein" to "Mein" and so on.
         */
        Misc.du2ich = (input, replaceFunction = (rules, input) => new ReplaceByRules.WholeWordPreserveCaseReplaceRules(rules).applyTo(input)) => {
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
            const applyRules1 = (input) => replaceFunction(rules1, input);
            // const applyRules2 = (input: string) => ReplaceByRules.withUiLog(rules2, input);
            // const applyRules3 = (input: string) => ReplaceByRules.withUiLog(rules3, input);
            return (
            // applyRules3
            (
            // applyRules2
            (applyRules1(input))));
        }; //end of namespace du2ich
    })(Misc = HelgeUtils.Misc || (HelgeUtils.Misc = {}));
})(HelgeUtils || (HelgeUtils = {}));
//# sourceMappingURL=HelgeUtils.js.map