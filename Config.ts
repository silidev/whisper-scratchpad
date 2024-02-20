// ############## Config ##############
// noinspection SpellCheckingInspection,JSUnusedGlobalSymbols

import {UiFunctions} from "./Main.js"
import WhereToPutTranscription = UiFunctions.Buttons.Media.WhereToPutTranscription
import {HtmlUtils} from "./HtmlUtils.js";

// noinspection SpellCheckingInspection
export const VERSION = "z 1.0.0"
export const WHISPER_TEMPERATURE = "0"
export const INSERT_EDITOR_INTO_PROMPT = true
export const NEW_NOTE_DELIMITER = ')))---(((\n'
export const WHERE_TO_INSERT_AT: WhereToPutTranscription = "appendAtEnd"
const VERIFY_STORAGE = true
export const LONG_STORAGE_PROVIDER =
    VERIFY_STORAGE
    ? HtmlUtils.BrowserStorage.LocalStorageVerified
    : HtmlUtils.BrowserStorage.LocalStorage;

