/** The current note is the text between the two newNoteDelimiters. */
export declare class CurrentNote {
    private mainEditorTextarea;
    constructor(mainEditorTextarea: HTMLTextAreaElement);
    leftIndex(): number;
    rightIndex(): number;
    text(): string;
    delete(): void;
    /** Selects the text of the current note in the UI */
    select(): void;
}
