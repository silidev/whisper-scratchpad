import {HelgeUtils} from "./HelgeUtils.js";

export namespace HtmlUtils {

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

  const memoize = HelgeUtils.memoize;

  export const elementWithId = memoize((id: string): HTMLElement | null => {
    return document.getElementById(id) as HTMLElement;
  });

  export const buttonWithId = elementWithId as (id: string) => HTMLButtonElement | null;
  export const textAreaWithId = elementWithId as (id: string) => HTMLTextAreaElement | null;
  export const inputElementWithId = elementWithId as (id: string) => HTMLInputElement | null;

  export namespace TextAreas {

    export const selectedText = (textarea) => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      return textarea.value.substring(start, end);
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

    export const getCursor = (textarea: HTMLTextAreaElement) => {
      return textarea.selectionStart;
    }

    export const setCursor = (textarea: HTMLTextAreaElement, position: number) => {
      textarea.setSelectionRange(position, position);
    }

    export const insertTextAtCursor = (
        textarea: HTMLTextAreaElement,
        addedText: string) => {

      if (!addedText)
        return;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const textAfterCursor = textarea.value.substring(cursorPosition);

      textarea.value = textBeforeCursor + addedText + textAfterCursor;
      const newCursorPosition = cursorPosition + addedText.length;
      setCursor(textarea, newCursorPosition);
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
  export const addButtonClickListener = (button: HTMLButtonElement, callback: () => void) => {
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
}