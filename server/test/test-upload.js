const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testUpload() {
    console.log('📤 Supabase Upload Test\n');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    const bucket = process.env.SUPABASE_BUCKET_NAME;

    if (!url || !key || !bucket) {
        console.error('❌ Missing Supabase config');
        process.exit(1);
    }

    const supabase = createClient(url, key);
    const tests = [];
    const testFiles = [
        {
            name: 'test.txt',
            content: Buffer.from('Hello World'),
            type: 'text/plain',
        },
        {
            name: 'test.json',
            content: Buffer.from('{"test":true}'),
            type: 'application/json',
        },
    ];

    for (const file of testFiles) {
        const fileName = `test/${file.name}`;

        try {
            // Upload
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file.content, {
                    contentType: file.type,
                    upsert: true,
                });
            if (uploadError) throw uploadError;

            // Download & Verify
            const { data: downloadData, error: downloadError } =
                await supabase.storage.from(bucket).download(fileName);
            if (downloadError) throw downloadError;

            const downloadedContent = await downloadData.text();
            const originalContent = file.content.toString();

            if (downloadedContent !== originalContent) {
                throw new Error('Content mismatch');
            }

            // Get Public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);
            if (!urlData.publicUrl) throw new Error('No public URL');

            // Cleanup
            await supabase.storage.from(bucket).remove([fileName]);

            tests.push({
                name: `Upload ${file.name}`,
                status: '✅',
                detail: `${file.content.length} bytes`,
            });
        } catch (error) {
            tests.push({
                name: `Upload ${file.name}`,
                status: '❌',
                detail: error.message,
            });
        }
    }

    // Large file test
    try {
        const largeFile = Buffer.alloc(1024 * 100, 'A'); // 100KB
        const fileName = 'test/large-file.txt';
        const startTime = Date.now();

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, largeFile, { upsert: true });
        if (uploadError) throw uploadError;

        const uploadTime = Date.now() - startTime;
        await supabase.storage.from(bucket).remove([fileName]);

        tests.push({
            name: 'Large File Upload',
            status: '✅',
            detail: `100KB in ${uploadTime}ms`,
        });
    } catch (error) {
        tests.push({
            name: 'Large File Upload',
            status: '❌',
            detail: error.message,
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

testUpload().catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
});
