export var HelgeUtils;
(function (HelgeUtils) {
    HelgeUtils.suppressUnusedWarning = (...args) => {
        const flag = false;
        if (flag) {
            console.log(args);
        }
    };
    let Audio;
    (function (Audio) {
        Audio.transcribe = async (api, audioBlob, apiKey, prompt = '') => {
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
        automatic single language	default value and recommended choice for most cases - the model will auto detect the prominent language in the audio, then transcribe the full audio to that language. Segments in other languages will automatically be translated to the prominent language. The mode is also recommended for scenarios where the audio starts in one language for a short while and then switches to another for the majority of the duration
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
            const output = api === "OpenAI" ?
                await withOpenAi(audioBlob, apiKey, prompt)
                : await withGladia(audioBlob, apiKey, prompt);
            if (typeof output === "string")
                return output;
            else
                return JSON.stringify(output, null, 2)
                    + '\nYou need an API key. You can get one at https://platform.openai.com/api-keys">.' +
                    ' If you want to try it out beforehand, you can try it in the ChatGPT Android and iOS' +
                    ' apps for free without API key.\n\n';
        };
    })(Audio = HelgeUtils.Audio || (HelgeUtils.Audio = {}));
    HelgeUtils.replaceByRules = (subject, ruleText) => {
        let count = 0;
        let ruleMatches;
        const ruleParser = /^"(.+?)"([a-z]*?)(?:\r\n|\r|\n)?->(?:\r\n|\r|\n)?"(.*?)"([a-z]*?)(?:\r\n|\r|\n)?$/gmus;
        while (ruleMatches = ruleParser.exec(ruleText)) {
            console.log("\n" + ruleMatches[1] + "\n↓↓↓↓↓\n" + ruleMatches[3]);
            let matchRule = ruleMatches[2].length == 0 ?
                new RegExp(ruleMatches[1], 'gmu')
                : new RegExp(ruleMatches[1], ruleMatches[2]);
            if (ruleMatches[4] == 'x')
                subject = subject.replace(matchRule, '');
            else
                subject = subject.replace(matchRule, ruleMatches[3]);
            count++;
        }
        return subject;
    };
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
})(HelgeUtils || (HelgeUtils = {}));
//# sourceMappingURL=HelgeUtils.js.map