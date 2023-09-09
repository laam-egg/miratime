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
    globalTeardown: "./tests/globalTeardown.ts",
    // I had to use transformIgnorePatterns here to force
    // transformation for module `url-join`.
    // However, it seems to be ignored. Solution is to add
    // it later below (in `module.exports`). Reason:
    // https://stackoverflow.com/a/75290353/13680015
};

module.exports = async () => {
    return {
        ...(await createJestConfig(customJestConfig)()),
        transformIgnorePatterns: [
            '!/node_modules/'
        ]
    }
};
