'use strict';

// APPROACH:
// Setup custom NextJS server:
//     https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
//     https://viblo.asia/p/custom-server-express-cho-ung-dung-nextjs-gGJ599oa5X2
// Then provide server address for test cases to test.

import next from "next";
import express from "express";
import type { Server as HTTPServer } from "http";

async function setupServer(): Promise<{
    serverAddress: string,
    tearDown: () => Promise<undefined>
}> {
    let serverAddress: (string | undefined) = process.env.TEST_SERVER_ADDRESS;
    if (serverAddress !== undefined) {
        // USE REMOTE SERVER
        return {
            serverAddress,
            tearDown: () => new Promise((resolve) => resolve(undefined))
        };
    } else {
        // SETUP CUSTOM SERVER
        const port = 3000;
        const dev = (process.env.NODE_ENV !== "production");
        const app = next({ dev });
        const handleRequest = app.getRequestHandler();

        await app.prepare();
        const expressServer = express();
        expressServer.all("*", (req, res) => handleRequest(req, res));

        let httpServer: HTTPServer;
        await new Promise((resolve, reject) => {
            httpServer = expressServer.listen(port, () => resolve(undefined));
        });

        serverAddress = `http://localhost:${port}`;

        return {
            serverAddress,
            tearDown: () => new Promise((resolve, reject) => {
                httpServer.close((err) => {
                    if (err) reject(err);
                    resolve(undefined);
                });
            })
        };
    }
}

import mongoose from "mongoose";

async function setupDatabase(): Promise<undefined> {
    const MONGODB_URI = process.env.TEST_MONGODB_URI;
    if (MONGODB_URI === undefined) {
        throw new Error("TEST_MONGODB_URI not specified in .env.test");
    }
    await mongoose.connect((MONGODB_URI as string));
}

export default async function globalSetup(_globalConfig: any, _projectConfig: any) {
    await setupServer();
    await setupDatabase();
}
