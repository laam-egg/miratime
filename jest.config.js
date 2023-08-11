const nextJest = require("next/jest");
const jest = require("jest");

const createJestConfig = nextJest({
    dir: "./"
});

/**
 * @type {jest.Config}
 */
const customJestConfig = {
    verbose: false,
    roots: ["./tests/"],
    preset: "ts-jest",
    moduleDirectories: [
        "node_modules",
        __dirname + "/src"
    ],
    globalSetup: "./tests/globalSetup.ts",
    globalTeardown: "./tests/globalTeardown.ts"
};

module.exports = createJestConfig(customJestConfig);
