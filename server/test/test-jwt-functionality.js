const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testJWT() {
    console.log('🔐 JWT Functionality Test\n');

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('❌ JWT_SECRET not found');
        process.exit(1);
    }

    const testUser = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
    };
    const tests = [];

    // Test 1: Generate Standard Token (with 'sub')
    try {
        const payload = {
            sub: testUser.id,
            email: testUser.email,
            exp: Math.floor(Date.now() / 1000) + 3600,
        };
        const token = jwt.sign(payload, secret);
        const decoded = jwt.verify(token, secret);

        tests.push({
            name: 'Standard Token (sub)',
            status: '✅',
            detail: `ID: ${decoded.sub}`,
        });
    } catch (error) {
        tests.push({
            name: 'Standard Token (sub)',
            status: '❌',
            detail: error.message,
        });
    }

    // Test 2: Generate Custom Token (with 'userId')
    try {
        const payload = {
            userId: testUser.id,
            email: testUser.email,
            exp: Math.floor(Date.now() / 1000) + 3600,
        };
        const token = jwt.sign(payload, secret);
        const decoded = jwt.verify(token, secret);

        tests.push({
            name: 'Custom Token (userId)',
            status: '✅',
            detail: `ID: ${decoded.userId}`,
        });
    } catch (error) {
        tests.push({
            name: 'Custom Token (userId)',
            status: '❌',
            detail: error.message,
        });
    }

    // Test 3: Strategy Compatibility (supports both formats)
    try {
        const standardToken = jwt.sign({ sub: testUser.id }, secret);
        const customToken = jwt.sign({ userId: testUser.id }, secret);

        const standardDecoded = jwt.verify(standardToken, secret);
        const customDecoded = jwt.verify(customToken, secret);

        // Simulate our JWT strategy logic
        const standardUserId = standardDecoded.sub || standardDecoded.userId;
        const customUserId = customDecoded.sub || customDecoded.userId;

        if (standardUserId === testUser.id && customUserId === testUser.id) {
            tests.push({
                name: 'Strategy Compatibility',
                status: '✅',
                detail: 'Both formats work',
            });
        } else {
            throw new Error('User ID extraction failed');
        }
    } catch (error) {
        tests.push({
            name: 'Strategy Compatibility',
            status: '❌',
            detail: error.message,
        });
    }

    // Test 4: Expired Token
    try {
        const expiredPayload = {
            sub: testUser.id,
            exp: Math.floor(Date.now() / 1000) - 3600,
        };
        const expiredToken = jwt.sign(expiredPayload, secret);

        try {
            jwt.verify(expiredToken, secret);
            tests.push({
                name: 'Token Expiration',
                status: '❌',
                detail: 'Should have expired',
            });
        } catch (expiredError) {
            if (expiredError.name === 'TokenExpiredError') {
                tests.push({
                    name: 'Token Expiration',
                    status: '✅',
                    detail: 'Correctly rejected',
                });
            } else {
                throw expiredError;
            }
        }
    } catch (error) {
        tests.push({
            name: 'Token Expiration',
            status: '❌',
            detail: error.message,
        });
    }

    // Test 5: Invalid Token
    try {
        jwt.verify('invalid.token.here', secret);
        tests.push({
            name: 'Invalid Token',
            status: '❌',
            detail: 'Should have failed',
        });
    } catch (error) {
        tests.push({
            name: 'Invalid Token',
            status: '✅',
            detail: 'Correctly rejected',
        });
    }

    // Results
    tests.forEach((test) => {
        console.log(`${test.status} ${test.name}: ${test.detail}`);
    });

    const failed = tests.filter((t) => t.status === '❌').length;
    console.log(`\n📊 Result: ${tests.length - failed}/${tests.length} passed`);

    if (failed > 0) process.exit(1);
}

testJWT().catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
});
