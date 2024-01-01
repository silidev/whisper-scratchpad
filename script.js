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
                const response = await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
                    method: 'POST',
                    headers: {
                        'x-gladia-key': apiKey
                    },
                    body: formData
                });
                const result = await response.json();
                try {
                    return result["prediction_raw"]["transcription"]["transcription"];
                }
                catch (e) {
                    return result;
                }
            };
            const output = api === "OpenAI" ?
                await withOpenAi(audioBlob, apiKey, prompt)
                : await withGladia(audioBlob, apiKey, prompt);
            if (typeof output === "string")
                return output;
            else
                return JSON.stringify(output, null, 2)
                    + '\nYou need an API key. You can get one at https://platform.openai.com/api-keys">. If you want to try it out beforehand, you can try it in the ChatGPT Android and iOS apps for free without API key.\n\n';
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
})(HelgeUtils || (HelgeUtils = {}));
var HtmlUtils;
(function (HtmlUtils) {
    const memoize = HelgeUtils.memoize;
    HtmlUtils.elementWithId = memoize((id) => {
        return document.getElementById(id);
    });
    HtmlUtils.buttonWithId = HtmlUtils.elementWithId;
    HtmlUtils.textAreaWithId = HtmlUtils.elementWithId;
    let TextAreas;
    (function (TextAreas) {
        TextAreas.insertTextAtCursor = (textarea, addedText) => {
            if (!addedText)
                return;
            const cursorPosition = textarea.selectionStart;
            const textBeforeCursor = textarea.value.substring(0, cursorPosition);
            const textAfterCursor = textarea.value.substring(cursorPosition);
            textarea.value = textBeforeCursor + addedText + textAfterCursor;
            const newCursorPosition = cursorPosition + addedText.length;
            textarea.selectionStart = newCursorPosition;
            textarea.selectionEnd = newCursorPosition;
        };
    })(TextAreas = HtmlUtils.TextAreas || (HtmlUtils.TextAreas = {}));
    let Media;
    (function (Media) {
        Media.releaseMicrophone = (stream) => {
            if (!stream)
                return;
            stream.getTracks().forEach(track => track.stop());
        };
    })(Media = HtmlUtils.Media || (HtmlUtils.Media = {}));
    let Cookies;
    (function (Cookies) {
        Cookies.set = (cookieName, cookieValue) => {
            const expirationTime = new Date(Date.now() + 2147483647000).toUTCString();
            document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)};expires=${expirationTime};path=/`;
        };
        Cookies.get = (name) => {
            let cookieArr = document.cookie.split(";");
            for (let i = 0; i < cookieArr.length; i++) {
                let cookiePair = cookieArr[i].split("=");
                if (name === cookiePair[0].trim()) {
                    return decodeURIComponent(cookiePair[1]);
                }
            }
            return null;
        };
    })(Cookies = HtmlUtils.Cookies || (HtmlUtils.Cookies = {}));
    /**
     * Adds a click listener to a button that appends a checkmark to the button
     * text when clicked. */
    HtmlUtils.addButtonClickListener = (button, callback) => {
        const initialHTML = button.innerHTML; // Read initial HTML from the button
        const checkmark = ' ✔️'; // Unicode checkmark
        button.addEventListener('click', () => {
            callback();
            button.innerHTML += checkmark; // Append checkmark to the button HTML
            setTimeout(() => {
                button.innerHTML = initialHTML; // Reset the button HTML after 2 seconds
            }, 2000);
        });
    };
})(HtmlUtils || (HtmlUtils = {}));
var AppSpecific;
(function (AppSpecific) {
    const Audio = HelgeUtils.Audio;
    let AfterInit;
    (function (AfterInit) {
        const Cookies = HtmlUtils.Cookies;
        const saveAPIKeyButton = document.getElementById('saveAPIKeyButton');
        const recordButton = document.getElementById('recordButton');
        const spinner = document.getElementById('spinner');
        const pauseButton = document.getElementById('pauseButton');
        const clearButton = document.getElementById('clearButton');
        const downloadButton = document.getElementById('downloadButton');
        const savePromptButton = document.getElementById('savePromptButton');
        const saveRulesButton = document.getElementById('saveRulesButton');
        const saveEditorButton = document.getElementById('saveEditorButton');
        const copyButton = document.getElementById('copyButton');
        const transcribeAgainButton = document.getElementById('transcribeAgainButton');
        const replaceAgainButton = document.getElementById('replaceAgainButton');
        const overwriteEditorCheckbox = document.getElementById('overwriteEditorCheckbox');
        const apiSelector = document.getElementById('apiSelector');
        const apiKeyInput = document.getElementById('apiKeyInputField');
        const editorTextarea = document.getElementById('editorTextarea');
        const transcriptionPrompt = document.getElementById('transcriptionPrompt');
        const replaceRulesTextArea = document.getElementById('replaceRulesTextArea');
        // ############## addButtonEventListeners ##############
        AfterInit.addButtonEventListeners = () => {
            { // Media buttons
                let mediaRecorder;
                let audioChunks = [];
                let audioBlob;
                let isRecording = false;
                let stream;
                const mediaRecorderStoppedCallback = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    { // Download button
                        downloadButton.href = URL.createObjectURL(audioBlob);
                        downloadButton.download = 'recording.wav';
                        downloadButton.style.display = 'block';
                    }
                    transcribeAndHandleResult(audioBlob).then(hideSpinner);
                };
                const onStreamReady = (streamParam) => {
                    stream = streamParam;
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    mediaRecorder.start();
                    isRecording = true;
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };
                };
                function startRecording() {
                    showSpinner();
                    recordButton.textContent = '◼ Stop';
                    navigator.mediaDevices.getUserMedia({ audio: true }).then(onStreamReady);
                }
                function stopRecording() {
                    mediaRecorder.onstop = mediaRecorderStoppedCallback;
                    mediaRecorder.stop();
                    isRecording = false;
                    recordButton.textContent = '⬤ Record';
                    HtmlUtils.Media.releaseMicrophone(stream);
                }
                recordButton.addEventListener('click', () => {
                    if (isRecording) {
                        stopRecording();
                    }
                    else {
                        startRecording();
                    }
                });
                pauseButton.addEventListener('click', () => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.pause();
                        pauseButton.textContent = '‖ Resume';
                    }
                    else if (mediaRecorder.state === 'paused') {
                        mediaRecorder.resume();
                        pauseButton.textContent = '‖ Pause';
                    }
                });
                //transcribeAgainButton
                HtmlUtils.addButtonClickListener(transcribeAgainButton, () => {
                    showSpinner();
                    transcribeAndHandleResult(audioBlob).then(hideSpinner);
                });
            }
            // saveAPIKeyButton
            HtmlUtils.addButtonClickListener(saveAPIKeyButton, () => {
                setApiKeyCookie(apiKeyInput.value);
            });
            // clearButton
            HtmlUtils.addButtonClickListener(clearButton, () => {
                editorTextarea.value = '';
            });
            // replaceAgainButton
            HtmlUtils.addButtonClickListener(replaceAgainButton, () => {
                editorTextarea.value = HelgeUtils.replaceByRules(editorTextarea.value, replaceRulesTextArea.value);
            });
            // saveEditorButton
            HtmlUtils.addButtonClickListener(saveEditorButton, () => {
                Cookies.set("editorText", editorTextarea.value);
            });
            // savePromptButton
            HtmlUtils.addButtonClickListener(savePromptButton, () => {
                Cookies.set("prompt", transcriptionPrompt.value);
            });
            // saveRulesButton
            HtmlUtils.addButtonClickListener(saveRulesButton, () => {
                Cookies.set("replaceRules", replaceRulesTextArea.value);
            });
            // copyButton
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(editorTextarea.value).then(() => {
                    copyButton.textContent = '⎘ Copied!';
                    setTimeout(() => {
                        copyButton.textContent = '⎘ Copy';
                    }, 2000);
                });
            });
            document.getElementById('saveAPIKeyButton').addEventListener('click', function () {
                document.getElementById('apiKey').value = ''; // Clear the input field
            });
            apiSelector.addEventListener('change', () => {
                Cookies.set('apiSelector', apiSelector.value);
            });
            const showSpinner = () => {
                spinner.style.display = 'block';
            };
            const hideSpinner = () => {
                spinner.style.display = 'none';
            };
        };
        function getApiKey() {
            return Cookies.get(apiSelector.value + 'ApiKey');
        }
        function setApiKeyCookie(apiKey) {
            Cookies.set(apiSelector.value + 'ApiKey', apiKey);
        }
        const transcribeAndHandleResult = async (audioBlob) => {
            const api = apiSelector.value;
            const result = await Audio.transcribe(api, audioBlob, getApiKey(), transcriptionPrompt.value);
            const replacedOutput = HelgeUtils.replaceByRules(result, replaceRulesTextArea.value);
            if (overwriteEditorCheckbox.checked)
                editorTextarea.value = replacedOutput;
            else
                HtmlUtils.TextAreas.insertTextAtCursor(editorTextarea, replacedOutput);
            navigator.clipboard.writeText(editorTextarea.value).then();
        };
        AfterInit.loadFormData = () => {
            editorTextarea.value = Cookies.get("editorText");
            transcriptionPrompt.value = Cookies.get("prompt");
            replaceRulesTextArea.value = Cookies.get("replaceRules");
            apiSelector.value = Cookies.get("apiSelector");
        };
        AfterInit.registerServiceWorker = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            }
        };
    })(AfterInit || (AfterInit = {}));
    const init = () => {
        AfterInit.addButtonEventListeners();
        AfterInit.registerServiceWorker();
        AfterInit.loadFormData();
    };
    init();
})(AppSpecific || (AppSpecific = {}));
//# sourceMappingURL=script.js.map