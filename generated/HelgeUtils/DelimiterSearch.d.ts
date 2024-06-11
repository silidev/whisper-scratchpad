/**
 * text.substring(leftIndex, rightIndex) is the string between the delimiters. */
export declare class DelimiterSearch {
    delimiter: string;
    constructor(delimiter: string);
    leftIndex(text: string, startIndex: number): number;
    rightIndex(text: string, startIndex: number): number;
    /** If search backwards the position after the delimiter is */
    private static index;
    static runTests: () => void;
    private static testDelimiterSearch;
    /** Deletes a note from the given text.
     * @param input - The text to delete from.
     * @param left - The index of the left delimiter.
     * @param right - The index of the right delimiter.
     * @param delimiter - The delimiter.
     * */
    static deleteNote: (input: string, left: number, right: number, delimiter: string) => string;
    private static testDeleteBetweenDelimiters;
}
