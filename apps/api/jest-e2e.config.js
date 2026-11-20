/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".e2e-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
  testEnvironment: "node",
  moduleNameMapper: {
    "^@srr/shared-types$": "<rootDir>/../../libs/shared-types/src/index.ts",
  },
};
