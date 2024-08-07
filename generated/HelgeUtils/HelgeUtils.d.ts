/**
 * Updates: https://github.com/silidev/HelgeUtils/blob/main/HelgeUtils.ts
 *
 * HelgeUtils.ts V1.0
 * @description A collection of general utility functions not connected to a
 * specific project.
 *
 * Copyright by Helge Tobias Kosuch 2024 */
export declare namespace HelgeUtils {
    /** Config */
    /** You can turn this off for debugging */
    export namespace Config {
        namespace Debug {
            let debug: boolean;
            namespace Misc {
                /** Misc because these are used in the Misc namespace below */
                let bufferFunctionReturnValues: boolean;
            }
        }
    }
    export namespace Exceptions {
        /**
         * This is just a template to inline. */
        const defineCustom: () => void;
        const stackTrace: (e: unknown) => string;
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
        const unhandledExceptionAlert: (e: any) => string;
        /** swallowAll
         * Wraps the given void function in a try-catch block and swallows any exceptions.
         *
         * Example use:
         const produceError = () => {throw "error"}
         const noError = swallowAll(produceError)
         noError(); // Does NOT throw an exception.
         *
         * @param func
         */
        const swallowAll: <T>(func: (...args: T[]) => void) => (...args: T[]) => void;
        /** Alias for swallowAll
         * @deprecated */
        const catchAll: <T>(func: (...args: T[]) => void) => (...args: T[]) => void;
        /** Alias for swallowAll
         * @deprecated */
        const unthrow: <T>(func: (...args: T[]) => void) => (...args: T[]) => void;
        /** callAndAlertAboutException(...)
         *
         * Used to wrap around UI function which would otherwise just fail silently.
         *
         * Often it is good to copy this function to your code
         * and bake an even better reporting mechanism in.
         *
         Use this template to use this:
         <pre>
         buttonWhatever: () => callAndAlertAboutException(() => {
         // your code here
         })
         </pre>
         */
        const callAndAlertAboutException: (f: () => void) => void;
        /**
         * Calls the function and swallows any exceptions. */
        const callSwallowingExceptions: (f: () => void) => void;
        /** @deprecated Inline this everywhere! */
        const throwError: (msg: string) => never;
        /**
         *
         * See also {@link Exceptions.defineCustom}
         *
         * Example:
         * <pre>
         try {
         } catch (error) {
         catchSpecificError(RangeError, 'Invalid time value', (error) => {}
         }
         </pre>
         *
         * @param errorType
         * @param callback
         * @param wantedErrorMsg
         */
        const catchSpecificError: (errorType: any, callback: (error: Error) => void, wantedErrorMsg?: string | null) => (error: Error) => void;
    }
    export namespace Types {
        interface Switch {
            enabled(): boolean;
        }
    }
    export namespace Eval {
        /**
         * Like "eval(...)" but a little safer and with better performance.
         *
         * The codeStr must be known to be from a secure source, because
         * injection of code through this is easy. This is intentional to
         * allow important features.
         * */
        const evalBetter: (codeStr: string, args: any) => any;
        /**
         * Somewhat like eval(...) but a little safer and with better performance.
         *
         * In contrast to {@link evalBetter} here you can and must use a return
         * statement if you want to return a value.
         *
         * Docs about the method:
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
         *
         * @param functionBodyStr
         * @param args {object} An object with entities, which you want to give the code
         *        in the string access to.
         * */
        const executeFunctionBody: (functionBodyStr: string, args: object) => any;
    }
    /** Yes, this must be here to b/c this file can't depend on AnkiUtils.
     * Some of this code contains special cases for Anki. */
    export const Anki: any;
    export namespace Conversions {
        const parseIntWithNull: (input: string | null) => number | null;
        const parseFloatWithNull: (input: string | null) => number | null;
    }
    export namespace Types {
        class TypeException extends Error {
            constructor(message: string);
        }
        namespace SafeConversions {
            const toNumber: (input: string) => number;
            const toBoolean: (resultAsString: string) => boolean;
        }
    }
    /** Returns true if the parameter is not undefined. */
    export const isDefined: (x: any) => boolean;
    /**
     * This is only useful in JS. Not needed in TS.
     *
     * createImmutableStrictObject({}).doesNotExist will
     * throw an error, in contrast to {}.whatEver, which
     * will not.
     */
    export const createImmutableStrictObject: (input: object) => any;
    export namespace MarkDown {
        /** Returns the text of only the == ==-highlighted text. */
        const extractHighlights: (input: string) => string[];
    }
    /**
     * A function that does nothing. I use it to avoid "unused variable" warnings.
     *
     * Old name: nop
     *
     * @param args
     */
    export const suppressUnusedWarning: (...args: any[]) => void;
    export const crossRefOnly: (...args: any[]) => void;
    export namespace Tests {
        /** This function is a copy template. */
        const runTestsOnlyToday: () => void;
        const assert: (condition: boolean, ...output: any[]) => void;
        /**
         * V2 27.04.2024
         */
        const assertEquals: (actual: any, expected: any, message?: string | null) => void;
    }
    export const consoleLogTmp: (...args: any[]) => void;
    export const consoleLogTheDifference: (actual: string, expected: string) => void;
    export const testRemoveElements: () => void;
    /**
     * removeElements
     *
     * @param input is an array of elements
     * @param toBeRemoved a list of elements which should be removed.
     *
     * @return *[] list with the elements removed
     */
    export const removeElements: (input: any[], toBeRemoved: any) => string[];
    export namespace Strings {
        namespace Regexes {
            /**
             * Replaces parts of a string based on a list of regular expression and replacement
             * pairs.
             *
             * @param {string} input - The input string to be processed.
             * @param {Array.<[RegExp, string]>} replacementList - An array of arrays, where
             *     each inner array contains a RegExp object and a string. and the
             *     corresponding strings are used to replace those matches.
             *
             * @returns {string} - The processed string with replacements applied.
             *
             * The function first pads the input string with spaces at the beginning and end.
             * Then, for each pair in the replacement list, it performs a replacement operation
             *     using the given regular expression and replacement string. Finally, it
             *     ensures the first and last characters of the resulting string are spaces,
             *     removes them, and returns the modified string.
             *
             * Example:
             * ```
             * const input = "example text"
             * const replacementList = [
             *   [/\bexample\b/g, "sample"],
             *   [/\btext\b/g, "string"]
             * ]
             * const result = replaceFromList(input, replacementList)
             * console.log(result); // Outputs: "sample string"
             * ```
             */
            const replaceFromList: (input: string, replacementList: [RegExp | string, string][]) => string;
        }
        /** Returns the index of the first occurrence of the given regex in the string.
         *
         * @param input
         * @param regex
         * @param startpos
         */
        const regexIndexOf: (input: string, regex: RegExp, startpos: number) => number;
        /**
         * @deprecated Use regexIndexOf instead.
         * @see regexIndexOf
         */
        const indexOfWithRegex: (input: string, regex: RegExp, startpos: number) => number;
        const regexLastIndexOf: (input: string, regex: RegExp, startpos: number) => number;
        /**
         * @deprecated Use regexLastIndexOf instead.
         */
        const lastIndexOfWithRegex: (input: string, regex: RegExp, startpos: number) => number;
        /**
         * Trim whitespace but leave a single newline at the end if there is
         * any whitespace that includes a newline.
         */
        const trimExceptASingleNewlineAtTheEnd: (input: string) => string;
        const toUppercaseFirstChar: (input: string) => string;
        const escapeRegExp: (str: string) => string;
        const runTests: () => void;
        const removeEmojis: (str: string) => string;
        const testRemoveEmojis: () => void;
        /** Return a string representation of a number, with the leading zero removed.
         * Example: numToStr(0.5) returns ".5". */
        const numToStr: (num: number | string) => string;
        const tagsStringToArray: (input: string) => string[];
        const Whitespace: {
            new (): {};
            runTests(): void;
            /*************
             * Replace each stretch of whitespace in a string with a single underscore.
             * Gotchas: This also removes leading and trailing whitespace.
             * For easier comparing in unit tests. */
            replaceWhitespaceStretchesWithASingleUnderscore(inputString: string): string;
            replaceTabAndSpaceStretchesWithASingleSpace(inputString: string): string;
            /************* replaceWhitespaceStretchesWithASingleSpace
             * replace each stretch of whitespace in a string with a single space
             */
            replaceWhitespaceStretchesWithASingleSpace(str: string): string;
            testReplaceWhitespaceStretchesWithASingleSpace(): void;
            standardizeLeadingWhitespace(inputString: string): string;
            replaceLeadingWhitespace(inputString: string, replacement: string): string;
            removeLeadingWhitespace(inputString: string): string;
            testRemoveLeadingWhitespace(): void;
            removeAllSpaces(inputString: string): string;
        };
        /**
         * In the given template input string, replace all occurrences of ${key}
         * with the value of the key in the replacements object.
         * Example:
         * const input = "Hello ${name}, you are ${age} years old."
         * const replacements = { name: "John", age: 25 }
         * const result = formatString(input, replacements)
         * // result is now "Hello John, you are 25 years old." */
        const formatString: (input: string, replacements: object) => string;
        const isBlank: (input: string) => boolean;
        const isNotBlank: (input: string) => boolean;
        const removeLineBreaks: (input: string) => string;
        const capitalizeSentences: (text: string, sentenceEndMarkerRegex?: RegExp) => string;
        const testCapitalizeSentences: () => void;
    }
    export const randomElementOf: <T>(arr: T[]) => T;
    export const runTests: () => void;
    export namespace TTS {
        /**
         * Always fails with error code 400 :(
         *
         * https://platform.openai.com/docs/api-reference/audio/createSpeech
         */
        const withOpenAi: (input: string, apiKey: string) => Promise<void>;
    }
    export namespace ReplaceByRules {
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
         * NOT reliable in Anki and AnkiDroid.
         *
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
    export const memoize: <T, R>(func: (...args: T[]) => R) => (...args: T[]) => R;
    export namespace Misc {
        /** This is NOT only for unit tests! */
        const assertTypeEquals: (value: any, expectedType: string) => void;
        /** nullFilter
         *
         * Throws an exception if the input is null.
         *
         * This canNOT be replace with the ?? in assignments.
         *
         * I use "strictNullChecks": true to avoid bugs. Therefore, I need this
         * where that is too strict.
         *
         * Use example:
         * const elementWithId = (id: string) =>
         *   nullFilter<HTMLElement>(HtmlUtils.elementWithId(id)) */
        const nullFilter: <U>(input: U | null) => U;
    }
    export namespace Net {
        namespace OpenAi {
            namespace Test {
                const testApiUp: () => Promise<void>;
            }
        }
    }
    export namespace Debugging {
        namespace DevConsoles {
            namespace Eruda {
                /**
                 * Often you should inline this function and load it before other scripts.
                 * */
                const load: () => void;
            }
        }
    }
    class DatesAndTimesInternal {
        static Weekdays: {
            readonly Sunday: 0;
            readonly Monday: 1;
            readonly Tuesday: 2;
            readonly Wednesday: 3;
            readonly Thursday: 4;
            readonly Friday: 5;
            readonly Saturday: 6;
        };
        private static pad;
        static nextWeekdayLocalIsoDate(weekday: number, now?: Date): Date;
        static isValidISODate(str: string): boolean;
        static isValidDate(date: Date): boolean;
        static cutAfterMinutesFromISODate(isoDate: string): string;
        static cutAfterHourFromISODate(isoDate: string): string;
        static parseRelaxedIsoDate(input: string): Date | null;
        static testParseRelaxedIsoDate(): void;
        private static year;
        private static date2yyyymmddDashedYearDigits;
        private static day;
        private static month;
        private static twoDigitDay;
        private static twoDigitMonth;
        static date2ddmmyyPointed(date: Date, twoDigitYear: boolean): string;
        static date2dmyyPointed(date: Date, twoDigitYear: boolean): string;
        /** Return a string representation of a date in the format YYYY-MM-DD.
         * Example: date2yyyymmddDashed(new Date(2022, 0, 1)) returns "2022-01-01". */
        static date2yyyymmddDashed(date: Date): string;
        static date2yymmddDashed(date: Date): string;
        static Timestamps: {
            new (): {};
            yymmddDashed(): string;
            ddmmyyPointed(): string;
        };
        /**
         * Converts a Date object to an ISO 8601 formatted string using the local time zone.
         *
         * @param {Date} date - The Date object to be converted.
         * @returns {string} An ISO 8601 formatted date string in the local time zone.
         */
        static dateToLocalIsoDate(date: Date): string;
        static runTests(): void;
    }
    export const DatesAndTimes: typeof DatesAndTimesInternal;
    export {};
}
