const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testMongo() {
    console.log('🗄️  MongoDB Connection Test\n');

    const uri = process.env.MONGODB_KEY;
    if (!uri) {
        console.error('❌ MONGODB_KEY not found');
        process.exit(1);
    }

    const client = new MongoClient(uri);
    const tests = [];

    try {
        // Connection
        await client.connect();
        tests.push({
            name: 'Connection',
            status: '✅',
            detail: 'Connected to Atlas',
        });

        // Database access
        const db = client.db('main');
        const collections = await db.listCollections().toArray();
        tests.push({
            name: 'Database Access',
            status: '✅',
            detail: `${collections.length} collections`,
        });

        // Check users collection
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        tests.push({
            name: 'Users Collection',
            status: '✅',
            detail: `${userCount} users`,
        });
    } catch (error) {
        tests.push({
            name: 'MongoDB Test',
            status: '❌',
            detail: error.message,
        });
    } finally {
        await client.close();
    }

    // Results
    tests.forEach((test) => {
        console.log(`${test.status} ${test.name}: ${test.detail}`);
    });

    const failed = tests.filter((t) => t.status === '❌').length;
    console.log(`\n📊 Result: ${tests.length - failed}/${tests.length} passed`);

    if (failed > 0) process.exit(1);
}

testMongo().catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
});
