import { HtmlUtils } from "./HtmlUtils.js";
import { HelgeUtils } from "./HelgeUtils.js";
var elementWithId = HtmlUtils.elementWithId;
var TextAreas = HtmlUtils.TextAreas;
const Audio = HelgeUtils.Audio;
var AfterInit;
(function (AfterInit) {
    var buttonWithId = HtmlUtils.buttonWithId;
    const Cookies = HtmlUtils.Cookies;
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
    const apiSelector = document.getElementById('apiSelector');
    const apiKeyInput = document.getElementById('apiKeyInputField');
    const editorTextarea = document.getElementById('editorTextarea');
    const transcriptionPrompt = document.getElementById('transcriptionPrompt');
    const replaceRulesTextArea = document.getElementById('replaceRulesTextArea');
    TextAreas.setAutoSave('replaceRulesTextArea', 'replaceRules');
    TextAreas.setAutoSave('editorTextarea', 'editorText');
    TextAreas.setAutoSave('transcriptionPrompt', 'prompt');
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
                setRecordingIndicator();
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
            };
            function setRecordingIndicator() {
                elementWithId("recordingIndicator").innerHTML = '<span class="blinking">🔴Recording</span>';
                recordButton.textContent = '◼ Stop';
                recordButton.style.backgroundColor = 'red';
                pauseButton.textContent = '‖ Pause';
                pauseButton.style.backgroundColor = 'red';
            }
            function setPausedIndicator() {
                elementWithId("recordingIndicator").innerHTML = '‖ Paused';
                recordButton.textContent = '⬤ Record';
                recordButton.style.backgroundColor = 'black';
                pauseButton.style.backgroundColor = 'black';
                pauseButton.textContent = '‖ Resume';
            }
            const startRecording = () => {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(onStreamReady);
            };
            const stopRecording = () => {
                mediaRecorder.onstop = mediaRecorderStoppedCallback;
                mediaRecorder.stop();
                setPausedIndicator();
                isRecording = false;
                recordButton.textContent = '⬤ Record';
                HtmlUtils.Media.releaseMicrophone(stream);
            };
            // ############## recordButton ##############
            recordButton.addEventListener('click', () => {
                if (isRecording) {
                    stopRecording();
                }
                else {
                    showSpinner();
                    startRecording();
                }
            });
            // ############## interimTranscribeButton ##############
            buttonWithId("interimTranscribeButton").addEventListener('click', () => {
                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    transcribeAndHandleResult(audioBlob).then(hideSpinner);
                    startRecording();
                };
                mediaRecorder.stop();
            });
            pauseButton.addEventListener('click', () => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.pause();
                    setPausedIndicator();
                }
                else if (mediaRecorder.state === 'paused') {
                    mediaRecorder.resume();
                    setRecordingIndicator();
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
            apiKeyInput.value = '';
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
        const replacedOutput = HelgeUtils.replaceByRules(result, replaceRulesTextArea.value);
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
//# sourceMappingURL=script.js.map