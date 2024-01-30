import {HelgeUtils} from "./HelgeUtils.js";
import {newNoteDelimiter} from "./config.js";
import {HtmlUtils} from "./HtmlUtils.js";
import {saveEditor} from "./script.js";
import copyToClipboard = HtmlUtils.copyToClipboard;
import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
import {CurrentNote} from "./CurrentNote.js";

export function createCutButtonClickListener(mainEditorTextarea: HTMLTextAreaElement) {
  const clickListener = () => {

    const currentNote = new CurrentNote(mainEditorTextarea);

    // Because this sometimes (very seldom) does something bad, first backup the whole text to clipboard:
    copyToClipboard(mainEditorTextarea.value).then(() => {
      const trimmedText =
          () => {
            return mainEditorTextarea.value
                .substring(currentNote.leftIndex(), currentNote.rightIndex())
                .trim();
          };

      copyToClipboard(trimmedText()).then(() => {

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
}