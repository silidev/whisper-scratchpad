// noinspection JSUnusedGlobalSymbols,SpellCheckingInspection

/** Copyright by Helge Tobias Kosuch 2023
 *
 * Should be named WebUtils... but I am used to HtmlUtils.
 * */
import {HelgeUtils} from "./HelgeUtils.js";

export namespace HtmlUtils {

  const memoize = HelgeUtils.memoize;

  // ########## Blinking fast and slow ##########
  // https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow
  /**
   * .blinkingFast {
   *  animation: blink 1s linear infinite;
   * }
   */
  export const blinkFast = (message: string) => `<span class="blinkingFast">${message}</span>`
  /**
   * .blinkingSlow {
   *  animation: blink 2s linear infinite;
   * }
   */
  export const blinkSlow = (message: string) => `<span class="blinkingSlow">${message}</span>`


  export const elementWithId = memoize((id: string): HTMLElement | null => {
    return document.getElementById(id) as HTMLElement;
  });

  export const buttonWithId = elementWithId as (id: string) => HTMLButtonElement | null;
  export const textAreaWithId = elementWithId as (id: string) => HTMLTextAreaElement | null;
  export const inputElementWithId = elementWithId as (id: string) => HTMLInputElement | null;

  export namespace TextAreas {

    export const appendText = (textArea: HTMLTextAreaElement, text: string) => {
      textArea.value += " " + text;
      setCursor(textArea, textArea.value.length);
    };

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
      HtmlUtils.textAreaWithId(id).addEventListener('input', () => {
        Cookies.set(cookieName, HtmlUtils.textAreaWithId(id).value);
      });
    }

    export const getCursor = (textArea: HTMLTextAreaElement) => {
      return textArea.selectionStart;
    }

    export const setCursor = (textArea: HTMLTextAreaElement, position: number) => {
      textArea.setSelectionRange(position, position);
    }

    /**
     * Inserts text at the cursor position in a text area. If something is selected it will be overwritten.
     */
    export const insertTextAtCursor = (
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

  export const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  /**
   * Deprecated! Use copyToClipboard instead.
   * @param str
   */
  export const putIntoClipboard = (str: string) => {
    navigator.clipboard.writeText(str).then();
  }
}