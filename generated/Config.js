// ############## Config ##############
// noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
import { HtmlUtils } from "./HtmlUtils.js";
// noinspection SpellCheckingInspection
export const VERSION = "z 1.0.0";
export const WHISPER_TEMPERATURE = "0";
export const INSERT_EDITOR_INTO_PROMPT = true;
export const NEW_NOTE_DELIMITER = ')))---(((\n';
export const WHERE_TO_INSERT_AT = "appendAtEnd";
const VERIFY_STORAGE = true;
export const LONG_STORAGE_PROVIDER = VERIFY_STORAGE
    ? HtmlUtils.BrowserStorage.LocalStorageVerified
    : HtmlUtils.BrowserStorage.LocalStorage;
//# sourceMappingURL=Config.js.map