import {HtmlUtils} from "./HtmlUtils.js";
import {saveMainEditor} from "./script.js";
import {CurrentNote} from "./CurrentNote.js";
import buttonWithId = HtmlUtils.NeverNull.buttonWithId;

const clipboard = navigator.clipboard;

export const createCutFunction =
    (mainEditorTextarea: HTMLTextAreaElement,
     prefix = "", postfix = "") => {

  return () => {

    const currentNote = new CurrentNote(mainEditorTextarea);

    // Because this sometimes (very seldom) does something bad, first backup the whole text to clipboard:
    clipboard.writeText(mainEditorTextarea.value).then(() => {
      clipboard.writeText(prefix + currentNote.text().trim() + postfix).then(() => {
        HtmlUtils.signalClickToUser(buttonWithId("cutButton"));
        {
          const DELETE = true;
          if (DELETE) {
            /* If DELETE==true, the text between the markers is deleted. */
            currentNote.delete();
          } else {
            // When DELETE==false, just select the text between the markers:
            currentNote.select();
          }
        }
        saveMainEditor();
        mainEditorTextarea.focus();
      });
    });
  };
};