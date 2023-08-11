async function teardownServer() {
    
}

import mongoose from "mongoose";

async function teardownDatabase() {
    await mongoose.disconnect();
}

export default async function globalTeardown(_globalConfig: any, _projectConfig: any) {
    await teardownDatabase();
    await teardownServer();
}
