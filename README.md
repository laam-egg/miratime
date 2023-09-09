# FRONTEND of Miratime - Timekeeper System for Miraculous Company

BACKEND: <https://github.com/laam-egg/miratime-be>

## Get Started
0. Clone the project to local machine.
1. Copy `.env.example` into a new file called `.env`.
2. Update the following variables if necessary:
    ```
    NODE_ENV=<development or production>
    API_BASE_URL=<Base URL to backend API server>
    ```
    See the backend repo for values on production.

3. Configure the application:
    ```shell
    pnpm install
    ```

4. Serve the frontend locally (usually available at <http://localhost:3000>):
    ```shell
    pnpm run dev
    ```

5. Deploy to production (currently Vercel):
    ```shell
    vercel
    ```

## Testing
To execute all tests, run:
```shell
pnpm test
```
TODO: Some note about `.env.test.example`

## Authentication
TODO: Some information about authentication.
