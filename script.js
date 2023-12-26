var WebUtils;
(function (WebUtils) {
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
    })(TextAreas = WebUtils.TextAreas || (WebUtils.TextAreas = {}));
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
    })(Cookies = WebUtils.Cookies || (WebUtils.Cookies = {}));
    /**
     * Adds a click listener to a button that appends a checkmark to the button
     * text when clicked. */
    WebUtils.addButtonClickListener = (button, callback) => {
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
})(WebUtils || (WebUtils = {}));
var HelgeUtils;
(function (HelgeUtils) {
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
})(HelgeUtils || (HelgeUtils = {}));
var AppSpecific;
(function (AppSpecific) {
    let PageLogic;
    (function (PageLogic) {
        const saveAPIKeyButton = document.getElementById('saveAPIKeyButton');
        const recordButton = document.getElementById('recordButton');
        const pauseButton = document.getElementById('pauseButton');
        const clearButton = document.getElementById('clearButton');
        const downloadButton = document.getElementById('downloadButton');
        const savePromptButton = document.getElementById('savePromptButton');
        const saveRulesButton = document.getElementById('saveRulesButton');
        const saveEditorButton = document.getElementById('saveEditorButton');
        const copyButton = document.getElementById('copyButton');
        const apiKeyInput = document.getElementById('apiKey');
        PageLogic.editorTextarea = document.getElementById('editorTextarea');
        PageLogic.whisperPrompt = document.getElementById('whisperPrompt');
        PageLogic.replaceRulesTextArea = document.getElementById('replaceRulesTextArea');
        const spinner = document.querySelector('.spinner');
        let apiKey = '';
        let mediaRecorder;
        let audioChunks = [];
        let isRecording = false;
        PageLogic.addButtonEventListeners = () => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                isRecording = false;
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    const audioURL = URL.createObjectURL(audioBlob);
                    { // Download button (hidden, b/c not working)
                        downloadButton.href = audioURL;
                        downloadButton.download = 'recording.wav';
                        // downloadButton.style.display = 'block';
                    }
                    sendToWhisper(audioBlob).then(hideSpinner);
                };
                recordButton.addEventListener('click', () => {
                    if (!isRecording) {
                        showSpinner();
                        mediaRecorder.start();
                        isRecording = true;
                        recordButton.textContent = '◼ Stop';
                    }
                    else {
                        mediaRecorder.stop();
                        isRecording = false;
                        recordButton.textContent = '⬤ Record';
                    }
                });
            });
            // pauseButton
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
            // saveAPIKeyButton
            WebUtils.addButtonClickListener(saveAPIKeyButton, () => {
                apiKey = apiKeyInput.value;
                WebUtils.Cookies.set('apiKey', apiKey);
            });
            // clearButton
            WebUtils.addButtonClickListener(clearButton, () => {
                PageLogic.editorTextarea.value = '';
            });
            // saveEditorButton
            WebUtils.addButtonClickListener(saveEditorButton, () => {
                WebUtils.Cookies.set("editorText", PageLogic.editorTextarea.value);
            });
            // savePromptButton
            WebUtils.addButtonClickListener(savePromptButton, () => {
                WebUtils.Cookies.set("prompt", PageLogic.whisperPrompt.value);
            });
            // saveRulesButton
            WebUtils.addButtonClickListener(saveRulesButton, () => {
                WebUtils.Cookies.set("replaceRules", PageLogic.replaceRulesTextArea.value);
            });
            // copyButton
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(PageLogic.editorTextarea.value).then(() => {
                    copyButton.textContent = '⎘ Copied!';
                    setTimeout(() => {
                        copyButton.textContent = '⎘ Copy';
                    }, 2000);
                });
            });
            document.getElementById('saveAPIKeyButton').addEventListener('click', function () {
                document.getElementById('apiKey').value = ''; // Clear the input field
            });
            document.querySelector('#whisperPromptInfoIcon')
                .addEventListener('click', function () {
                document.getElementById('whisperPromptInfoText').classList.toggle('hidden');
            });
            document.querySelector('#replaceRulesInfoIcon')
                .addEventListener('click', function () {
                document.getElementById('replaceRulesInfoText').classList.toggle('hidden');
            });
        };
        const sendToWhisper = async (audioBlob) => {
            const formData = new FormData();
            formData.append('file', audioBlob);
            formData.append('model', 'whisper-1'); // Using the largest model
            formData.append('prompt', PageLogic.whisperPrompt.value);
            const cookie = WebUtils.Cookies.get("apiKey");
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cookie}`
                },
                body: formData
            });
            const result = await response.json();
            if (result?.text) {
                WebUtils.TextAreas.insertTextAtCursor(PageLogic.editorTextarea, HelgeUtils.replaceByRules(result.text, PageLogic.replaceRulesTextArea.value));
            }
            else {
                PageLogic.editorTextarea.value +=
                    'You need an API key. Go to https://platform.openai.com/api-keys"> to get an API key. If you want to try it out beforehand, you can try it in the ChatGPT Android and iOS apps for free without API key.\n\n'
                        + JSON.stringify(result, null, 2);
            }
            navigator.clipboard.writeText(PageLogic.editorTextarea.value).then();
        };
        const showSpinner = () => {
            spinner.style.display = 'block';
        };
        const hideSpinner = () => {
            spinner.style.display = 'none';
        };
        PageLogic.loadFormData = () => {
            PageLogic.editorTextarea.value = WebUtils.Cookies.get("editorText");
            PageLogic.whisperPrompt.value = WebUtils.Cookies.get("prompt");
            PageLogic.replaceRulesTextArea.value = WebUtils.Cookies.get("replaceRules");
        };
        PageLogic.registerServiceWorker = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            }
        };
    })(PageLogic || (PageLogic = {}));
    const init = () => {
        PageLogic.addButtonEventListeners();
        PageLogic.registerServiceWorker();
        PageLogic.loadFormData();
    };
    init();
})(AppSpecific || (AppSpecific = {}));
//# sourceMappingURL=script.js.map