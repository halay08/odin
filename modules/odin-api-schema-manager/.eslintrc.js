module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "plugins": [ "@typescript-eslint" ],
  "rules": {
    "keyword-spacing": [ "error", { "overrides": {"if":{"after": false}, "for":{"after": false}}} ],
    "array-bracket-spacing":[ "error", "always" ],
    "no-extra-boolean-cast":[ "off" ],
    "no-async-promise-executor":[ "off" ],
    "@typescript-eslint/no-inferrable-types": [ "warn", {
      ignoreParameters: true,
      ignoreProperties: true
    } ],
    "indent": [ "error", 2 ],
    "@typescript-eslint/type-annotation-spacing": [ "warn", {
      before: false,
      after: true
    } ],
    // "space-infix-ops": "off",
    // "@typescript-eslint/space-infix-ops": [ "warn", { "int32Hint": true } ]
  }
};
