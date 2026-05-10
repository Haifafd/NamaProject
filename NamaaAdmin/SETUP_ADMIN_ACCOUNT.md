# 🛡️ إعداد حساب المسؤول

## خطوات إنشاء أول حساب أدمن (مرة واحدة فقط)

### الخطوة 1: إنشاء الحساب في Firebase Authentication

1. اذهب إلى: https://console.firebase.google.com
2. اختر مشروع **Namaa**
3. في القائمة اليسرى: **Build → Authentication**
4. اضغط على تاب **Users**
5. اضغط زر **Add User**
6. أدخل:
   - **Email:** `admin@namaa.app` (أو أي إيميل تريده)
   - **Password:** كلمة سر قوية (8 أحرف على الأقل، أرقام، رموز)
7. اضغط **Add User**
8. **انسخ الـ User UID** (سلسلة طويلة من الأحرف والأرقام)

### الخطوة 2: إضافة الدور في Firestore

1. في القائمة اليسرى: **Build → Firestore Database**
2. افتح كولكشن `Users`
3. اضغط **Add document**
4. في حقل **Document ID** الصق الـ UID الذي نسخته
5. أضف هذه الحقول:

| Field | Type | Value |
|-------|------|-------|
| `name` | string | المسؤول |
| `email` | string | admin@namaa.app |
| `role` | string | admin |

6. اضغط **Save**

### الخطوة 3: تجربة تسجيل الدخول

1. افتح `NamaaAdmin/login.html` في المتصفح
2. أدخل الإيميل وكلمة المرور
3. لازم يحوّلك للـ Dashboard

## ⚠️ ملاحظات مهمة

- **الجلسة تنتهي** عند إغلاق المتصفح (لأمان أفضل)
- لو نسيت كلمة المرور، اذهب إلى Firebase Console → Authentication → اضغط على المستخدم → Reset password
- لإنشاء مسؤول إضافي، كرّر الخطوات
- **لا تحفظ** كلمة المرور في الكود!
