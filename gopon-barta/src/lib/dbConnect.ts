/**
 * WHY THIS FILE EXISTS (important for future me 👇)
 *
 * In traditional Express apps, the Node.js server is long-running,
 * so a database connection is created once at startup and stays alive.
 *
 * In Next.js (especially when deployed on serverless platforms like Vercel),
 * backend code runs inside serverless functions:
 *  - A function is started on request
 *  - It may be reused for multiple requests
 *  - Or it may be frozen / destroyed at any time
 *
 * Because of this unpredictable lifecycle, opening a new DB connection
 * on every request can cause serious bottlenecks or connection storms.
 *
 * Solution:
 *  - Cache the database connection in a global variable
 *  - Reuse it if the same serverless instance handles multiple requests
 *  - Still allow new connections if a new instance is created (unavoidable)
 *
 * NOTE:
 * - This pattern is required for serverless deployments
 * - It also works safely for self-hosted Next.js or local dev
 * - Edge Runtime does NOT support persistent DB connections, so DB access
 *   must run in the Node.js runtime, not Edge.
 */

import mongoose from 'mongoose';

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    // as in nextjs if deployed on serverless, the backend
    // process lifecycle is unpredictable
    if(connection.isConnected) {
        console.log("Already connected to database");
    } 

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})

        connection.isConnected = db.connections[0].readyState

        console.log("DB Connected Successfully");
    } catch (error) {

        console.log("Database connection failed", error);
        process.exit(1)
    }
}

export default dbConnect;