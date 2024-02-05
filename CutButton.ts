import {HelgeUtils} from "./HelgeUtils.js";
import {NEW_NOTE_DELIMITER} from "./config.js";
import {HtmlUtils} from "./HtmlUtils.js";
import {saveEditor} from "./script.js";
import {CurrentNote} from "./CurrentNote.js";
import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
import DelimiterSearch = HelgeUtils.Strings.DelimiterSearch;
const clipboard = navigator.clipboard;

export const createCutButtonClickListener = (mainEditorTextarea: HTMLTextAreaElement) => {
  const clickListener = () => {

    const currentNote = new CurrentNote(mainEditorTextarea);

    // Because this sometimes (very seldom) does something bad, first backup the whole text to clipboard:
    clipboard.writeText(mainEditorTextarea.value).then(() => {
      clipboard.writeText(currentNote.text().trim()).then(() => {
        HtmlUtils.signalClickToUser(buttonWithId("cutButton"));
        const textArea = mainEditorTextarea;
        {
          const DELETE = true;
          if (DELETE) {
            /* If DELETE==true, the text between the markers is deleted. */
            const leftIndex = currentNote.leftIndex();
            textArea.value =
                DelimiterSearch.deleteNote(textArea.value,
                  leftIndex, currentNote.rightIndex(), NEW_NOTE_DELIMITER);
            textArea.setSelectionRange(leftIndex, leftIndex);
          } else {
            // When DELETE==false, just select the text between the markers:
            const selectionStart = currentNote.leftIndex()
                // Also select the newNoteDelimiter before the note:
                - (currentNote.leftIndex() > NEW_NOTE_DELIMITER.length ? NEW_NOTE_DELIMITER.length : 0);
            const selectionEnd = currentNote.rightIndex();
            textArea.setSelectionRange(selectionStart, selectionEnd);
          }
        }
        saveEditor();
        textArea.focus();
      });
    });
  };
  return clickListener;
};