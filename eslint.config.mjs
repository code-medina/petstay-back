import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
    // Reglas base de JS
    js.configs.recommended,

    // Reglas de TypeScript
    ...tseslint.configs.recommended,

    // Desactiva reglas que chocan con Prettier
    eslintConfigPrettier,

    {
        files: ["**/*.ts"],
        rules: {
            // 🔥 Buenas prácticas base
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn"],

            "prefer-const": "error",
            "no-var": "error",

            // opcional pero recomendado
         "no-console": "warn"
        }
    },

    {
        ignores: ["dist/", "node_modules/"]
    }
);