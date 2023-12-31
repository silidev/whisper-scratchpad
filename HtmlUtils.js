import { HelgeUtils } from "./HelgeUtils.js";
export var HtmlUtils;
(function (HtmlUtils) {
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
    const memoize = HelgeUtils.memoize;
    HtmlUtils.elementWithId = memoize((id) => {
        return document.getElementById(id);
    });
    HtmlUtils.buttonWithId = HtmlUtils.elementWithId;
    HtmlUtils.textAreaWithId = HtmlUtils.elementWithId;
    HtmlUtils.inputElementWithId = HtmlUtils.elementWithId;
    let TextAreas;
    (function (TextAreas) {
        TextAreas.selectedText = (textarea) => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            return textarea.value.substring(start, end);
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
        TextAreas.getCursor = (textarea) => {
            return textarea.selectionStart;
        };
        TextAreas.setCursor = (textarea, position) => {
            textarea.setSelectionRange(position, position);
        };
        TextAreas.insertTextAtCursor = (textarea, addedText) => {
            if (!addedText)
                return;
            const cursorPosition = textarea.selectionStart;
            const textBeforeCursor = textarea.value.substring(0, cursorPosition);
            const textAfterCursor = textarea.value.substring(cursorPosition);
            textarea.value = textBeforeCursor + addedText + textAfterCursor;
            const newCursorPosition = cursorPosition + addedText.length;
            TextAreas.setCursor(textarea, newCursorPosition);
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
            }, 500);
        });
    };
})(HtmlUtils || (HtmlUtils = {}));
//# sourceMappingURL=HtmlUtils.js.map