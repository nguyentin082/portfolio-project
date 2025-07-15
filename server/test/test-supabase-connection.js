const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabase() {
    console.log('🧪 Supabase Connection Test\n');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    const bucket = process.env.SUPABASE_BUCKET_NAME;

    if (!url || !key) {
        console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY');
        process.exit(1);
    }

    const supabase = createClient(url, key);
    const tests = [];

    // Test 1: Storage Access
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        tests.push({
            name: 'Storage Access',
            status: '✅',
            detail: `${data.length} buckets`,
        });
    } catch (error) {
        tests.push({
            name: 'Storage Access',
            status: '❌',
            detail: error.message,
        });
    }

    // Test 2: File Operations
    if (bucket) {
        try {
            const fileName = `test-${Date.now()}.txt`;
            const content = Buffer.from('test');

            // Upload
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, content);
            if (uploadError) throw uploadError;

            // Download
            const { data: downloadData, error: downloadError } =
                await supabase.storage.from(bucket).download(fileName);
            if (downloadError) throw downloadError;

            // Cleanup
            await supabase.storage.from(bucket).remove([fileName]);

            tests.push({
                name: 'File Operations',
                status: '✅',
                detail: 'Upload/Download OK',
            });
        } catch (error) {
            tests.push({
                name: 'File Operations',
                status: '❌',
                detail: error.message,
            });
        }
    }

    // Results
    tests.forEach((test) => {
        console.log(`${test.status} ${test.name}: ${test.detail}`);
    });

    const failed = tests.filter((t) => t.status === '❌').length;
    console.log(`\n📊 Result: ${tests.length - failed}/${tests.length} passed`);

    if (failed > 0) process.exit(1);
}

testSupabase().catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
});
