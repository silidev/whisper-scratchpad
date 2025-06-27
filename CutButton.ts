import {HtmlUtils} from "./HelgeUtils/HtmlUtils.js"
import {Log, mainEditor, UiFunctions} from './Main.js'
import {CurrentNote} from "./CurrentNote.js"
import buttonWithId = HtmlUtils.NullThrowsException.buttonWithIdNte

import showToast = HtmlUtils.showToast
import Misc = HtmlUtils.Misc

const clipboard = navigator.clipboard

export const createCutFunction =
    (mainEditorTextarea: HTMLTextAreaElement, addClozeMarkersIfNotPresentFlag: boolean) => {

  return () => {
    const addClozeMarkersIfNotPresent = (input: string, addClozeMarkersIfNotPresentFlag: boolean) => {
      if (!addClozeMarkersIfNotPresentFlag) {
        return input
      }
      if (input.includes("{{c1::")) {
        if (input.includes("}}")) {
          return input
        }
        return input + "\n}}"
      }
      return "{{c1::\n" + input + "\n}},,"
    }
    mainEditor.Undo.saveState()
    UiFunctions.replaceAntwortWithClozeOpen()
    UiFunctions.Buttons.replaceButton()
    const currentNote  = new CurrentNote(mainEditorTextarea)
    const output: string = addClozeMarkersIfNotPresent(currentNote.text().trim()
        , addClozeMarkersIfNotPresentFlag)
    clipboard.writeText(output)
        .then(() => {
          HtmlUtils.signalClickToUser(buttonWithId("cutNoteButton"))
          {
            const DELETE = true
            if (DELETE) {
              /* If DELETE==true, the text between the markers is deleted. */
              currentNote.delete()
            } else {
              // When DELETE==false, just select the text between the markers:
              currentNote.select()
            }
          }
          mainEditor.save()
          showToast("The current note was cut out.")
          mainEditorTextarea.focus()
        }).catch(Log.error)
  }
}