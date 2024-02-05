// noinspection JSUnusedGlobalSymbols,SpellCheckingInspection

/** Copyright by Helge Tobias Kosuch 2023
 *
 * Should be named WebUtils... but I am used to HtmlUtils.
 * */
import {HelgeUtils} from "./HelgeUtils.js";

export namespace HtmlUtils {
  const clipboard = navigator.clipboard;

  const memoize = HelgeUtils.memoize;

  // ########## Blinking fast and slow ##########
  // https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow
  /**
   * .blinkingFast {
   *  animation: blink 1s linear infinite;
   * }
   */
  export const blinkFast = (message: string) => `<span class="blinkingFast">${message}</span>`;
  /**
   * .blinkingSlow {
   *  animation: blink 2s linear infinite;
   * }
   */
  export const blinkSlow = (message: string) => `<span class="blinkingSlow">${message}</span>`;


  export const elementWithId = memoize((id: string): HTMLElement | null => {
    return document.getElementById(id) as HTMLElement;
  });

  export const buttonWithId = elementWithId as (id: string) => HTMLButtonElement | null;
  export const textAreaWithId = elementWithId as (id: string) => HTMLTextAreaElement | null;
  export const inputElementWithId = elementWithId as (id: string) => HTMLInputElement | null;

  /** These never return null. Instead, they throw a runtime error. */
  export namespace NeverNull {
    import nullFilter = HelgeUtils.Misc.nullFilter;

    export const elementWithId = (id: string) =>
        nullFilter<HTMLElement>(HtmlUtils.elementWithId, id);
    export const buttonWithId = (id: string) =>
        nullFilter<HTMLButtonElement>(HtmlUtils.buttonWithId, id);
    export const inputElementWithId = (id: string) =>
        nullFilter<HTMLInputElement>(HtmlUtils.inputElementWithId, id);
    export const textAreaWithId = (id: string) =>
        nullFilter<HTMLTextAreaElement>(HtmlUtils.textAreaWithId, id);
  }


  export namespace TextAreas {

    import textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;

    export class TextAreaWrapper {
      constructor(private textArea: HTMLTextAreaElement) {
      }

      public appendTextAndPutCursorAfter(text: string) {
        TextAreas.appendTextAndPutCursorAfter(this.textArea, text);
        return this;
      }

      public append(text: string) {
        TextAreas.append(this.textArea, text);
        return this;
      }

      public selectedText() {
        const start = this.textArea.selectionStart;
        const end = this.textArea.selectionEnd;
        return this.textArea.value.substring(start, end);
      }

      public setCursor(position: number) {
        TextAreas.setCursor(this.textArea, position);
        return this;
      }

      public insertTextAndPutCursorAfter(addedText: string) {
        TextAreas.insertTextAndPutCursorAfter(this.textArea, addedText);
        return this;
      }

      public getCursor() {
        return TextAreas.getCursor(this.textArea);
      }

      public setAutoSave(cookieName: string) {
        TextAreas.setAutoSave(cookieName, this.textArea.id);
        return this;
      }

      public value() {
        return this.textArea.value;
      }

      public setValue(value: string) {
        this.textArea.value = value;
        return this;
      }

      public focus() {
        this.textArea.focus();
        return this;
      }

      public setCursorAtEnd() {
        this.setCursor(this.textArea.value.length);
        return this;
      }

      public trim() {
        this.textArea.value = this.textArea.value.trim();
        return this;
      }
    }

    export const appendTextAndPutCursorAfter =
        (textArea: HTMLTextAreaElement, text: string) => {
      append(textArea, text);
      setCursor(textArea, textArea.value.length);
    };

    export const append = (textArea: HTMLTextAreaElement, text: string) => {
      textArea.value += text;
    }

    export const selectedText = (textArea: HTMLTextAreaElement) => {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      return textArea.value.substring(start, end);
    };

    /**
     * Makes a text area element auto-save its content to a cookie after each modified character (input event).
     * @param cookieName - The name of the cookie to store the text area content.
     * @param id - The ID of the text area element.
     */
    export const setAutoSave = (cookieName: string, id: string) => {
      textAreaWithId(id).addEventListener('input', () => {
        Cookies.set(cookieName, textAreaWithId(id).value);
      });
    };

    export const getCursor = (textArea: HTMLTextAreaElement) => {
      return textArea.selectionStart;
    };

    export const setCursor = (textArea: HTMLTextAreaElement, position: number) => {
      textArea.setSelectionRange(position, position);
    };

