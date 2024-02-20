// noinspection JSUnusedGlobalSymbols,SpellCheckingInspection
/** Copyright by Helge Tobias Kosuch 2023
 *
 * Should be named WebUtils... but I am used to HtmlUtils.
 * */
import { HelgeUtils } from "./HelgeUtils.js";
const MAX_COOKIE_SIZE = 4096;
export var HtmlUtils;
(function (HtmlUtils) {
    // ########## Blinking fast and slow ##########
    // https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow
    var memoize = HelgeUtils.memoize;
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
        const element = document.getElementById(id);
        if (element === null) {
            HtmlUtils.printError(`Element with ID ${id} not found.`);
            return null;
        }
        return element;
    });
    HtmlUtils.buttonWithId = HtmlUtils.elementWithId;
    HtmlUtils.textAreaWithId = HtmlUtils.elementWithId;
    HtmlUtils.inputElementWithId = HtmlUtils.elementWithId;
    /**
     * These never return null. Instead, they throw a runtime error. */
    let NeverNull;
    (function (NeverNull) {
        var nullFilter = HelgeUtils.Misc.nullFilter;
        NeverNull.elementWithId = (id) => nullFilter(HtmlUtils.elementWithId, id);
        NeverNull.buttonWithId = (id) => nullFilter(HtmlUtils.buttonWithId, id);
        NeverNull.inputElementWithId = (id) => nullFilter(HtmlUtils.inputElementWithId, id);
        NeverNull.textAreaWithId = (id) => nullFilter(HtmlUtils.textAreaWithId, id);
    })(NeverNull = HtmlUtils.NeverNull || (HtmlUtils.NeverNull = {}));
    let TextAreas;
    (function (TextAreas) {
        var textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
        var trimExceptASingleNewlineAtTheEnd = HelgeUtils.Strings.trimExceptASingleNewlineAtTheEnd;
        class TextAreaWrapper {
            textArea;
            constructor(textArea) {
                this.textArea = textArea;
            }
            appendTextAndPutCursorAfter(text) {
                TextAreas.appendTextAndPutCursorAfter(this.textArea, text);
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
            insertTextAndPutCursorAfter(addedText) {
                TextAreas.insertTextAndPutCursorAfter(this.textArea, addedText);
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
        }
        TextAreas.TextAreaWrapper = TextAreaWrapper;
        TextAreas.appendTextAndPutCursorAfter = (textArea, text) => {
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
                    storage.set(storageKey, text);
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
        TextAreas.insertTextAndPutCursorAfter = (textarea, addedText) => {
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
    })(TextAreas = HtmlUtils.TextAreas || (HtmlUtils.TextAreas = {}));
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
        let LocalStorageVerified;
        (function (LocalStorageVerified) {
            LocalStorageVerified.set = (itemName, itemValue) => {
                LocalStorage.set(itemName, itemValue);
                // console.log(`itemValue: ${itemValue.length}`)
                const reread = LocalStorage.get(itemName);
                // console.log(`reread: ${reread?.length}`)
                if (reread !== itemValue) {
                    throw new Error(`Local storage item "${itemName}"'s was not stored correctly!`);
                }
            };
            LocalStorageVerified.get = (name) => {
                return LocalStorage.get(name);
            };
        })(LocalStorageVerified = BrowserStorage.LocalStorageVerified || (BrowserStorage.LocalStorageVerified = {}));
        let LocalStorage;
        (function (LocalStorage) {
            /**
             * Sets a local storage item with the given name and value.
             *
             * @throws Error if the local storage item value exceeds 5242880 characters.*/
            LocalStorage.set = (itemName, itemValue) => {
                localStorage.setItem(itemName, itemValue);
            };
            LocalStorage.get = (name) => {
                return localStorage.getItem(name);
            };
        })(LocalStorage = BrowserStorage.LocalStorage || (BrowserStorage.LocalStorage = {}));
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
            HtmlUtils.printError(`Element with ID ${buttonId} not found.`);
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
    let ErrorHandling;
    (function (ErrorHandling) {
        var Exceptions = HelgeUtils.Exceptions;
        var callSwallowingExceptions = Exceptions.callSwallowingExceptions;
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
                    return true; // Prevents the default browser error handling
                };
            };
        })(ExceptionHandlers = ErrorHandling.ExceptionHandlers || (ErrorHandling.ExceptionHandlers = {}));
        /**
         * Should be named "ouputError" because it uses alert and console.log, but
         * I am used to "printError".
         * This outputs aggressively on top of everything to the user. */
        ErrorHandling.printError = (str) => {
            console.log(str);
            alert(str);
            callSwallowingExceptions(() => {
                document.body.insertAdjacentHTML('afterbegin', `<div 
              style="background-color: #000000; color:red;"> 
            <p style="font-size: 30px;">###### printError</p>
            <p style="font-size:18px;">${HtmlUtils.escapeHtml(str)}</p>`
                    + `########</div>`);
            });
        };
        /**
         * This outputs gently. Might not be seen by the user.  */
        ErrorHandling.printDebug = (str) => {
            console.log(str);
            HelgeUtils.Exceptions.callSwallowingExceptions(() => {
                document.body.insertAdjacentHTML('beforeend', `<div 
              style="z-index: 9999; background-color: #00000000; color:red;"> 
            <p style="font-size:18px;">${HtmlUtils.escapeHtml(str)}</p>`
                    + `</div>`);
            });
        };
    })(ErrorHandling = HtmlUtils.ErrorHandling || (HtmlUtils.ErrorHandling = {}));
    HtmlUtils.printDebug = ErrorHandling.printDebug;
    HtmlUtils.printError = ErrorHandling.printError;
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
    /**
     * Deprecated! Use copyToClipboard instead.
     * @param str
     */
    HtmlUtils.putIntoClipboard = (str) => {
        navigator.clipboard.writeText(str).then();
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
            var elementWithId = NeverNull.elementWithId;
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
})(HtmlUtils || (HtmlUtils = {})); // End of HtmlUtils
//# sourceMappingURL=HtmlUtils.js.map