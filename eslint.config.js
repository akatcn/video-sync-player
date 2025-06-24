import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      reactHooks,
      importPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,

      // 'error'로 설정된 룰 (위반 시 오류 발생)
      "no-implicit-coercion": "error",
      "prefer-const": "error",
      "no-var": "error",
      curly: ["error", "all"],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "importPlugin/no-duplicates": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          selector: "variable",
          leadingUnderscore: "allow",
        },
        { format: ["camelCase", "PascalCase"], selector: "function" },
        { format: ["PascalCase"], selector: "interface" },
        { format: ["PascalCase"], selector: "typeAlias" },
      ],
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "reactHooks/rules-of-hooks": "error",
      "reactHooks/exhaustive-deps": "error",
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
      // '@typescript-eslint/member-ordering': [
      //   'error',
      //   {
      //     default: [
      //       'public-static-field',
      //       'private-static-field',
      //       'public-instance-field',
      //       'private-instance-field',
      //       'public-constructor',
      //       'private-constructor',
      //       'public-instance-method',
      //       'private-instance-method',
      //     ],
      //   },
      // ],

      // 'warn'으로 설정된 룰 (위반 시 경고 발생)
      "getter-return": "warn",
      "no-async-promise-executor": "warn",
      "@typescript-eslint/prefer-as-const": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true },
      ],
      "@typescript-eslint/no-var-requires": "warn",

      // 'off'로 설정된 룰 (비활성화)
      "no-undef": "off",
      indent: "off",
      semi: "off",
      "@typescript-eslint/indent": "off",
      "no-extra-boolean-cast": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  prettier,
]);