    /**
     * Inserts text at the cursor position in a text area. If something is
     * selected it will be overwritten. */
    export const insertTextAndPutCursorAfter = (
        textarea: HTMLTextAreaElement,
        addedText: string) => {

      if (!addedText)
        return;

      const textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
      const textAfterSelection = textarea.value.substring(textarea.selectionEnd);

      setCursor(textarea, 0);
      textarea.value = textBeforeSelection + addedText + textAfterSelection;
      setCursor(textarea, textBeforeSelection.length + addedText.length);
      textarea.focus();
    };
  }

  export namespace Media {
    export const releaseMicrophone = (stream: MediaStream) => {
      if (!stream) return;
      stream.getTracks().forEach(track => track.stop());
    };
  }

  export namespace Cookies {
    export const set = (cookieName: string, cookieValue: string) => {
      const expirationTime = new Date(Date.now() + 2147483647000).toUTCString();
      document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)};expires=${expirationTime};path=/`;
    };

    export const get = (name: string) => {
      let cookieArr = document.cookie.split(";");
      for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
          return decodeURIComponent(cookiePair[1]);
        }
      }
      return null;
    };
  }

  /**
   * Known "problems": If the user clicks on the button multiple times in a row, the checkmark will
   * be appended multiple times. ... no time for that. Where possible just use HtmlUtils.addClickListener(...).
   */
  export const signalClickToUser = (element: HTMLElement) => {
    const before = element.innerHTML;
    element.innerHTML += "✔️";
    setTimeout(
        () => element.innerHTML = before
        , 500);
  };

  /**
   * Adds a click listener to a button that appends a checkmark to the button
   * text when clicked. */
  export const addClickListener = (element: HTMLElement, callback: () => void) => {
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

  export const scrollToBottom = () => {
    window.scrollBy(0, 100000);
  };

  /**
   * This outputs aggressively on top of everything to the user. */
  export const printError = (str: string) => {
    console.log(str);
    HelgeUtils.Exceptions.callSwallowingExceptions(() => {
      document.body.insertAdjacentHTML('afterbegin',
          `<div 
              style="position: fixed; z-index: 9999; background-color: #000000; color:red;"> 
            <p style="font-size: 30px;">###### printDebug</p>
            <p style="font-size:18px;">${escapeHtml(str)}</p>`
          + `########</div>`);
    });
  };

  /**
   * This outputs gently. Might not be seen by the user.  */
  export const printDebug = (str: string) => {
    console.log(str);
    HelgeUtils.Exceptions.callSwallowingExceptions(() => {
      document.body.insertAdjacentHTML('beforeend',
          `<div 
              style="z-index: 9999; background-color: #00000000; color:red;"> 
            <p style="font-size:18px;">${escapeHtml(str)}</p>`
          + `</div>`);
    });
  };

  export const escapeHtml = (input: string): string => {
    const element = document.createElement("div");
    element.innerText = input;
    return element.innerHTML;
  };

  /**
   * Deprecated! Use navigator.clipboard.writeText instead.
   */
  export const copyToClipboard = (text: string) => clipboard.writeText(text);

  /**
   # DOMException Read permission denied error
   you're encountering when calling navigator.clipboard.readText() is likely due to the permissions and security restrictions around accessing the clipboard in web browsers. Here are some key points to consider and potential solutions:
   User Interaction Required: Most modern browsers require a user-initiated action, like a click event, to access the clipboard. Make sure your code is triggered by such an action.
   Secure Context: Clipboard access is only allowed in a secure context (HTTPS), not on HTTP pages.
   Permissions: Depending on the browser, your site may need explicit permission from the user to access the clipboard.
   Browser Support: Ensure that the browser you are using supports the Clipboard API.
   Cross-Origin Restrictions: If your script is running in an iframe, it might be subject to cross-origin restrictions.
   */
  export namespace Clipboard {
    /** @deprecated Inline this function instead. */
    export const read = () => clipboard.readText();
    /** @deprecated Inline this function instead. */
    export const write = (text: string) => clipboard.writeText(text);
  }

  /**
   * Deprecated! Use copyToClipboard instead.
   * @param str
   */
  export const putIntoClipboard = (str: string) => {
    navigator.clipboard.writeText(str).then();
  };

  export const stripHtmlTags = (input: string): string => {
    return input.replace(/<\/?[^>]+(>|$)/g, "");
  };

  export const isMsWindows = () => {
    return navigator.userAgent.match(/Windows/i);
  };
}
