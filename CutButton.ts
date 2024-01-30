import {HelgeUtils} from "./HelgeUtils.js";
import {newNoteDelimiter} from "./config.js";
import {HtmlUtils} from "./HtmlUtils.js";
import {saveEditor} from "./script.js";
import {CurrentNote} from "./CurrentNote.js";
import buttonWithId = HtmlUtils.NeverNull.buttonWithId;

export const createCutButtonClickListener = (mainEditorTextarea: HTMLTextAreaElement) => {
  const clickListener = () => {

    const clipboard = navigator.clipboard;
    const currentNote = new CurrentNote(mainEditorTextarea);

    // Because this sometimes (very seldom) does something bad, first backup the whole text to clipboard:
    clipboard.writeText(mainEditorTextarea.value).then(() => {
      clipboard.writeText(currentNote.textOf().trim()).then(() => {

        HtmlUtils.signalClickToUser(buttonWithId("cutButton"));
        {
          /** If DELETE==true, the text between the markers is deleted. */
          const DELETE = true;
          if (DELETE) mainEditorTextarea.value =
              HelgeUtils.Strings.DelimiterSearch.deleteBetweenDelimiters(currentNote.leftIndex()
                  , currentNote.rightIndex(), mainEditorTextarea.value, newNoteDelimiter);
        }
        const selectionStart = currentNote.leftIndex() - (currentNote.leftIndex() > newNoteDelimiter.length ? newNoteDelimiter.length : 0);
        const selectionEnd = currentNote.rightIndex();
        mainEditorTextarea.setSelectionRange(selectionStart, selectionEnd);
        saveEditor();
        mainEditorTextarea.focus();
      });
    });
  };
  return clickListener;
};