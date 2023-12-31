import { HtmlUtils } from "./HtmlUtils.js";
import { HelgeUtils } from "./HelgeUtils.js";
var TextAreas = HtmlUtils.TextAreas;
var buttonWithId = HtmlUtils.buttonWithId;
var blinkFast = HtmlUtils.blinkFast;
var blinkSlow = HtmlUtils.blinkSlow;
var inputElementWithId = HtmlUtils.inputElementWithId;
// ############## Config ##############
const INSERT_EDITOR_INTO_PROMPT = true;
var Pures;
(function (Pures) {
    // noinspection SpellCheckingInspection
    Pures.du2ich = (input) => HelgeUtils.replaceByRules(HelgeUtils.replaceByRules(input, `
"st\\b"->""
`), `
"Du"->"Ich"
"du"->"ich"
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
var UiFunctions;
(function (UiFunctions) {
    UiFunctions.applyReplaceRulesToMainEditor = () => {
        mainEditorTextarea.value = replaceWithNormalParameters(mainEditorTextarea.value);
    };
    UiFunctions.replaceRulesTextAreaOnInput = () => {
        /**
         * Do correct regex escaping with the following and modify the rule accordingly:
         *`Das hier ist ein ziemlich langer ganz normaler Text, an dem die "Rules" nichts verändern sollten. Dadurch fail'en auch Rules wie zB "e"->"a" und das ist auch gut so.`
         */
        // noinspection SpellCheckingInspection
        const magicText = (numberToMakeItUnique) => {
            return `Das hier ist ein ziemlich langer ganz normaler Text an dem die Rules nichts verändern sollten Dadurch failen auch Rules wie zB und das ist auch gut so`
                + numberToMakeItUnique;
        };
        const createTestRule = (numberToMakeItUnique) => `\n\n"${magicText(numberToMakeItUnique)}"gmu->""\n\n`;
        const testRules = createTestRule(1)
            + replaceRulesTextArea.value
            + createTestRule(2);
        const replaceResult = HelgeUtils.replaceByRulesAsString(magicText(1) + magicText(2), testRules);
        buttonWithId("testFailIndicatorOfReplaceRules").style.display =
            replaceResult === ''
                ? "none" : "block";
    };
})(UiFunctions || (UiFunctions = {}));
const downloadLink = document.getElementById('downloadLink');
const spinner1 = document.getElementById('spinner1');
const apiSelector = document.getElementById('apiSelector');
const apiKeyInput = document.getElementById('apiKeyInputField');
const mainEditorTextarea = document.getElementById('mainEditorTextarea');
const transcriptionPrompt = document.getElementById('transcriptionPrompt');
const replaceRulesTextArea = document.getElementById('replaceRulesTextArea');
const saveEditor = () => HtmlUtils.Cookies.set("editorText", HtmlUtils.textAreaWithId("mainEditorTextarea").value);
TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea');
HtmlUtils.textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions.replaceRulesTextAreaOnInput);
TextAreas.setAutoSave('editorText', 'mainEditorTextarea');
TextAreas.setAutoSave('prompt', 'transcriptionPrompt');
const insertAtCursor = (text) => {
    TextAreas.insertTextAtCursor(mainEditorTextarea, text);
};
const getApiSelectedInUi = () => apiSelector.value;
var NotInUse;
(function (NotInUse) {
    NotInUse.showSpinner = () => {
        // probably not needed anymore, delete later
        // spinner1.style.display = 'block';
    };
    // probably not needed anymore, delete later
    NotInUse.hideSpinner = () => {
        spinner1.style.display = 'none';
    };
})(NotInUse || (NotInUse = {}));
var Log;
(function (Log) {
    var textAreaWithId = HtmlUtils.textAreaWithId;
    const MAX_LOG_LEN = 1000;
    Log.log = (message) => {
        const logTextArea = textAreaWithId("logTextArea");
        const oldLog = logTextArea.value;
        logTextArea.value = (oldLog + "\n" + message).slice(-MAX_LOG_LEN);
        logTextArea.scrollTop = logTextArea.scrollHeight;
    };
    Log.showLog = () => {
        textAreaWithId("logTextArea").style.display = "block";
    };
    Log.addToggleLogButtonClickListener = (textAreaWithId) => {
        HtmlUtils.addButtonClickListener(buttonWithId("toggleLogButton"), () => {
            const log = textAreaWithId("logTextArea");
            if (log.style.display === "none") {
                log.style.display = "block";
            }
            else {
                log.style.display = "none";
            }
        });
    };
})(Log || (Log = {}));
const replaceWithNormalParameters = (subject) => {
    return HelgeUtils.replaceByRules(subject, replaceRulesTextArea.value, false, inputElementWithId("logReplaceRulesCheckbox").checked);
};
// noinspection SpellCheckingInspection
export var Buttons;
(function (Buttons) {
    var textAreaWithId = HtmlUtils.textAreaWithId;
    let Media;
    (function (Media) {
        let mediaRecorder;
        let audioChunks = [];
        let audioBlob;
        let isRecording = false;
        let stream;
        let sending = false;
        let StateIndicator;
        (function (StateIndicator) {
            /** Updates the recorder state display. That consists of the text
             * and color of the stop button and the pause record button. */
            StateIndicator.update = () => {
                if (mediaRecorder?.state === 'recording') {
                    setRecording(sending);
                }
                else if (mediaRecorder?.state === 'paused') {
                    StateIndicator.setPaused(sending);
                }
                else {
                    setStopped();
                }
            };
            const setRecording = (sendingParam) => {
                setHtmlOfButtonStop(blinkFast('🔴') + (sendingParam ? 'Sending' : '◼ Stop'));
                setHtmlOfButtonPauseRecord(blinkFast('||') + ' Pause');
            };
            StateIndicator.setPaused = (sendingParam = sending) => {
                setHtmlOfButtonStop(blinkSlow('◼ ') + (sendingParam ? 'Sending' : 'Stop'));
                setHtmlOfButtonPauseRecord(blinkSlow('⬤') + ' Cont.');
            };
            const setStopped = () => {
                setHtmlOfButtonStop(sending ? blinkFast('◼') + ' Sending' : ' Stopped');
                setHtmlOfButtonPauseRecord('⬤ Record');
            };
            const setHtmlOfButtonStop = (html) => {
                buttonWithId("stopButton").innerHTML = html;
            };
            const setHtmlOfButtonPauseRecord = (html) => {
                buttonWithId("pauseRecordButton").innerHTML = html;
            };
        })(StateIndicator = Media.StateIndicator || (Media.StateIndicator = {}));
        const transcribeAndHandleResult = async (audioBlob) => {
            sending = true;
            StateIndicator.setPaused(true);
            const apiName = getApiSelectedInUi();
            if (!apiName) {
                insertAtCursor("You must select an API below.");
                return;
            }
            const promptForWhisper = () => transcriptionPrompt.value
                + INSERT_EDITOR_INTO_PROMPT ? mainEditorTextarea.value.substring(0, mainEditorTextarea.selectionStart /*The start is relevant b/c the selection will be overwritten by the
                                              new text. */).slice(-(750 /* Taking the last 750 chars is for sure less than the max 250 tokens whisper is considering. This is
            important because the last words of the last transcription should always be included to avoid hallucinations
            if it otherwise would be an incomplete sentence. */
                - transcriptionPrompt.value.length)) : "";
            const removeLastDot = (text) => {
                if (text.endsWith('.')) {
                    return text.slice(0, -1);
                }
                return text;
            };
            try {
                const result = async () => await HelgeUtils.Transcription.transcribe(apiName, audioBlob, getApiKey(), promptForWhisper());
                const removeLastDotIfApplicable = (input) => {
                    if (mainEditorTextarea.selectionStart < mainEditorTextarea.value.length) {
                        return removeLastDot(input);
                    }
                    return input;
                };
                if (mainEditorTextarea.selectionStart > 0)
                    insertAtCursor(" ");
                insertAtCursor(removeLastDotIfApplicable(await result()));
                UiFunctions.applyReplaceRulesToMainEditor();
                saveEditor();
                navigator.clipboard.writeText(mainEditorTextarea.value).then();
            }
            catch (error) {
                if (error instanceof HelgeUtils.Transcription.TranscriptionError) {
                    Log.log(JSON.stringify(error.payload, null, 2));
                    Log.showLog();
                }
                else {
                    // Handle other types of errors or rethrow
                    throw error;
                }
            }
            sending = false;
            StateIndicator.update();
        };
        const stopCallback = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];
            { // Download button
                downloadLink.href = URL.createObjectURL(audioBlob);
                downloadLink.download = 'recording.wav';
                downloadLink.style.display = 'block';
            }
            transcribeAndHandleResult(audioBlob).then(NotInUse.hideSpinner);
        };
        const getOnStreamReady = (beginPaused) => {
            return (streamParam) => {
                stream = streamParam;
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.start();
                isRecording = true;
                StateIndicator.update();
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
            StateIndicator.update();
            isRecording = false;
            HtmlUtils.Media.releaseMicrophone(stream);
        };
        // ############## stopButton ##############
        const stopButton = () => {
            if (isRecording) {
                stopRecording();
            }
            else {
                NotInUse.showSpinner();
                startRecording();
            }
        };
        buttonWithId("stopButton").addEventListener('click', stopButton);
        const sendButton = () => {
            if (mediaRecorder?.state === 'recording') {
                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    transcribeAndHandleResult(audioBlob).then(NotInUse.hideSpinner);
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
                StateIndicator.update();
            }
            else if (mediaRecorder?.state === 'paused') {
                mediaRecorder.resume();
                StateIndicator.update();
            }
            else {
                buttonWithId("stopButton").click();
            }
        };
        // ############## sendButton ##############
        buttonWithId("sendButton").addEventListener('click', sendButton);
        buttonWithId("pauseRecordButton").addEventListener('click', pauseRecordButton);
        // ############## transcribeAgainButton ##############
        function transcribeAgainButton() {
            NotInUse.showSpinner();
            transcribeAndHandleResult(audioBlob).then(NotInUse.hideSpinner);
        }
        HtmlUtils.addButtonClickListener(buttonWithId("transcribeAgainButton"), () => {
            transcribeAgainButton();
        });
        StateIndicator.update();
    })(Media = Buttons.Media || (Buttons.Media = {})); // End of media buttons
    Buttons.addButtonEventListeners = () => {
        // ############## Toggle Log Button ##############
        Log.addToggleLogButtonClickListener(textAreaWithId);
        // ############## Crop Highlights Button ##############
        const cropHighlights = () => {
            mainEditorTextarea.value = HelgeUtils.extractHighlights(mainEditorTextarea.value).join(' ');
            saveEditor();
        };
        HtmlUtils.addButtonClickListener(buttonWithId("cropHighlightsMenuItem"), () => {
            cropHighlights();
        });
        // ############## Copy Backup to clipboard ##############
        const copyBackupToClipboard = () => {
            navigator.clipboard.writeText("## Replace Rules\n" + replaceRulesTextArea.value + "\n"
                + "## Prompt\n" + transcriptionPrompt.value).then();
        };
        HtmlUtils.addButtonClickListener(buttonWithId("copyBackupMenuItem"), () => {
            copyBackupToClipboard();
        });
        // ############## Du2Ich Button ##############
        function du2ichMenuItem() {
            const value = Pures.du2ich(mainEditorTextarea.value);
            console.log(value);
            mainEditorTextarea.value = value;
            saveEditor();
        }
        HtmlUtils.addButtonClickListener(buttonWithId("du2ichMenuItem"), () => {
            du2ichMenuItem();
        });
        // ############## saveAPIKeyButton ##############
        function saveAPIKeyButton() {
            setApiKeyCookie(apiKeyInput.value);
            apiKeyInput.value = '';
        }
        HtmlUtils.addButtonClickListener(buttonWithId("saveAPIKeyButton"), () => {
            saveAPIKeyButton();
        });
        function clearButton() {
            mainEditorTextarea.value = '';
            saveEditor();
        }
        // clearButton
        HtmlUtils.addButtonClickListener(buttonWithId("clearButton"), () => {
            clearButton();
        });
        function replaceAgainButton() {
            UiFunctions.applyReplaceRulesToMainEditor();
        }
        // replaceAgainButton
        HtmlUtils.addButtonClickListener(buttonWithId("replaceAgainButton"), () => {
            replaceAgainButton();
        });
        // ############## undoButtons ##############
        const addUndoButtonEventListener = (undoButtonId, textArea) => {
            HtmlUtils.addButtonClickListener(buttonWithId(undoButtonId), () => {
                textArea.focus();
                //@ts-ignore
                document.execCommand('undo'); // Yes, deprecated, but works. I will replace it when it fails. Docs: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
            });
        };
        // undoButtonOfEditor
        addUndoButtonEventListener("undoButtonOfEditor", mainEditorTextarea);
        addUndoButtonEventListener("undoButtonOfReplaceRules", replaceRulesTextArea);
        addUndoButtonEventListener("undoButtonOfPrompt", transcriptionPrompt);
        // addReplaceRuleButton
        const addReplaceRule = () => {
            // add TextArea.selectedText() to the start of the replaceRulesTextArea
            TextAreas.setCursor(replaceRulesTextArea, 0);
            const selectedText = TextAreas.selectedText(mainEditorTextarea);
            TextAreas.insertTextAtCursor(replaceRulesTextArea, `"\\b${selectedText}\\b"gmu->"${selectedText}"\n`);
            TextAreas.setCursor(replaceRulesTextArea, 5 + selectedText.length);
            replaceRulesTextArea.focus();
        };
        HtmlUtils.addButtonClickListener(buttonWithId("addReplaceRuleButton"), addReplaceRule);
        function cancelButton() {
            saveEditor();
            window.location.reload();
        }
        // aboutButton
        HtmlUtils.addButtonClickListener(buttonWithId("cancelButton"), () => {
            cancelButton();
        });
        // copyButton
        /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
        const addEventListenerForCopyButton = (buttonId, inputElementId) => {
            buttonWithId(buttonId).addEventListener('click', () => {
                navigator.clipboard.writeText(inputElementWithId(inputElementId).value).then(() => {
                    buttonWithId(buttonId).textContent = '⎘ Copied!';
                    setTimeout(() => {
                        buttonWithId(buttonId).textContent = '⎘ Copy';
                    }, 2000);
                });
            });
        };
        // copyButtons
        addEventListenerForCopyButton("copyButton", "mainEditorTextarea");
        addEventListenerForCopyButton("copyReplaceRulesButton", "replaceRulesTextArea");
        addEventListenerForCopyButton("copyPromptButton", "transcriptionPrompt");
        buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
            inputElementWithId('apiKey').value = ''; // Clear the input field
        });
        apiSelector.addEventListener('change', () => {
            HtmlUtils.Cookies.set('apiSelector', apiSelector.value);
        });
    };
})(Buttons || (Buttons = {}));
const getApiKey = () => HtmlUtils.Cookies.get(apiSelector.value + 'ApiKey');
const setApiKeyCookie = (apiKey) => {
    HtmlUtils.Cookies.set(apiSelector.value + 'ApiKey', apiKey);
};
export const loadFormData = () => {
    const Cookies = HtmlUtils.Cookies;
    mainEditorTextarea.value = Cookies.get("editorText");
    transcriptionPrompt.value = Cookies.get("prompt");
    replaceRulesTextArea.value = Cookies.get("replaceRules");
    apiSelector.value = Cookies.get("apiSelector") ?? 'OpenAI';
};
export const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
};
const init = () => {
    Buttons.addButtonEventListeners();
    registerServiceWorker();
    loadFormData();
};
init();
//# sourceMappingURL=script.js.map