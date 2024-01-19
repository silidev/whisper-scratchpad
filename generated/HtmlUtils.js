// noinspection JSUnusedGlobalSymbols,SpellCheckingInspection
/** Copyright by Helge Tobias Kosuch 2023
 *
 * Should be named WebUtils... but I am used to HtmlUtils.
 * */
import { HelgeUtils } from "./HelgeUtils.js";
export var HtmlUtils;
(function (HtmlUtils) {
    const memoize = HelgeUtils.memoize;
    // ########## Blinking fast and slow ##########
    // https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow
    /**
     * .blinkingFast {
     *  animation: blink 1s linear infinite;
     * }
     */
    HtmlUtils.blinkFast = (message) => `<span class="blinkingFast">${message}</span>`;
    /**
     * .blinkingSlow {
     *  animation: blink 2s linear infinite;
     * }
     */
    HtmlUtils.blinkSlow = (message) => `<span class="blinkingSlow">${message}</span>`;
    HtmlUtils.elementWithId = memoize((id) => {
        return document.getElementById(id);
    });
    HtmlUtils.buttonWithId = HtmlUtils.elementWithId;
    HtmlUtils.textAreaWithId = HtmlUtils.elementWithId;
    HtmlUtils.inputElementWithId = HtmlUtils.elementWithId;
    let TextAreas;
    (function (TextAreas) {
        TextAreas.appendText = (textArea, text) => {
            textArea.value += " " + text;
            TextAreas.setCursor(textArea, textArea.value.length);
        };
        TextAreas.selectedText = (textArea) => {
            const start = textArea.selectionStart;
            const end = textArea.selectionEnd;
            return textArea.value.substring(start, end);
        };
        /**
         * Makes a text area element auto-save its content to a cookie after each modified character (input event).
         * @param cookieName - The name of the cookie to store the text area content.
         * @param id - The ID of the text area element.
         */
        TextAreas.setAutoSave = (cookieName, id) => {
            HtmlUtils.textAreaWithId(id).addEventListener('input', () => {
                Cookies.set(cookieName, HtmlUtils.textAreaWithId(id).value);
            });
        };
        TextAreas.getCursor = (textArea) => {
            return textArea.selectionStart;
        };
        TextAreas.setCursor = (textArea, position) => {
            textArea.setSelectionRange(position, position);
        };
        /**
         * Inserts text at the cursor position in a text area. If something is selected it will be overwritten.
         */
        TextAreas.insertTextAtCursor = (textarea, addedText) => {
            if (!addedText)
                return;
            const textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
            const textAfterSelection = textarea.value.substring(textarea.selectionEnd);
            TextAreas.setCursor(textarea, 0);
            textarea.value = textBeforeSelection + addedText + textAfterSelection;
            TextAreas.setCursor(textarea, textBeforeSelection.length + addedText.length);
            textarea.focus();
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
    HtmlUtils.addClickListener = (element, callback) => {
        const initialHTML = element.innerHTML; // Read initial HTML from the button
        const checkmark = ' ✔️'; // Unicode checkmark
        element.addEventListener('click', () => {
            callback();
            element.innerHTML += checkmark; // Append checkmark to the button HTML
            setTimeout(() => {
                element.innerHTML = initialHTML; // Reset the button HTML after 2 seconds
            }, 500);
        });
    };
    HtmlUtils.scrollToBottom = () => {
        window.scrollBy(0, 100000);
    };
    /**
     * This outputs aggressively on top of everything to the user. */
    HtmlUtils.printError = (str) => {
        console.log(str);
        HelgeUtils.Exceptions.callSwallowingExceptions(() => {
            document.body.insertAdjacentHTML('afterbegin', `<div 
              style="position: fixed; z-index: 9999; background-color: #000000; color:red;"> 
            <p style="font-size: 30px;">###### printDebug</p>
            <p style="font-size:18px;">${HtmlUtils.escapeHtml(str)}</p>`
                + `########</div>`);
        });
    };
    /**
     * This outputs gently. Might not be seen by the user.  */
    HtmlUtils.printDebug = (str) => {
        console.log(str);
        HelgeUtils.Exceptions.callSwallowingExceptions(() => {
            document.body.insertAdjacentHTML('beforeend', `<div 
              style="z-index: 9999; background-color: #00000000; color:red;"> 
            <p style="font-size:18px;">${HtmlUtils.escapeHtml(str)}</p>`
                + `</div>`);
        });
    };
    HtmlUtils.escapeHtml = (input) => {
        const element = document.createElement("div");
        element.innerText = input;
        return element.innerHTML;
    };
    HtmlUtils.copyToClipboard = (text) => navigator.clipboard.writeText(text);
    /**
     * Deprecated! Use copyToClipboard instead.
     * @param str
     */
    HtmlUtils.putIntoClipboard = (str) => {
        navigator.clipboard.writeText(str).then();
    };
})(HtmlUtils || (HtmlUtils = {}));
//# sourceMappingURL=HtmlUtils.js.map