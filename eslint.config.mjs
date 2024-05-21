import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-redeclare": "error",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-undef": "off",
      "no-constant-binary-expression": "off",
      "no-constant-condition": "off",
      "no-shadow": ["error"
        , {
          "builtinGlobals": true, //true disallows shadowing of global variables such as `Object`, `Array`, etc.
          "hoist": "all",/*  "all" is the most restrictive. Controls the behavior for function declarations and can
           be set to `all`,`functions`, or `never`. */
          "allow": ["resolve", "reject","parent","name","currentTime","close","event",
            "runTests", "prompt","Window","target"]
        }
      ]
    }
  },
  {
    ignores: ["lib/*", "dist/*", "node_modules/*", "debugGitted/*",
    "debugGitted/**", "generated/**"]
  }
];