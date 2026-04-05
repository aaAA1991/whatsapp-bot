const express = require("express");
const axios = require("axios");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json());

// ─── إعدادات (من ملف .env) ───────────────────────────────────────────────────
const {
  WHATSAPP_TOKEN,        // Access Token من Meta
  WHATSAPP_PHONE_ID,     // Phone Number ID من Meta
  WEBHOOK_VERIFY_TOKEN,  // أي كلمة سرية تختارها أنت
  ANTHROPIC_API_KEY,     // مفتاح Claude API
  PORT = 3000,
} = process.env;

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ─── تخزين سياق المحادثة في الذاكرة ─────────────────────────────────────────
const conversations = {};

// ─── دالة الرد بالـ AI ────────────────────────────────────────────────────────
async function getAIReply(userPhone, userMessage) {
  // احتفظ بآخر 10 رسائل للسياق
  if (!conversations[userPhone]) conversations[userPhone] = [];
  conversations[userPhone].push({ role: "user", content: userMessage });
  if (conversations[userPhone].length > 10) conversations[userPhone].shift();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `أنت مساعد ذكي ودود يرد على رسائل واتساب باللغة العربية.
كن مختصراً ومفيداً. لا تستخدم Markdown أو نجوم أو رموز تنسيق.`,
    messages: conversations[userPhone],
  });

  const reply = response.content[0].text;
  conversations[userPhone].push({ role: "assistant", content: reply });
  return reply;
}

// ─── دالة إرسال رسالة واتساب ─────────────────────────────────────────────────
async function sendWhatsAppMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ─── Webhook Verification (Meta تطلبها مرة واحدة) ───────────────────────────
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ─── استقبال الرسائل ──────────────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // رد فوري لـ Meta

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") return;

    const from = message.from;         // رقم المرسل
    const text = message.text.body;    // نص الرسالة
    const contactName = value?.contacts?.[0]?.profile?.name || "صديقي";

    console.log(`📩 رسالة من ${contactName} (${from}): ${text}`);

    const reply = await getAIReply(from, text);
    await sendWhatsAppMessage(from, reply);

    console.log(`✅ رد أُرسل إلى ${from}`);
  } catch (err) {
    console.error("❌ خطأ:", err.message);
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "🟢 Bot is running!", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
