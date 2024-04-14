module.exports = {
   extends: "next/core-web-vitals",
   plugins: ["@stylistic"],
   rules: {
      "@stylistic/eol-last": ["warn", "always"],
      "@stylistic/quotes": ["warn", "double"],
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
   }
}
