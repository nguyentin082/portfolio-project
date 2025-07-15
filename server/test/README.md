# Test Suite - Portfolio Project

Bộ test đơn giản và gọn gàng để kiểm tra## 💡 Features

-   ✅ **Gọn gàng**: Mỗi test ~50 dòng code
-   ✅ **Nhanh**: Tổng thời gian ~4 giây
-   ✅ **Rõ ràng**: Output đơn giản, dễ hiểu
-   ✅ **Độc lập**: Mỗi test chạy riêng được
-   ✅ **Cleanup**: Tự động dọn dẹp test data
-   ✅ **Shortcuts**: Bash script `./test.sh` để chạy nhanh

## 🚀 Quick Start

````bash
# Shortcut way
./test.sh            # Run all tests
./test.sh jwt        # Test JWT only
./test.sh upload     # Test upload only

# Direct way
node test/run-all-tests.js
node test/run-all-tests.js mongo
```ch vụ trong dự án.

## 📋 Test Files

| File | Mục đích | Thời gian |
|------|----------|-----------|
| `test-mongo.js` | MongoDB connection & collections | ~500ms |
| `test-supabase-connection.js` | Supabase storage access | ~700ms |
| `test-upload.js` | File upload/download functionality | ~2s |
| `test-jwt-functionality.js` | JWT token generation & validation | ~50ms |
| `run-all-tests.js` | Chạy tất cả tests | ~3s |

## 🚀 Cách sử dụng

```bash
# Chạy tất cả tests
node test/run-all-tests.js

# Chạy test cụ thể
node test/run-all-tests.js mongo
node test/run-all-tests.js supabase
node test/run-all-tests.js upload
node test/run-all-tests.js jwt

# Chạy trực tiếp
node test/test-mongo.js
node test/test-jwt-functionality.js
````

## 📋 Environment Variables

```bash
JWT_SECRET=your-jwt-secret
MONGODB_KEY=mongodb+srv://user:pass@cluster.mongodb.net/db
SUPABASE_URL=https://project.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_BUCKET_NAME=your-bucket
```

## 📊 Output Example

```
🧪 Portfolio Test Suite

�️  Testing MongoDB...
   ✅ PASS (432ms)
� Testing Supabase...
   ✅ PASS (678ms)
� Testing Upload...
   ✅ PASS (1854ms)
� Testing JWT...
   ✅ PASS (42ms)

📊 Summary
==========
Total: 4
Passed: 4
Failed: 0
Time: 3006ms
Success: 100%

🎉 All tests passed! Ready for development.
```

## 🔧 Troubleshooting

| Lỗi                         | Nguyên nhân        | Giải pháp                    |
| --------------------------- | ------------------ | ---------------------------- |
| `JWT_SECRET not found`      | Thiếu env variable | Thêm `JWT_SECRET` vào `.env` |
| `MongoDB connection failed` | Sai credentials    | Kiểm tra `MONGODB_KEY`       |
| `Supabase upload failed`    | Sai permissions    | Kiểm tra bucket permissions  |

## � Features

-   ✅ **Gọn gàng**: Mỗi test ~50 dòng code
-   ✅ **Nhanh**: Tổng thời gian ~3 giây
-   ✅ **Rõ ràng**: Output đơn giản, dễ hiểu
-   ✅ **Độc lập**: Mỗi test chạy riêng được
-   ✅ **Cleanup**: Tự động dọn dẹp test data

## 💡 Tips

1. **Chạy tests trước khi development**: Đảm bảo môi trường hoạt động đúng
2. **Kiểm tra .env file**: Đảm bảo tất cả variables được set
3. **Monitor network**: Một số tests cần internet connection
4. **Check permissions**: Supabase bucket cần đúng permissions
5. **Clean up**: Tests tự động cleanup, nhưng check manually nếu cần

## 🚀 Next Steps sau khi tests pass:

1. Start development server: `yarn start:dev`
2. Test API endpoints với Postman/Insomnia
3. Verify authentication flow
4. Test file upload với real files
5. Check error handling

---

**Note**: Các test files này được thiết kế để chạy độc lập và không ảnh hưởng đến production data.
