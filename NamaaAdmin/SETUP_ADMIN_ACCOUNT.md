# 🛡️ إعداد حساب المسؤول

## خطوات إنشاء أول حساب أدمن (مرة واحدة فقط)

### الخطوة 1: إنشاء الحساب في Firebase Authentication

1. روحي إلى: https://console.firebase.google.com
2. اختاري مشروع **Namaa**
3. في القائمة اليسرى: **Build → Authentication**
4. اضغطي على تاب **Users**
5. اضغطي زر **Add User**
6. أدخلي:
   - **Email:** `admin@namaa.app` (أو أي إيميل تحبيه)
   - **Password:** كلمة سر قوية (8 أحرف على الأقل، أرقام، رموز)
7. اضغطي **Add User**
8. **انسخي الـ User UID** (سلسلة طويلة من الأحرف والأرقام)

### الخطوة 2: إضافة الدور في Firestore

1. في القائمة اليسرى: **Build → Firestore Database**
2. افتحي كولكشن `Users`
3. اضغطي **Add document**
4. في حقل **Document ID** الصقي الـ UID اللي نسختيه
5. أضيفي هذي الحقول:

| Field | Type | Value |
|-------|------|-------|
| `name` | string | المسؤول |
| `email` | string | admin@namaa.app |
| `role` | string | admin |

6. اضغطي **Save**

### الخطوة 3: تجربة تسجيل الدخول

1. افتحي `NamaaAdmin/login.html` في المتصفح
2. أدخلي الإيميل وكلمة المرور
3. لازم يحوّلك للـ Dashboard

## ⚠️ ملاحظات مهمة

- **الجلسة تنتهي** عند إغلاق المتصفح (لأمان أفضل)
- لو نسيتي كلمة المرور، روحي Firebase Console → Authentication → اضغطي على المستخدم → Reset password
- لإنشاء مسؤول إضافي، كرّري الخطوات
- **لا تحفظي** كلمة المرور في الكود!
