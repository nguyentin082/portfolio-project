#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Portfolio Test Suite\n');

const tests = [
    { name: 'MongoDB', file: 'test/test-mongo.js', icon: '🗄️' },
    { name: 'Supabase', file: 'test/test-supabase-connection.js', icon: '🔗' },
    { name: 'Upload', file: 'test/test-upload.js', icon: '📤' },
    { name: 'JWT', file: 'test/test-jwt-functionality.js', icon: '🔐' },
];

async function runTest(test) {
    return new Promise((resolve) => {
        console.log(`${test.icon} Testing ${test.name}...`);

        const startTime = Date.now();
        const child = spawn('node', [test.file], {
            cwd: process.cwd(),
            stdio: 'pipe',
        });

        let output = '';
        child.stdout.on('data', (data) => (output += data.toString()));
        child.stderr.on('data', (data) => (output += data.toString()));

        child.on('close', (code) => {
            const duration = Date.now() - startTime;
            const status = code === 0 ? '✅ PASS' : '❌ FAIL';

            console.log(`   ${status} (${duration}ms)`);
            if (code !== 0) {
                console.log(
                    `   Error: ${
                        output
                            .split('\n')
                            .find((line) => line.includes('❌')) ||
                        'Unknown error'
                    }`
                );
            }

            resolve({ name: test.name, passed: code === 0, duration });
        });
    });
}

async function runAllTests() {
    const results = [];
    const startTime = Date.now();

    for (const test of tests) {
        const result = await runTest(test);
        results.push(result);
    }

    const totalTime = Date.now() - startTime;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;

    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Time: ${totalTime}ms`);
    console.log(`Success: ${((passed / results.length) * 100).toFixed(0)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Ready for development.');
    } else {
        console.log('\n⚠️  Some tests failed. Check configuration.');
    }

    process.exit(failed === 0 ? 0 : 1);
}

// Handle specific test
const testName = process.argv[2];
if (testName) {
    const test = tests.find((t) =>
        t.name.toLowerCase().includes(testName.toLowerCase())
    );
    if (test) {
        runTest(test).then((result) => {
            process.exit(result.passed ? 0 : 1);
        });
    } else {
        console.log('❌ Test not found. Available tests:');
        tests.forEach((t) =>
            console.log(`   ${t.icon} ${t.name.toLowerCase()}`)
        );
        process.exit(1);
    }
} else {
    runAllTests();
}
