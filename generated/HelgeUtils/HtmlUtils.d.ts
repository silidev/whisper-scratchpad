declare global {
    interface Window {
        getCaretCoordinates: (element: HTMLElement, position: number) => {
            top: number;
            left: number;
        };
    }
}
export declare namespace HtmlUtils {
    namespace ErrorHandling {
        namespace ExceptionHandlers {
            const installGlobalDefault: () => void;
        }
        /**
         * This outputs aggressively on top of everything to the user. */
        const printError: (input: any) => void;
        /**
         * This outputs gently. Might not be seen by the user.  */
        const printDebug: (str: string, parentElement?: HTMLElement) => void;
    }
    const createDivElementFromHtml: (html: string) => HTMLDivElement;
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
    const elementWithIdNte: (id: string) => HTMLElement;
    const buttonWithId: (id: string) => HTMLButtonElement | null;
    const textAreaWithId: (id: string) => HTMLTextAreaElement | null;
    const inputElementWithId: (id: string) => HTMLInputElement | null;
    /** These never return null. Instead, they throw a runtime error.
     * "Nte" in the name means "null throws exception".
     * Old name: NullFilter */
    namespace NullThrowsException {
        /** @see NullThrowsException */
        const querySelectorNte: (element: DocumentFragment, selector: string) => HTMLElement;
        /** @see NullThrowsException */
        const elementWithIdNte: (id: string) => HTMLElement;
        /** @see NullThrowsException */
        const buttonWithIdNte: (id: string) => HTMLButtonElement;
        /** @see NullThrowsException */
        const inputElementWithIdNte: (id: string) => HTMLInputElement;
        /** @see NullThrowsException */
        const textAreaWithIdNte: (id: string) => HTMLTextAreaElement;
    }
    namespace TextAreas {
        class TextAreaWrapper {
            private textArea;
            constructor(textArea: HTMLTextAreaElement);
            findWholeWordCaseInsensitiveAndSelect(search: string): this;
            appendTextAndPutCursorAfter(text: string): this;
            append(text: string): this;
            selectedText(): string;
            setCursor(position: number): this;
            insertAndPutCursorAfter(addedText: string): this;
            getCursor(): number;
            setAutoSave(cookieName: string, handleError: (msg: string) => void, storage: BrowserStorage.BsProvider): this;
            value(): string;
            setValue(value: string): this;
            focus(): this;
            setCursorAtEnd(): this;
            trim(): this;
            /**
             * @deprecated */
            goToEnd(): this;
        }
        const appendTextAndCursor: (textArea: HTMLTextAreaElement, text: string) => void;
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
        const insertAndPutCursorAfter: (textarea: HTMLTextAreaElement, addedText: string) => void;
        const scrollToEnd: (logTextArea: HTMLTextAreaElement) => void;
        /**
         * Find the next occurrence of a string in a text area and select it.
         *
         * It can also scroll the found occurrence into view, IF
         * script type="module" src="node_modules/textarea-caret/index.js">
         *   /script>
         * "^3.1.0" is included in the HTML file. */
        namespace FindCaseInsensitiveAndSelect {
            const wholeWord: (textArea: HTMLTextAreaElement, target: string) => void;
            const normal: (textArea: HTMLTextAreaElement, target: string) => void;
        }
    }
    namespace Media {
        const releaseMicrophone: (stream: MediaStream) => void;
    }
    namespace BrowserStorage {
        interface BsProvider {
            isAvailable(): boolean;
            /** Delete all entries whose keys begin with prefix */
            clear(prefix: string): void;
            getAllKeys(): Object;
            setString(key: string, value: string): void;
            getString(itemName: string): string | null;
            getAndJsonParse<T>(name: string): T | null;
            setJsonStringified(itemName: string, itemValue: unknown): void;
            getNumber(name: string): number | null;
            setNumber(name: string, value: number): void;
        }
        abstract class BsProviderExtras {
            abstract setString(itemName: string, itemValue: string): void;
            abstract getString(name: string): string | null;
            setJsonStringified(itemName: string, itemValue: unknown): void;
            getAndJsonParse<T>(name: string): T | null;
            getNumber(name: string): number | null;
            setNumber(name: string, value: number): void;
        }
        class LocalStorage extends BsProviderExtras implements BsProvider {
            isAvailable(): boolean;
            clear(prefix: string): void;
            getAllKeys(): Object;
            /** Sets a local storage item with the given name and value.
             * @throws Error if the local storage item value exceeds 5242880 characters.*/
            setString(itemName: string, itemValue: string): void;
            getString(name: string): string | null;
        }
        namespace Cookies {
            /**
             * Sets a cookie with the given name and value.
             *
             * @throws Error if the cookie value exceeds 4095 characters.*/
            const set: (cookieName: string, cookieValue: string) => void;
            const get: (name: string) => string | null;
        }
        namespace Misc {
            /** A mode whose status is stored to a persistent storage, e. g. localStorage. */
            class StoredMode {
                private _storage;
                private _enabled;
                /** key used in storage */
                private readonly _enabledKey;
                constructor(_storageKey: string, _storage: BsProvider, initialValue?: boolean);
                enabled: () => boolean;
                disabled: () => boolean;
                private saveToStorage;
                enable: () => void;
                disable: () => void;
                toggle: () => void;
            }
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
    /** @deprecated Inline this and replace the error handler with your own
     * error reporting. */
    namespace clipboard {
        /** @deprecated Inline this and replace the error handler with your own
         * error reporting. */
        const read: (f: (text: string) => void) => void;
        /** @deprecated Rather use read() */
        const readText: () => Promise<string>;
    }
    /**
     * @deprecated Use copyToClipboard instead.
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
    namespace Styles {
        const toggleDisplayNone: (element: HTMLElement, visibleDisplayStyle: string) => void;
        /** If element is null, nothing happens, no error. */
        const toggleDisplayNoneIfPossible: (element: HTMLElement | null, visibleDisplayStyle: string) => void;
    }
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
    const showToast: (message: string, durationMs?: number) => void;
    /**
     * @deprecated Use showToast instead. */
    const alertAutoDismissing: (message: string, durationMs?: number) => void;
    namespace Misc {
        /** Offers a string or blob as a file to the user for download. */
        const downloadOffer: (input: string | Blob, filename: string) => void;
        const loadScript: (srcUri: string, afterLoad: ((this: GlobalEventHandlers, ev: Event) => any) | null) => void;
        const removeBySelector: (doc: Document, selector: string) => void;
    }
}
