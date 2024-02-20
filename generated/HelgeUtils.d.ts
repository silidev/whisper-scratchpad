/**
 * HelgeUtils.ts
 * @description A collection of general utility functions not connected to a
 * specific project.
 *
 * Copyright by Helge Tobias Kosuch 2024 */
export declare namespace HelgeUtils {
    namespace Exceptions {
        /**
         * Reporting of exceptions in callbacks is sometimes very bad.
         * Therefore, exceptions should always be caught and then passed
         * to this function, which alerts in a useful way.
         *
         * This also used to re-throw, but sometimes that is not good,
         * thus think about if you want to do this after calling this.
         *
         * Use this to throw an exception with a stack trace:
         *    throw new Error("Some useful error message")
         *
         * @return void
         *
         * @param e {Error} The exception, preferably of type Error,
         *        because then a stack trace will be displayed.
         <pre>
         IntelliJ Live Template
         <template name="try-catch-unhandled-exception" value="try {&#10;    $SELECTION$&#10;} catch(e) {&#10;    unhandledExceptionAlert(e);&#10;}" description="" toReformat="true" toShortenFQNames="true">
         <context>
         <option name="JAVA_SCRIPT" value="true" />
         <option name="JSX_HTML" value="false" />
         <option name="JS_CLASS" value="false" />
         <option name="JS_DOT_PROPERTY_ACCESS" value="false" />
         <option name="JS_EXPRESSION" value="false" />
         </context>
         </template>
         </pre>*/
        const unhandledExceptionAlert: (e: Error | string) => string;
        /**
         * Wraps the given void function in a try-catch block and swallows any exceptions.
         *
         * Example use:
         *     const produceError = () => {throw "error"}
         *     const noError = swallowAll(produceError);
         *     noError(); // Does NOT throw an exception.
         *
         * @param func
         */
        const swallowAll: <T, R>(func: (...args: T[]) => void) => (...args: T[]) => void;
        /** Alias for swallowAll
         * @deprecated */
        const catchAll: <T, R>(func: (...args: T[]) => void) => (...args: T[]) => void;
        /** Alias for swallowAll
         * @deprecated */
        const unthrow: <T, R>(func: (...args: T[]) => void) => (...args: T[]) => void;
        /**
         * Calls the function and swallows any exceptions. */
        const callSwallowingExceptions: (f: () => void) => void;
        /**
         * Displays an alert with the given message and throws the message as an exception.
         *
         * @param msg {String} */
        const alertAndThrow: (...msg: any) => never;
    }
    const suppressUnusedWarning: (...args: any[]) => void;
    namespace Tests {
        /** Inline this function! */
        const runTestsOnlyToday: () => void;
        const assert: (condition: boolean, ...output: any[]) => void;
        const assertEquals: (actual: any, expected: any, message?: string | null) => void;
    }
    namespace Strings {
        /**
         * Trim whitespace but leave a single newline at the end if there is
         * any whitespace that includes a newline.
         */
        const trimExceptASingleNewlineAtTheEnd: (input: string) => string;
        const toUppercaseFirstChar: (input: string) => string;
        const escapeRegExp: (str: string) => string;
        /**
         * text.substring(leftIndex, rightIndex) is the string between the delimiters. */
        class DelimiterSearch {
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
        function runTests(): void;
    }
    const runTests: () => void;
    namespace Transcription {
        class TranscriptionError extends Error {
            payload: {};
            constructor(payload: {});
        }
        type ApiName = "OpenAI" | "Gladia";
        const transcribe: (api: ApiName, audioBlob: Blob, apiKey: string, prompt?: string, language?: string, translateToEnglish?: boolean) => Promise<string>;
    }
    namespace ReplaceByRules {
        class ReplaceRules {
            private rules;
            constructor(rules: string);
            applyTo: (subject: string) => string;
            applyToWithLog: (subject: string) => {
                resultingText: string;
                log: string;
            };
        }
        class WholeWordReplaceRules {
            private rules;
            constructor(rules: string);
            applyTo: (subject: string) => string;
            applyToWithLog: (subject: string) => {
                resultingText: string;
                log: string;
            };
        }
        class WholeWordPreserveCaseReplaceRules {
            private rules;
            constructor(rules: string);
            applyTo: (subject: string) => string;
            applyToWithLog: (subject: string) => {
                resultingText: string;
                log: string;
            };
        }
        /**
         * Deprecated! Use ReplaceRules or WholeWordReplaceRules instead.
         *
         * Do NOT change the syntax of the rules, because they must be kept compatible with
         * https://github.com/No3371/obsidian-regex-pipeline#readme
         *
         * @param subject - The text to replace in.
         * @param allRules - The rules to apply.
         * @param wholeWords - If true, only whole words are replaced.
         * @param logReplacements - If true, a log of the replacements is returned.
         * @param preserveCase - If true, the case of the replaced word is preserved.
         */
        const replaceByRules: (subject: string, allRules: string, wholeWords?: boolean, logReplacements?: boolean, preserveCase?: boolean) => {
            resultingText: string;
            log: string;
        };
        /**
         * Deprecated! Use ReplaceRules or WholeWordReplaceRules instead.
         */
        const replaceByRulesAsString: (subject: string, allRules: string) => string;
    }
    const memoize: <T, R>(func: (...args: T[]) => R) => (...args: T[]) => R;
    const extractHighlights: (input: string) => string[];
    namespace Misc {
        /**
         * Throws an exception if the input is null.
         *
         * I use "strictNullChecks": true to avoid bugs. Therefore, I need this
         * where that is too strict.
         *
         * Use example:
         * const elementWithId = (id: string) =>
         *   nullFilter<HTMLElement>(HtmlUtils.elementWithId, id)
         */
        const nullFilter: <T>(f: Function, ...parameters: any) => T;
        /**
         * Converts "Du" to "Ich" and "Dein" to "Mein" and so on.
         */
        const du2ich: (input: string, replaceFunction?: (rules: string, input: string) => string) => string;
    }
}
