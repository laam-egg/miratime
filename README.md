# Miratime - Timekeeper System for Miraculous Company

## Technical Notes
 - For testing purpose, I use NextJS with an ExpressJS custom server to launch the server in the background before API testing. Upon cleanup, while the Express server could exit gracefully, the underlying NextJS async function (that compiles the server code just-in-time) could not, leaving the test script running indefinitely. Therefore, in `package.json` I use `jest` with `--forceExit` flag to force the test script to stop after all tests have finished.
