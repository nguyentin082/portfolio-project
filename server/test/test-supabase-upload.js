const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Comprehensive Supabase Upload Test
 * Tests file upload, download, and management functionality
 */
async function testSupabaseUpload() {
    console.log('📤 Testing Supabase Upload Functionality...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'portfolio-projects';

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase environment variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test files data
    const testFiles = [
        {
            name: 'test-text-file.txt',
            content: Buffer.from('This is a test text file content'),
            contentType: 'text/plain',
        },
        {
            name: 'test-json-file.json',
            content: Buffer.from(
                JSON.stringify({ test: true, timestamp: Date.now() })
            ),
            contentType: 'application/json',
        },
    ];

    console.log('🧪 Test Results:\n');
    let passedTests = 0;
    let totalTests = 0;

    for (const testFile of testFiles) {
        console.log(`📄 Testing file: ${testFile.name}`);
        console.log('----------------------------------------');

        try {
            // Test 1: Upload file
            totalTests++;
            console.log('1️⃣ Uploading file...');
            const { data: uploadData, error: uploadError } =
                await supabase.storage
                    .from(bucketName)
                    .upload(`test/${testFile.name}`, testFile.content, {
                        contentType: testFile.contentType,
                        upsert: true,
                    });

            if (uploadError) {
                console.error('❌ Upload failed:', uploadError.message);
                continue;
            }

            console.log('✅ Upload successful');
            console.log(`   Path: ${uploadData.path}`);
            console.log(`   FullPath: ${uploadData.fullPath}`);
            passedTests++;

            // Test 2: Get public URL
            totalTests++;
            console.log('2️⃣ Getting public URL...');
            const { data: publicUrlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(`test/${testFile.name}`);

            console.log('✅ Public URL generated');
            console.log(`   URL: ${publicUrlData.publicUrl}`);
            passedTests++;

            // Test 3: Download file
            totalTests++;
            console.log('3️⃣ Downloading file...');
            const { data: downloadData, error: downloadError } =
                await supabase.storage
                    .from(bucketName)
                    .download(`test/${testFile.name}`);

            if (downloadError) {
                console.error('❌ Download failed:', downloadError.message);
                continue;
            }

            const downloadedContent = await downloadData.text();
            const originalContent = testFile.content.toString();

            if (downloadedContent === originalContent) {
                console.log('✅ Download successful - content matches');
                passedTests++;
            } else {
                console.error('❌ Download failed - content mismatch');
                console.log(`   Expected: ${originalContent}`);
                console.log(`   Got: ${downloadedContent}`);
            }

            // Test 4: Get file info
            totalTests++;
            console.log('4️⃣ Getting file metadata...');
            const { data: fileList, error: listError } = await supabase.storage
                .from(bucketName)
                .list('test', {
                    search: testFile.name,
                });

            if (listError) {
                console.error('❌ File info failed:', listError.message);
                continue;
            }

            const fileInfo = fileList.find((f) => f.name === testFile.name);
            if (fileInfo) {
                console.log('✅ File metadata retrieved');
                console.log(
                    `   Size: ${fileInfo.metadata?.size || 'unknown'} bytes`
                );
                console.log(
                    `   Last Modified: ${fileInfo.updated_at || 'unknown'}`
                );
                console.log(
                    `   Content Type: ${
                        fileInfo.metadata?.mimetype || 'unknown'
                    }`
                );
                passedTests++;
            } else {
                console.error('❌ File not found in listing');
            }

            // Test 5: Generate signed URL (for private access)
            totalTests++;
            console.log('5️⃣ Generating signed URL...');
            const { data: signedUrlData, error: signedUrlError } =
                await supabase.storage
                    .from(bucketName)
                    .createSignedUrl(`test/${testFile.name}`, 3600); // 1 hour expiry

            if (signedUrlError) {
                console.error('❌ Signed URL failed:', signedUrlError.message);
            } else {
                console.log('✅ Signed URL generated');
                console.log(`   URL: ${signedUrlData.signedUrl}`);
                console.log(`   Expires in: 1 hour`);
                passedTests++;
            }
        } catch (error) {
            console.error('❌ Unexpected error:', error.message);
        }

        console.log('');
    }

    // Cleanup: Remove test files
    console.log('🧹 Cleaning up test files...');
    try {
        const filesToRemove = testFiles.map((f) => `test/${f.name}`);
        const { error: deleteError } = await supabase.storage
            .from(bucketName)
            .remove(filesToRemove);

        if (deleteError) {
            console.error('⚠️  Cleanup warning:', deleteError.message);
        } else {
            console.log('✅ Test files cleaned up successfully');
        }
    } catch (error) {
        console.error('⚠️  Cleanup error:', error.message);
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(
        `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );

    if (passedTests === totalTests) {
        console.log(
            '🎉 All tests passed! Supabase upload functionality is working perfectly.'
        );
    } else {
        console.log(
            '⚠️  Some tests failed. Please check the configuration and permissions.'
        );
    }
}

// Additional function to test large file upload
async function testLargeFileUpload() {
    console.log('\n📦 Testing Large File Upload...');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'portfolio-projects';

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase environment variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a larger test file (1MB)
    const largeContent = Buffer.alloc(1024 * 1024, 'A'); // 1MB of 'A' characters
    const fileName = 'test-large-file.txt';

    try {
        console.log('📤 Uploading 1MB test file...');
        const startTime = Date.now();

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(`test/${fileName}`, largeContent, {
                contentType: 'text/plain',
                upsert: true,
            });

        const uploadTime = Date.now() - startTime;

        if (uploadError) {
            console.error('❌ Large file upload failed:', uploadError.message);
            return;
        }

        console.log('✅ Large file upload successful');
        console.log(`   Upload time: ${uploadTime}ms`);
        console.log(`   File size: 1MB`);
        console.log(`   Path: ${uploadData.path}`);

        // Cleanup
        await supabase.storage.from(bucketName).remove([`test/${fileName}`]);

        console.log('🧹 Large test file cleaned up');
    } catch (error) {
        console.error('❌ Large file test error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    try {
        await testSupabaseUpload();
        await testLargeFileUpload();

        console.log('\n✅ All Supabase tests completed!');
        process.exit(0);
    } catch (error) {
        console.error('💥 Test suite failed:', error);
        process.exit(1);
    }
}

runAllTests();
