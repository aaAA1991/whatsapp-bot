# 🤖 WhatsApp AI Bot

بوت واتساب ذكي يرد تلقائياً بالعربية باستخدام Claude AI

---

## 📋 المتطلبات

قبل النشر تحتاج **3 مفاتيح**:

| المفتاح | من أين تحصل عليه |
|---------|-----------------|
| `WHATSAPP_TOKEN` | [developers.facebook.com](https://developers.facebook.com) |
| `WHATSAPP_PHONE_ID` | نفس الموقع بعد إنشاء التطبيق |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

---

## 🚀 خطوات النشر على Railway

### الخطوة 1: إعداد Meta Developer

1. اذهب إلى [developers.facebook.com](https://developers.facebook.com)
2. اضغط **My Apps** ← **Create App**
3. اختر **Business** ← اكتب اسم التطبيق
4. من القائمة الجانبية اضغط **WhatsApp** ← **API Setup**
5. احفظ:
   - ✅ **Phone Number ID**
   - ✅ **Access Token** (اضغط Generate)

---

### الخطوة 2: احصل على Claude API Key

1. اذهب إلى [console.anthropic.com](https://console.anthropic.com)
2. **API Keys** ← **Create Key**
3. انسخ المفتاح واحفظه

---

### الخطوة 3: ارفع على Railway

1. اذهب إلى [railway.app](https://railway.app) وسجّل بحساب GitHub
2. اضغط **New Project** ← **Deploy from GitHub repo**
3. ارفع هذا المجلد على GitHub أولاً
4. في Railway اضغط **Variables** وأضف:

```
WHATSAPP_TOKEN=قيمتك
WHATSAPP_PHONE_ID=قيمتك
WEBHOOK_VERIFY_TOKEN=mysecrettoken123
ANTHROPIC_API_KEY=قيمتك
```

5. Railway سيعطيك رابط مثل: `https://your-app.railway.app`

---

### الخطوة 4: ربط Webhook مع Meta

1. ارجع إلى Meta Developer ← **WhatsApp** ← **Configuration**
2. في **Webhook** اضغط **Edit**
3. ضع:
   - **URL**: `https://your-app.railway.app/webhook`
   - **Verify Token**: `mysecrettoken123`
4. اضغط **Verify and Save**
5. اشترك في **messages** من Webhook Fields

---

### الخطوة 5: اختبر البوت! 🎉

أرسل رسالة على الرقم المعتمد وانتظر الرد التلقائي!

---

## 🔧 تخصيص الرد

في ملف `src/index.js` عدّل هذا السطر:

```js
system: `أنت مساعد ذكي ودود يرد على رسائل واتساب باللغة العربية.
كن مختصراً ومفيداً.`
```

يمكنك تغيير شخصية البوت كيف تريد!

---

## 📁 هيكل المشروع

```
whatsapp-bot/
├── src/
│   └── index.js        ← الكود الرئيسي
├── .env.example        ← نموذج المتغيرات
├── .gitignore
├── package.json
└── README.md
```
