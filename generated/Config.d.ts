import { UiFunctions } from "./Main.js";
import WhereToPutTranscription = UiFunctions.Buttons.Media.WhereToPutTranscription;
import { HtmlUtils } from "./HtmlUtils.js";
export declare const VERSION = "z 1.0.0";
export declare const WHISPER_TEMPERATURE = "0";
export declare const INSERT_EDITOR_INTO_PROMPT = true;
export declare const NEW_NOTE_DELIMITER = ")))---(((\n";
export declare const WHERE_TO_INSERT_AT: WhereToPutTranscription;
export declare const LONG_STORAGE_PROVIDER: typeof HtmlUtils.BrowserStorage.LocalStorageVerified;
