const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
    const uri = process.env.MONGODB_KEY;
    console.log('Testing MongoDB connection...');
    console.log('URI:', uri ? uri.replace(/:[^:]*@/, ':****@') : 'undefined');
    
    if (!uri) {
        console.error('MONGODB_KEY not found in environment variables');
        return;
    }

    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ MongoDB connection successful!');
        
        // Test if we can list databases
        const databases = await client.db().admin().listDatabases();
        console.log('Available databases:', databases.databases.map(db => db.name));
        
        // Test if we can access the main database
        const db = client.db('main');
        const collections = await db.listCollections().toArray();
        console.log('Collections in main database:', collections.map(col => col.name));
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
    } finally {
        await client.close();
    }
}

testConnection();
