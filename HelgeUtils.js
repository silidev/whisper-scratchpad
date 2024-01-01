"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelgeUtils = void 0;
var HelgeUtils;
(function (HelgeUtils) {
    let Audio;
    (function (Audio) {
        Audio.transcribe = async (api, audioBlob, apiKey, prompt = '') => {
            const withOpenAi = async (audioBlob, apiKey, prompt) => {
                const formData = new FormData();
                formData.append('file', audioBlob);
                formData.append('model', 'whisper-1'); // Using the largest model
                formData.append('prompt', prompt);
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
                const formData = new FormData();
                formData.append('audio', audioBlob);
                formData.append('language_behaviour', 'automatic multiple languages');
                formData.append('toggle_diarization', 'false');
                formData.append('transcription_hint', prompt);
                formData.append('output_format', 'txt');
                const response = await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
                    method: 'POST',
                    headers: {
                        'x-gladia-key': apiKey
                    },
                    body: formData
                });
                const result = await response.json();
                const resultText = result["prediction_raw"]["transcription"]["transcription"];
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
            // console.log("\n" + ruleMatches[1] + "\n↓↓↓↓↓\n"+ ruleMatches[3]);
            let matchRule = ruleMatches[2].length == 0 ?
                new RegExp(ruleMatches[1], 'gm')
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
})(HelgeUtils || (exports.HelgeUtils = HelgeUtils = {}));
//# sourceMappingURL=HelgeUtils.js.map