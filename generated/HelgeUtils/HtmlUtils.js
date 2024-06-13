// noinspection JSUnusedGlobalSymbols
/** Copyright by Helge Tobias Kosuch 2023
 *
 * Should be named DomUtils... but I am used to HtmlUtils.
 * */
// Merge help: The following lines must be commented out in the Project Anca:
import { HelgeUtils } from "./HelgeUtils.js";
// Merge help end
var parseFloatWithNull = HelgeUtils.Conversions.parseFloatWithNull;
// ***** Config ****
const globalDefaultExceptionHandler = true;
const MAX_COOKIE_SIZE = 4096;
export var HtmlUtils;
(function (HtmlUtils) {
    var memoize = HelgeUtils.memoize;
    let ErrorHandling;
    (function (ErrorHandling) {
        var Exceptions = HelgeUtils.Exceptions;
        var unhandledExceptionAlert = Exceptions.unhandledExceptionAlert;
        let ExceptionHandlers;
        (function (ExceptionHandlers) {
            ExceptionHandlers.installGlobalDefault = () => {
                window.onerror = (message, source, lineNo, colNo, error) => {
                    const errorMessage = `An error occurred: ${message}\nSource: ${source}\nLine: ${lineNo}\nColumn: ${colNo}\nError Object: ${error}`;
                    ErrorHandling.printError(unhandledExceptionAlert(error ?? errorMessage)
                    /* unhandledExceptionAlert is sometimes executed twice here. I
                     don't know why. The debugger didn't help. This shouldn't
                     happen anyway. Don't invest more time. */
                    );
                    throw "Was handled by installGlobalDefault";
                    // return true; // Prevents the default browser error handling
                };
            };
            if (globalDefaultExceptionHandler) {
                ExceptionHandlers.installGlobalDefault();
            }
        })(ExceptionHandlers = ErrorHandling.ExceptionHandlers || (ErrorHandling.ExceptionHandlers = {}));
        /**
         * This outputs aggressively on top of everything to the user. */
        // eslint-disable-next-line no-shadow
        ErrorHandling.printError = (input) => {
            console.log(input);
            // alert(input)
            document.body.insertAdjacentHTML('afterbegin', `<div style="position: fixed; z-index: 9999; background-color: #000000; color:red;"> 
            <p style="font-size: 30px;">###### printError</p>
            <p style="font-size:18px;">${HtmlUtils.escapeHtml(input.toString())}</p>`
                + `########</div>`);
        };
        /**
         * This outputs gently. Might not be seen by the user.  */
        ErrorHandling.printDebug = (str, parentElement = document.body) => {
            HtmlUtils.showToast(str.substring(0, 80));
            console.log(str);
            HelgeUtils.Exceptions.callSwallowingExceptions(() => {
                parentElement.insertAdjacentHTML('beforeend', `<div 
              style="z-index: 9999; background-color: #00000000; color:red;"> 
            <p style="font-size:18px;">${HtmlUtils.escapeHtml(str)}</p>`
                    + `</div>`);
            });
        };
    })(ErrorHandling = HtmlUtils.ErrorHandling || (HtmlUtils.ErrorHandling = {}));
    var printError = HtmlUtils.ErrorHandling.printError;
    HtmlUtils.createDivElementFromHtml = (html) => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;
        return tempElement;
    };
    // ########## Blinking fast and slow ##########
    // https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow
    /**
     * .blinkingFast {
     *  animation: blink 1s linear infinite
     * }
     */
    HtmlUtils.blinkFast = (message) => `<span class="blinkingFast">${message}</span>`;
    /**
     * .blinkingSlow {
     *  animation: blink 2s linear infinite
     * }
     */
    HtmlUtils.blinkSlow = (message) => `<span class="blinkingSlow">${message}</span>`;
    HtmlUtils.elementWithId = memoize((id) => {
        return document.getElementById(id);
    });
    HtmlUtils.buttonWithId = HtmlUtils.elementWithId;
    HtmlUtils.textAreaWithId = HtmlUtils.elementWithId;
    HtmlUtils.inputElementWithId = HtmlUtils.elementWithId;
    /** These never return null. Instead, they throw a runtime error.
     * "Nte" in the name means "null throws exception".
     * Old name: NullFilter */
    let NullThrowsException;
    (function (NullThrowsException) {
        var nullFilter = HelgeUtils.Misc.nullFilter;
        /** @see NullThrowsException */
        NullThrowsException.querySelectorNte = (element, selector) => {
            return nullFilter(element.querySelector(selector));
        };
        /** @see NullThrowsException */
        NullThrowsException.elementWithIdNte = (id) => nullFilter(HtmlUtils.elementWithId(id));
        /** @see NullThrowsException */
        NullThrowsException.buttonWithIdNte = (id) => nullFilter(HtmlUtils.buttonWithId(id));
        /** @see NullThrowsException */
        NullThrowsException.inputElementWithIdNte = (id) => nullFilter(HtmlUtils.inputElementWithId(id));
        /** @see NullThrowsException */
        NullThrowsException.textAreaWithIdNte = (id) => nullFilter(HtmlUtils.textAreaWithId(id));
    })(NullThrowsException = HtmlUtils.NullThrowsException || (HtmlUtils.NullThrowsException = {}));
    // Merge help: The following lines must be commented out in the Project Anca:
    let TextAreas;
    (function (TextAreas) {
        // eslint-disable-next-line no-shadow
        var textAreaWithId = HtmlUtils.NullThrowsException.textAreaWithIdNte;
        var trimExceptASingleNewlineAtTheEnd = HelgeUtils.Strings.trimExceptASingleNewlineAtTheEnd;
        var Strings = HelgeUtils.Strings;
        var escapeRegExp = HelgeUtils.Strings.escapeRegExp;
        // npm import textarea-caret:
        class TextAreaWrapper {
            textArea;
            constructor(textArea) {
                this.textArea = textArea;
            }
            findWholeWordCaseInsensitiveAndSelect(search) {
                TextAreas.FindCaseInsensitiveAndSelect.wholeWord(this.textArea, search);
                return this;
            }
            appendTextAndPutCursorAfter(text) {
                TextAreas.appendTextAndCursor(this.textArea, text);
                return this;
            }
            append(text) {
                TextAreas.append(this.textArea, text);
                return this;
            }
            selectedText() {
                const start = this.textArea.selectionStart;
                const end = this.textArea.selectionEnd;
                return this.textArea.value.substring(start, end);
            }
            setCursor(position) {
                TextAreas.setCursor(this.textArea, position);
                return this;
            }
            insertAndPutCursorAfter(addedText) {
                TextAreas.insertAndPutCursorAfter(this.textArea, addedText);
                return this;
            }
            getCursor() {
                return TextAreas.getCursor(this.textArea);
            }
            setAutoSave(cookieName, handleError, storage) {
                TextAreas.setAutoSave(cookieName, this.textArea.id, handleError, storage);
                return this;
            }
            value() {
                return this.textArea.value;
            }
            setValue(value) {
                this.textArea.value = value;
                return this;
            }
            focus() {
                this.textArea.focus();
                return this;
            }
            setCursorAtEnd() {
                this.setCursor(this.textArea.value.length);
                return this;
            }
            trim() {
                this.textArea.value = trimExceptASingleNewlineAtTheEnd(this.textArea.value);
                return this;
            }
            /**
             * @deprecated */
            goToEnd() {
                return this.setCursorAtEnd();
            }
        }
        TextAreas.TextAreaWrapper = TextAreaWrapper;
        TextAreas.appendTextAndCursor = (textArea, text) => {
            TextAreas.append(textArea, text);
            TextAreas.setCursor(textArea, textArea.value.length);
        };
        TextAreas.append = (textArea, text) => {
            textArea.value += text;
        };
        TextAreas.selectedText = (textArea) => {
            const start = textArea.selectionStart;
            const end = textArea.selectionEnd;
            return textArea.value.substring(start, end);
        };
        /**
         * Makes a text area element auto-save its content to a cookie after each modified character (input event).
         * @param storageKey - The name of the cookie to store the text area content.
         * @param id - The ID of the text area element.
         * @param handleError - A function to call when an error occurs.
         * @param storage
         */
        TextAreas.setAutoSave = (storageKey, id, handleError, storage) => {
            textAreaWithId(id).addEventListener('input', () => {
                const text = textAreaWithId(id).value;
                try {
                    storage.setString(storageKey, text);
                }
                catch (e) {
                    handleError(`${storageKey}: Text area content exceeds 4095 characters. Content will not be saved.`);
                }
            });
        };
        TextAreas.getCursor = (textArea) => {
            return textArea.selectionStart;
        };
        TextAreas.setCursor = (textArea, position) => {
            textArea.setSelectionRange(position, position);
        };
        /**
         * Inserts text at the cursor position in a text area. If something is
         * selected it will be overwritten. */
        TextAreas.insertAndPutCursorAfter = (textarea, addedText) => {
            if (!addedText)
                return;
            const textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
            const textAfterSelection = textarea.value.substring(textarea.selectionEnd);
            TextAreas.setCursor(textarea, 0);
            textarea.value = textBeforeSelection + addedText + textAfterSelection;
            TextAreas.setCursor(textarea, textBeforeSelection.length + addedText.length);
            textarea.focus();
        };
        TextAreas.scrollToEnd = (logTextArea) => {
            logTextArea.scrollTop = logTextArea.scrollHeight;
        };
        /**
         * Find the next occurrence of a string in a text area and select it.
         *
         * It can also scroll the found occurrence into view, IF
         * script type="module" src="node_modules/textarea-caret/index.js">
         *   /script>
         * "^3.1.0" is included in the HTML file. */
        let FindCaseInsensitiveAndSelect;
        (function (FindCaseInsensitiveAndSelect) {
            const step2 = (cursor, textArea, target) => {
                if (cursor >= 0) {
                    textArea.setSelectionRange(cursor, cursor + target.length);
                }
                else {
                    // not found, start from the beginning
                    TextAreas.setCursor(textArea, 0);
                }
                textArea.focus();
                // Scroll to selectionStart:
                {
                    /** Needs
                     * script type="module" src="node_modules/textarea-caret/index.js">
                     *   /script>*/
                    const getCaretCoordinates = window["getCaretCoordinates"];
                    if (typeof getCaretCoordinates !== 'undefined') {
                        textArea.scrollTop = getCaretCoordinates(textArea, textArea.selectionEnd).top;
                    }
                }
            };
            FindCaseInsensitiveAndSelect.wholeWord = (textArea, target) => {
                const regex = new RegExp(`\\b${escapeRegExp(target).toLowerCase()}\\b`);
                const cursor = Strings.regexIndexOf(textArea.value.toLowerCase(), regex, textArea.selectionEnd);
                step2(cursor, textArea, target);
            };
            FindCaseInsensitiveAndSelect.normal = (textArea, target) => {
                const cursor = textArea.value.toLowerCase().indexOf(target, textArea.selectionEnd);
                step2(cursor, textArea, target);
            };
        })(FindCaseInsensitiveAndSelect = TextAreas.FindCaseInsensitiveAndSelect || (TextAreas.FindCaseInsensitiveAndSelect = {}));
    })(TextAreas = HtmlUtils.TextAreas || (HtmlUtils.TextAreas = {}));
    // end of Merge help
    let Media;
    (function (Media) {
        Media.releaseMicrophone = (stream) => {
            if (!stream)
                return;
            stream.getTracks().forEach(track => track.stop());
        };
    })(Media = HtmlUtils.Media || (HtmlUtils.Media = {}));
    let BrowserStorage;
    (function (BrowserStorage) {
        class BsProviderExtras {
            setJsonStringified(itemName, itemValue) {
                this.setString(itemName, JSON.stringify(itemValue));
            }
            getAndJsonParse(name) {
                const item = this.getString(name);
                if (item) {
                    try {
                        return JSON.parse(item);
                    }
                    catch (e) {
                        console.error('Error parsing JSON from localStorage', e);
                    }
                }
                return null;
            }
            ;
            getNumber(name) {
                return parseFloatWithNull(this.getString(name));
            }
            setNumber(name, value) {
                this.setString(name, value.toString());
            }
        }
        BrowserStorage.BsProviderExtras = BsProviderExtras;
        class LocalStorage extends BsProviderExtras {
            isAvailable() {
                return true;
            }
            clear(prefix) {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            }
            getAllKeys() {
                return Object.keys(localStorage);
            }
            /** Sets a local storage item with the given name and value.
             * @throws Error if the local storage item value exceeds 5242880 characters.*/
            setString(itemName, itemValue) {
                localStorage.setItem(itemName, itemValue);
            }
            getString(name) {
                return localStorage.getItem(name);
            }
        }
        BrowserStorage.LocalStorage = LocalStorage;
        let Cookies;
        (function (Cookies) {
            /**
             * Sets a cookie with the given name and value.
             *
             * @throws Error if the cookie value exceeds 4095 characters.*/
            Cookies.set = (cookieName, cookieValue) => {
                const expirationTime = new Date(Date.now() + 2147483647000).toUTCString();
                document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)};expires=${expirationTime};path=/`;
                const message = `Cookie "${cookieName}"'s value exceeds maximum characters of ${MAX_COOKIE_SIZE}.`;
                if (document.cookie.length > MAX_COOKIE_SIZE) {
                    throw new Error(message);
                }
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
        })(Cookies = BrowserStorage.Cookies || (BrowserStorage.Cookies = {}));
        let Misc;
        (function (Misc) {
            /** A mode whose status is stored to a persistent storage, e. g. localStorage. */
            class StoredMode {
                _storage;
                _enabled;
                /** key used in storage */
                _enabledKey;
                constructor(_storageKey, _storage) {
                    this._storage = _storage;
                    this._enabledKey = _storageKey + '._enabled';
                    this._enabled = _storage.getAndJsonParse(this._enabledKey) ?? false;
                }
                enabled = () => {
                    return this._enabled;
                };
                saveToStorage = () => {
                    this._storage.setJsonStringified(this._enabledKey, this._enabled);
                };
                enable = () => {
                    this._enabled = true;
                    this.saveToStorage();
                };
                disable = () => {
                    this._enabled = false;
                    this.saveToStorage();
                };
                toggle = () => {
                    if (this._enabled) {
                        this.disable();
                        return;
                    }
                    this.enable();
                };
            }
            Misc.StoredMode = StoredMode;
        })(Misc = BrowserStorage.Misc || (BrowserStorage.Misc = {}));
    })(BrowserStorage = HtmlUtils.BrowserStorage || (HtmlUtils.BrowserStorage = {}));
    /**
     * Known "problems": If the user clicks on the button multiple times in a row, the checkmark will
     * be appended multiple times. ... no time for that. Where possible just use HtmlUtils.addClickListener(...).
     */
    HtmlUtils.signalClickToUser = (element) => {
        const before = element.innerHTML;
        element.innerHTML += "✔️";
        setTimeout(() => element.innerHTML = before, 500);
    };
    /**
     * Adds a click listener to a button that appends a checkmark to the button
     * text when clicked. */
    HtmlUtils.addClickListener = (buttonId, callback) => {
        const element = HtmlUtils.buttonWithId(buttonId);
        if (element === null) {
            printError(`Button with ID ${buttonId} not found.`);
            return;
        }
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
    HtmlUtils.escapeHtml = (input) => {
        const element = document.createElement("div");
        element.innerText = input;
        return element.innerHTML;
    };
    /**
     # DOMException Read permission denied error
     you're encountering when calling navigator.clipboard.readText() is likely due to the permissions and security restrictions around accessing the clipboard in web browsers. Here are some key points to consider and potential solutions:
     User Interaction Required: Most modern browsers require a user-initiated action, like a click event, to access the clipboard. Make sure your code is triggered by such an action.
     Secure Context: Clipboard access is only allowed in a secure context (HTTPS), not on HTTP pages.
     Permissions: Depending on the browser, your site may need explicit permission from the user to access the clipboard.
     Browser Support: Ensure that the browser you are using supports the Clipboard API.
     Cross-Origin Restrictions: If your script is running in an iframe, it might be subject to cross-origin restrictions.
     */
    // eslint-disable-next-line no-shadow
    let Clipboard;
    (function (Clipboard) {
        /** @deprecated */
        Clipboard.read = () => {
            throw new Error("Deprecated! Use navigator.clipboard.readText instead.");
        };
        /** @deprecated */
        Clipboard.write = () => {
            throw new Error("Deprecated! Use navigator.clipboard.readText instead.");
        };
    })(Clipboard = HtmlUtils.Clipboard || (HtmlUtils.Clipboard = {}));
    /** @deprecated Inline this and replace the error handler with your own
     * error reporting. */
    let clipboard;
    (function (clipboard) {
        /** @deprecated Inline this and replace the error handler with your own
         * error reporting. */
        clipboard.read = (f) => {
            navigator.clipboard.readText().then(text => {
                f(text);
            }).catch(err => {
                console.error('Failed to read clipboard contents: ', err);
                throw err;
            });
            //end of namespace Misc:
        };
        /** @deprecated Rather use read() */
        clipboard.readText = () => navigator.clipboard.readText();
    })(clipboard = HtmlUtils.clipboard || (HtmlUtils.clipboard = {}));
    /**
     * @deprecated Use copyToClipboard instead.
     * @param str
     */
    HtmlUtils.putIntoClipboard = (str) => {
        navigator.clipboard.writeText(str).then().catch(ErrorHandling.printError);
    };
    HtmlUtils.stripHtmlTags = (input) => {
        return input.replace(/<\/?[^>]+(>|$)/g, "");
    };
    HtmlUtils.isMsWindows = () => {
        return navigator.userAgent.match(/Windows/i);
    };
    let Menus;
    (function (Menus) {
        /** https://www.webcomponents.org/element/@vanillawc/wc-menu-wrapper */
        let WcMenu;
        (function (WcMenu) {
            var elementWithId = NullThrowsException.elementWithIdNte;
            WcMenu.close = (menuHeadingId) => {
                elementWithId(menuHeadingId).dispatchEvent(new CustomEvent('rootMenuClose'));
            };
            WcMenu.addItem = (menuHeadingId) => {
                return (id, menuFunction) => {
                    HtmlUtils.addClickListener(id, () => {
                        menuFunction();
                        WcMenu.close(menuHeadingId);
                    });
                };
            };
        })(WcMenu = Menus.WcMenu || (Menus.WcMenu = {}));
    })(Menus = HtmlUtils.Menus || (HtmlUtils.Menus = {}));
    // eslint-disable-next-line no-shadow
    let Keyboard;
    (function (Keyboard) {
        /**
         * Inline this function!
         */
        Keyboard.addKeyboardBindings = () => {
            document.addEventListener('keyup', (event) => {
                //console.log(event.key, event.shiftKey, event.ctrlKey, event.altKey)
                if (event.key === 'X' && event.shiftKey && event.ctrlKey) {
                    // Prevent default action to avoid any browser shortcut conflicts
                    event.preventDefault();
                    // Do something here!
                }
            });
        };
    })(Keyboard = HtmlUtils.Keyboard || (HtmlUtils.Keyboard = {}));
    let Styles;
    (function (Styles) {
        Styles.toggleDisplayNone = (element, visibleDisplayStyle) => {
            if (element.style.display === "none") {
                element.style.display = visibleDisplayStyle;
            }
            else {
                element.style.display = "none";
            }
        };
    })(Styles = HtmlUtils.Styles || (HtmlUtils.Styles = {}));
    /**
     * showToast
     *
     * Often the project defines a project-specific showToast function.
     *
     * Search keywords: "toast message", "toast notification", "toast popup", "alert"
     *
     * @param message
     * @param durationMs
     */
    HtmlUtils.showToast = (message, durationMs = 1000) => {
        const alertBox = document.createElement("div");
        alertBox.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translateX(-50%);
      background-color: darkblue;
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 999999;
    `;
        alertBox.textContent = message;
        document.body.appendChild(alertBox);
        setTimeout(() => {
            alertBox.remove();
        }, durationMs);
    };
    /**
     * @deprecated Use showToast instead. */
    HtmlUtils.alertAutoDismissing = HtmlUtils.showToast;
    let Misc;
    (function (Misc) {
        /** Offers a string or blob as a file to the user for download. */
        Misc.downloadOffer = (input, filename) => {
            let blob;
            // If input is a string convert it to a Blob
            if (typeof input === 'string') {
                blob = new Blob([input], { type: 'text/plain' });
            }
            else {
                blob = input;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };
        Misc.loadScript = (srcUri, afterLoad) => {
            const script = document.createElement('script');
            script.src = srcUri;
            script.async = true;
            script.onload = afterLoad;
            document.head.appendChild(script);
        };
        Misc.removeBySelector = (doc, selector) => {
            doc.querySelectorAll(selector).forEach(e => e.remove());
        };
    })(Misc = HtmlUtils.Misc || (HtmlUtils.Misc = {}));
})(HtmlUtils || (HtmlUtils = {}));
//# sourceMappingURL=HtmlUtils.js.map