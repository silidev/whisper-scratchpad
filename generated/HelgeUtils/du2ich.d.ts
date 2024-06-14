/**
 * Converts "Du" to "Ich" and "Dein" to "Mein" and so on.
 *
 * Anki search: ((re:\bdu\b) OR (re:\bdir\b) OR (re:\bdein\b) OR (re:\bdeiner\b) OR
 * (re:\bdeines\b)) -tag:du
 */
export declare const du2ich: (input: string) => string;
