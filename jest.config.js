const nextJest = require("next/jest");

const createJestConfig = nextJest({
    dir: "./"
});

const customJestConfig = {
    verbose: false,
    roots: ["./tests/"],
    preset: "ts-jest",
    moduleDirectories: [
        "node_modules",
        __dirname + "/src"
    ]
};

module.exports = createJestConfig(customJestConfig);
