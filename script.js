import { HtmlUtils } from "./HtmlUtils.js";
import { HelgeUtils } from "./HelgeUtils.js";
// ############## AfterInit ##############
var AfterInit;
(function (AfterInit) {
    var TextAreas = HtmlUtils.TextAreas;
    var buttonWithId = HtmlUtils.buttonWithId;
    var Cookies = HtmlUtils.Cookies;
    var Audio = HelgeUtils.Audio;
    var blinkFast = HtmlUtils.blinkFast;
    var blinkSlow = HtmlUtils.blinkSlow;
    // ############## Config ##############
    const INSERT_EDITOR_INTO_PROMPT = true;
    let Pures;
    (function (Pures) {
        // noinspection SpellCheckingInspection
        Pures.du2ich = (input) => HelgeUtils.replaceByRules(HelgeUtils.replaceByRules(input, `
"st\\b"->""
`), `
"Du"->"Ich"
"du""->"ich"
"dich"->"mich"
"Dich"->"Mich"
"dir"->"mir"
"Dir"->"Mir"
"dein"->"mein"
"Dein"->"Mein"
"bist"->"bin"
"hast"->"habe"
"I"->"Ist"
"i"->"ist"
`, true);
    })(Pures || (Pures = {}));
    var inputElementWithId = HtmlUtils.inputElementWithId;
    const downloadLink = document.getElementById('downloadLink');
    const spinner1 = document.getElementById('spinner1');
    const apiSelector = document.getElementById('apiSelector');
    const apiKeyInput = document.getElementById('apiKeyInputField');
    const editorTextarea = document.getElementById('editorTextarea');
    const transcriptionPrompt = document.getElementById('transcriptionPrompt');
    const replaceRulesTextArea = document.getElementById('replaceRulesTextArea');
    const saveEditor = () => Cookies.set("editorText", HtmlUtils.textAreaWithId("editorTextarea").value);
    TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea');
    TextAreas.setAutoSave('editorText', 'editorTextarea');
    TextAreas.setAutoSave('prompt', 'transcriptionPrompt');
    const insertAtCursor = (text) => {
        TextAreas.insertTextAtCursor(editorTextarea, text);
    };
    function getApiSelectedInUi() {
        return apiSelector.value;
    }
    let UI;
    (function (UI) {
        UI.showSpinner = () => {
            // probably not needed anymore, delete later
            // spinner1.style.display = 'block';
        };
        // probably not needed anymore, delete later
        UI.hideSpinner = () => {
            spinner1.style.display = 'none';
        };
    })(UI || (UI = {}));
    // ############## addButtonEventListeners ##############
    // noinspection SpellCheckingInspection
    let ButtonEventListeners;
    (function (ButtonEventListeners) {
        let MediaButtons;
        (function (MediaButtons) {
            let mediaRecorder;
            let audioChunks = [];
            let audioBlob;
            let isRecording = false;
            let stream;
            let sending = false;
            const updateStateIndicator = () => {
                const setHtmlOfButtonStop = (html) => {
                    buttonWithId("stopButton").innerHTML = html;
                };
                const setHtmlOfButtonPauseRecord = (html) => {
                    buttonWithId("pauseRecordButton").innerHTML = html;
                };
                const setRecordingIndicator = () => {
                    setHtmlOfButtonStop(blinkFast('🔴') + (sending ? 'Sending' : 'Stop'));
                    setHtmlOfButtonPauseRecord(blinkFast('||') + ' Pause');
                };
                const setPausedIndicator = () => {
                    setHtmlOfButtonStop(blinkSlow('◼') + ' Stop');
                    setHtmlOfButtonPauseRecord(blinkSlow('⬤') + ' Cont.');
                };
                const setStoppedIndicator = () => {
                    setHtmlOfButtonStop(sending ? blinkFast('◼') + ' Sending' : ' Stopped');
                    setHtmlOfButtonPauseRecord('⬤ Record');
                };
                if (mediaRecorder?.state === 'recording') {
                    setRecordingIndicator();
                }
                else if (mediaRecorder?.state === 'paused') {
                    setPausedIndicator();
                }
                else {
                    setStoppedIndicator();
                }
            };
            const transcribeAndHandleResultAsync = async (audioBlob) => {
                sending = true;
                updateStateIndicator();
                const apiName = getApiSelectedInUi();
                if (!apiName) {
                    insertAtCursor("You must select an API below.");
                    return;
                }
                const promptForWhisper = () => transcriptionPrompt.value + INSERT_EDITOR_INTO_PROMPT ? editorTextarea.value.slice(-(750 /* Taking the last 750 chars is for sure less than the max 250 tokens whisper is considering. This is
              important because the last words of the last transcription should always be included to avoid hallucinations
               if it otherwise would be an incomplete sentence. */
                    - transcriptionPrompt.value.length)) : "";
                const result = async () => await Audio.transcribe(apiName, audioBlob, getApiKey(), promptForWhisper());
                const replacedOutput = HelgeUtils.replaceByRules(await result(), replaceRulesTextArea.value);
                if (editorTextarea.value.length > 0)
                    insertAtCursor(" ");
                insertAtCursor(replacedOutput);
                saveEditor();
                navigator.clipboard.writeText(editorTextarea.value).then();
                sending = false;
                updateStateIndicator();
            };
            const stopCallback = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                { // Download button
                    downloadLink.href = URL.createObjectURL(audioBlob);
                    downloadLink.download = 'recording.wav';
                    downloadLink.style.display = 'block';
                }
                transcribeAndHandleResultAsync(audioBlob).then(UI.hideSpinner);
            };
            const getOnStreamReady = (beginPaused) => {
                return (streamParam) => {
                    stream = streamParam;
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    mediaRecorder.start();
                    isRecording = true;
                    updateStateIndicator();
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };
                    if (beginPaused)
                        mediaRecorder.pause();
                };
            };
            const startRecording = (beginPaused = false) => {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(getOnStreamReady(beginPaused));
            };
            const stopRecording = () => {
                mediaRecorder.onstop = stopCallback;
                mediaRecorder.stop();
                updateStateIndicator();
                isRecording = false;
                HtmlUtils.Media.releaseMicrophone(stream);
            };
            // ############## stopButton ##############
            buttonWithId("stopButton").addEventListener('click', () => {
                if (isRecording) {
                    stopRecording();
                }
                else {
                    UI.showSpinner();
                    startRecording();
                }
            });
            const sendButton = () => {
                if (mediaRecorder?.state === 'recording') {
                    mediaRecorder.onstop = () => {
                        audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        audioChunks = [];
                        transcribeAndHandleResultAsync(audioBlob).then(UI.hideSpinner);
                        startRecording(true);
                    };
                    mediaRecorder.stop();
                }
                else {
                    pauseRecordButton();
                }
            };
            // ############## pauseRecordButton ##############
            const pauseRecordButton = () => {
                if (mediaRecorder?.state === 'recording') {
                    mediaRecorder.pause();
                    updateStateIndicator();
                }
                else if (mediaRecorder?.state === 'paused') {
                    mediaRecorder.resume();
                    updateStateIndicator();
                }
                else {
                    buttonWithId("stopButton").click();
                }
            };
            // ############## sendButton ##############
            buttonWithId("sendButton").addEventListener('click', sendButton);
            buttonWithId("pauseRecordButton").addEventListener('click', pauseRecordButton);
            // ############## transcribeAgainButton ##############
            HtmlUtils.addButtonClickListener(buttonWithId("transcribeAgainButton"), () => {
                UI.showSpinner();
                transcribeAndHandleResultAsync(audioBlob).then(UI.hideSpinner);
            });
            updateStateIndicator();
        })(MediaButtons = ButtonEventListeners.MediaButtons || (ButtonEventListeners.MediaButtons = {})); // End of media buttons
        ButtonEventListeners.addButtonEventListeners = () => {
            // ############## Crop Highlights Button ##############
            HtmlUtils.addButtonClickListener(buttonWithId("cropHighlightsMenuItem"), () => {
                editorTextarea.value = HelgeUtils.extractHighlights(editorTextarea.value).join(' ');
                saveEditor();
            });
            // ############## Crop Highlights Button ##############
            HtmlUtils.addButtonClickListener(buttonWithId("du2ichMenuItem"), () => {
                const value = Pures.du2ich(editorTextarea.value);
                console.log(value);
                editorTextarea.value = value;
                saveEditor();
            });
            // ############## saveAPIKeyButton ##############
            HtmlUtils.addButtonClickListener(buttonWithId("saveAPIKeyButton"), () => {
                setApiKeyCookie(apiKeyInput.value);
                apiKeyInput.value = '';
            });
            // clearButton
            HtmlUtils.addButtonClickListener(buttonWithId("clearButton"), () => {
                editorTextarea.value = '';
                saveEditor();
            });
            // replaceAgainButton
            HtmlUtils.addButtonClickListener(buttonWithId("replaceAgainButton"), () => {
                editorTextarea.value = HelgeUtils.replaceByRules(editorTextarea.value, replaceRulesTextArea.value);
            });
            // saveEditorButton
            HtmlUtils.addButtonClickListener(buttonWithId("saveEditorButton"), () => {
                Cookies.set("editorText", editorTextarea.value);
            });
            // savePromptButton
            HtmlUtils.addButtonClickListener(buttonWithId("savePromptButton"), () => {
                Cookies.set("prompt", transcriptionPrompt.value);
            });
            // saveRulesButton
            HtmlUtils.addButtonClickListener(buttonWithId("saveRulesButton"), () => {
                Cookies.set("replaceRules", replaceRulesTextArea.value);
            });
            function addUndoButtonEventListener(undoButtonId, textArea) {
                HtmlUtils.addButtonClickListener(buttonWithId(undoButtonId), () => {
                    textArea.focus();
                    document.execCommand('undo'); // Yes, deprecated, but works. I will replace it when it fails. Docs: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
                });
            }
            // undoButtonOfEditor
            addUndoButtonEventListener("undoButtonOfEditor", editorTextarea);
            addUndoButtonEventListener("undoButtonOfReplaceRules", replaceRulesTextArea);
            addUndoButtonEventListener("undoButtonOfPrompt", transcriptionPrompt);
            // addReplaceRuleButton
            HtmlUtils.addButtonClickListener(buttonWithId("addReplaceRuleButton"), () => {
                // add TextArea.selectedText() to the start of the replaceRulesTextArea
                TextAreas.setCursor(replaceRulesTextArea, 0);
                const selectedText = TextAreas.selectedText(editorTextarea);
                TextAreas.insertTextAtCursor(replaceRulesTextArea, `"${selectedText}"->"${selectedText}"\n`);
                TextAreas.setCursor(replaceRulesTextArea, 5 + selectedText.length);
                replaceRulesTextArea.focus();
            });
            // aboutButton
            HtmlUtils.addButtonClickListener(buttonWithId("cancelButton"), () => {
                saveEditor();
                window.location.reload();
            });
            // copyButton
            /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
            function addEventListenerForCopyButton(buttonId, inputElementId) {
                buttonWithId(buttonId).addEventListener('click', () => {
                    navigator.clipboard.writeText(inputElementWithId(inputElementId).value).then(() => {
                        buttonWithId(buttonId).textContent = '⎘ Copied!';
                        setTimeout(() => {
                            buttonWithId(buttonId).textContent = '⎘ Copy';
                        }, 2000);
                    });
                });
            }
            // copyButtons
            addEventListenerForCopyButton("copyButton", "editorTextarea");
            addEventListenerForCopyButton("copyReplaceRulesButton", "replaceRulesTextArea");
            addEventListenerForCopyButton("copyPromptButton", "transcriptionPrompt");
            buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
                inputElementWithId('apiKey').value = ''; // Clear the input field
            });
            apiSelector.addEventListener('change', () => {
                Cookies.set('apiSelector', apiSelector.value);
            });
        };
    })(ButtonEventListeners = AfterInit.ButtonEventListeners || (AfterInit.ButtonEventListeners = {}));
    const getApiKey = () => Cookies.get(apiSelector.value + 'ApiKey');
    const setApiKeyCookie = (apiKey) => {
        Cookies.set(apiSelector.value + 'ApiKey', apiKey);
    };
    AfterInit.loadFormData = () => {
        editorTextarea.value = Cookies.get("editorText");
        transcriptionPrompt.value = Cookies.get("prompt");
        replaceRulesTextArea.value = Cookies.get("replaceRules");
        apiSelector.value = Cookies.get("apiSelector") ?? 'OpenAI';
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
    AfterInit.ButtonEventListeners.addButtonEventListeners();
    AfterInit.registerServiceWorker();
    AfterInit.loadFormData();
};
init();
//# sourceMappingURL=script.js.map