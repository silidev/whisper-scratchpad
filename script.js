"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HtmlUtils_1 = require("./HtmlUtils");
const HelgeUtils_1 = require("./HelgeUtils");
var AppSpecific;
(function (AppSpecific) {
    const Audio = HelgeUtils_1.HelgeUtils.Audio;
    let AfterInit;
    (function (AfterInit) {
        const Cookies = HtmlUtils_1.HtmlUtils.Cookies;
        const saveAPIKeyButton = document.getElementById('saveAPIKeyButton');
        const recordButton = document.getElementById('recordButton');
        const pauseButton = document.getElementById('pauseButton');
        const clearButton = document.getElementById('clearButton');
        const downloadButton = document.getElementById('downloadButton');
        const savePromptButton = document.getElementById('savePromptButton');
        const saveRulesButton = document.getElementById('saveRulesButton');
        const saveEditorButton = document.getElementById('saveEditorButton');
        const copyButton = document.getElementById('copyButton');
        const transcribeAgainButton = document.getElementById('transcribeAgainButton');
        const replaceAgainButton = document.getElementById('replaceAgainButton');
        const recordSpinner = document.getElementById('recordSpinner');
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
                    HtmlUtils_1.HtmlUtils.Media.releaseMicrophone(stream);
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
                HtmlUtils_1.HtmlUtils.addButtonClickListener(transcribeAgainButton, () => {
                    showSpinner();
                    transcribeAndHandleResult(audioBlob).then(hideSpinner);
                });
            }
            // saveAPIKeyButton
            HtmlUtils_1.HtmlUtils.addButtonClickListener(saveAPIKeyButton, () => {
                setApiKeyCookie(apiKeyInput.value);
            });
            // clearButton
            HtmlUtils_1.HtmlUtils.addButtonClickListener(clearButton, () => {
                editorTextarea.value = '';
            });
            // replaceAgainButton
            HtmlUtils_1.HtmlUtils.addButtonClickListener(replaceAgainButton, () => {
                editorTextarea.value = HelgeUtils_1.HelgeUtils.replaceByRules(editorTextarea.value, replaceRulesTextArea.value);
            });
            // saveEditorButton
            HtmlUtils_1.HtmlUtils.addButtonClickListener(saveEditorButton, () => {
                Cookies.set("editorText", editorTextarea.value);
            });
            // savePromptButton
            HtmlUtils_1.HtmlUtils.addButtonClickListener(savePromptButton, () => {
                Cookies.set("prompt", transcriptionPrompt.value);
            });
            // saveRulesButton
            HtmlUtils_1.HtmlUtils.addButtonClickListener(saveRulesButton, () => {
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
                recordSpinner.style.display = 'block';
            };
            const hideSpinner = () => {
                recordSpinner.style.display = 'none';
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
            const replacedOutput = HelgeUtils_1.HelgeUtils.replaceByRules(result, replaceRulesTextArea.value);
            if (overwriteEditorCheckbox.checked)
                editorTextarea.value = replacedOutput;
            else
                HtmlUtils_1.HtmlUtils.TextAreas.insertTextAtCursor(editorTextarea, replacedOutput);
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