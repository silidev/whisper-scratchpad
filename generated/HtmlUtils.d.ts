export declare namespace HtmlUtils {
    /**
     * .blinkingFast {
     *  animation: blink 1s linear infinite
     * }
     */
    const blinkFast: (message: string) => string;
    /**
     * .blinkingSlow {
     *  animation: blink 2s linear infinite
     * }
     */
    const blinkSlow: (message: string) => string;
    const elementWithId: (...args: string[]) => HTMLElement | null;
    const buttonWithId: (id: string) => HTMLButtonElement | null;
    const textAreaWithId: (id: string) => HTMLTextAreaElement | null;
    const inputElementWithId: (id: string) => HTMLInputElement | null;
    /**
     * These never return null. Instead, they throw a runtime error. */
    namespace NeverNull {
        const elementWithId: (id: string) => HTMLElement;
        const buttonWithId: (id: string) => HTMLButtonElement;
        const inputElementWithId: (id: string) => HTMLInputElement;
        const textAreaWithId: (id: string) => HTMLTextAreaElement;
    }
    namespace TextAreas {
        class TextAreaWrapper {
            private textArea;
            constructor(textArea: HTMLTextAreaElement);
            appendTextAndPutCursorAfter(text: string): this;
            append(text: string): this;
            selectedText(): string;
            setCursor(position: number): this;
            insertTextAndPutCursorAfter(addedText: string): this;
            getCursor(): number;
            setAutoSave(cookieName: string, handleError: (msg: string) => void, storage: BrowserStorage.BsProvider): this;
            value(): string;
            setValue(value: string): this;
            focus(): this;
            setCursorAtEnd(): this;
            trim(): this;
        }
        const appendTextAndPutCursorAfter: (textArea: HTMLTextAreaElement, text: string) => void;
        const append: (textArea: HTMLTextAreaElement, text: string) => void;
        const selectedText: (textArea: HTMLTextAreaElement) => string;
        /**
         * Makes a text area element auto-save its content to a cookie after each modified character (input event).
         * @param storageKey - The name of the cookie to store the text area content.
         * @param id - The ID of the text area element.
         * @param handleError - A function to call when an error occurs.
         * @param storage
         */
        const setAutoSave: (storageKey: string, id: string, handleError: (msg: string) => void, storage: BrowserStorage.BsProvider) => void;
        const getCursor: (textArea: HTMLTextAreaElement) => number;
        const setCursor: (textArea: HTMLTextAreaElement, position: number) => void;
        /**
         * Inserts text at the cursor position in a text area. If something is
         * selected it will be overwritten. */
        const insertTextAndPutCursorAfter: (textarea: HTMLTextAreaElement, addedText: string) => void;
        const scrollToEnd: (logTextArea: HTMLTextAreaElement) => void;
    }
    namespace Media {
        const releaseMicrophone: (stream: MediaStream) => void;
    }
    namespace BrowserStorage {
        interface BsProvider {
            set: (key: string, value: string) => void;
            get: (key: string) => string | null;
        }
        namespace LocalStorageVerified {
            const set: (itemName: string, itemValue: string) => void;
            const get: (name: string) => string | null;
        }
        namespace LocalStorage {
            /**
             * Sets a local storage item with the given name and value.
             *
             * @throws Error if the local storage item value exceeds 5242880 characters.*/
            const set: (itemName: string, itemValue: string) => void;
            const get: (name: string) => string | null;
        }
        namespace Cookies {
            /**
             * Sets a cookie with the given name and value.
             *
             * @throws Error if the cookie value exceeds 4095 characters.*/
            const set: (cookieName: string, cookieValue: string) => void;
            const get: (name: string) => string | null;
        }
    }
    /**
     * Known "problems": If the user clicks on the button multiple times in a row, the checkmark will
     * be appended multiple times. ... no time for that. Where possible just use HtmlUtils.addClickListener(...).
     */
    const signalClickToUser: (element: HTMLElement) => void;
    /**
     * Adds a click listener to a button that appends a checkmark to the button
     * text when clicked. */
    const addClickListener: (buttonId: string, callback: () => void) => void;
    const scrollToBottom: () => void;
    namespace ErrorHandling {
        namespace ExceptionHandlers {
            const installGlobalDefault: () => void;
        }
        /**
         * Should be named "ouputError" because it uses alert and console.log, but
         * I am used to "printError".
         * This outputs aggressively on top of everything to the user. */
        const printError: (str: string) => void;
        /**
         * This outputs gently. Might not be seen by the user.  */
        const printDebug: (str: string) => void;
    }
    const printDebug: (str: string) => void;
    const printError: (str: string) => void;
    const escapeHtml: (input: string) => string;
    /**
     # DOMException Read permission denied error
     you're encountering when calling navigator.clipboard.readText() is likely due to the permissions and security restrictions around accessing the clipboard in web browsers. Here are some key points to consider and potential solutions:
     User Interaction Required: Most modern browsers require a user-initiated action, like a click event, to access the clipboard. Make sure your code is triggered by such an action.
     Secure Context: Clipboard access is only allowed in a secure context (HTTPS), not on HTTP pages.
     Permissions: Depending on the browser, your site may need explicit permission from the user to access the clipboard.
     Browser Support: Ensure that the browser you are using supports the Clipboard API.
     Cross-Origin Restrictions: If your script is running in an iframe, it might be subject to cross-origin restrictions.
     */
    namespace Clipboard {
        /** @deprecated */
        const read: () => never;
        /** @deprecated */
        const write: () => never;
    }
    /**
     * Deprecated! Use copyToClipboard instead.
     * @param str
     */
    const putIntoClipboard: (str: string) => void;
    const stripHtmlTags: (input: string) => string;
    const isMsWindows: () => RegExpMatchArray | null;
    namespace Menus {
        /** https://www.webcomponents.org/element/@vanillawc/wc-menu-wrapper */
        namespace WcMenu {
            const close: (menuHeadingId: string) => void;
            const addItem: (menuHeadingId: string) => (id: string, menuFunction: () => void) => void;
        }
    }
    namespace Keyboard {
        /**
         * Inline this function!
         */
        const addKeyboardBindings: () => void;
    }
}
