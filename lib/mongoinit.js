const { MongoClient } = require('mongodb');

if (!process.env.MONGODB_URI)
  throw new Error("Add 'MONGODB_URI' to environment variables");

if (!process.env.DATABASE_NAME)
  throw new Error("Add 'DATABASE_NAME' to environment variables");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

// interface AuthDbSchema {
//     username: string;
//     hash: string;
//     email: string;
//     createdAt: Date;
//     updatedAt: Date;
//     token: string[];
//     otpNow?: {
//       otp: string;
//       expiresAt: Date;
//     };
// }

export async function db() {  
  const conn = await client.connect();
  console.log(`Connected to MongoDB at '${uri}'`);
  return conn.db(process.env.DATABASE_NAME);
}
