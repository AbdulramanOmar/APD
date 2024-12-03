const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const TelegramBot = require("node-telegram-bot-api");

// توكن البوت
const botToken = "7795919593:AAEC98leU_NwVRjsj-zPZTx9-LkcKRslcLM";
const bot = new TelegramBot(botToken, { polling: true });

// إعداد Firebase Admin
const serviceAccount = require("./firebase.json"); // ملف الخدمة
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore(); // إنشاء اتصال بقاعدة البيانات
const codesCollection = db.collection("codes"); // تعريف مجموعة الأكواد

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات Express
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ** وظائف API **

// جلب الأكواد
app.get("/api/codes", async (req, res) => {
  try {
    const snapshot = await codesCollection.get();
    const codes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ codes });
  } catch (err) {
    console.error("Error fetching codes from Firestore:", err);
    res.status(500).json({ message: "خطأ في جلب البيانات" });
  }
});

// إضافة كود جديد
app.post("/add-code", async (req, res) => {
  const { codeName, codeValue, codeDes } = req.body;
  if (!codeName || !codeValue || !codeDes) {
    return res.status(400).json({ message: "يرجى إدخال اسم الكود وقيمته" });
  }

  try {
    await codesCollection.add({
      name: codeName,
      value: codeValue,
      des: codeDes,
    });
    res.status(200).json({ message: "تمت إضافة الكود بنجاح" });
  } catch (err) {
    console.error("Error adding code to Firestore:", err);
    res.status(500).json({ message: "خطأ في حفظ البيانات" });
  }
});

// حذف كود معين
app.delete("/api/codes/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const snapshot = await codesCollection.where("name", "==", name).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: "الكود غير موجود" });
    }

    // حذف جميع المستندات التي تحمل الاسم المطلوب
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).json({ message: "تم حذف الكود بنجاح" });
  } catch (err) {
    console.error("Error deleting code from Firestore:", err);
    res.status(500).json({ message: "خطأ في حذف البيانات" });
  }
});

// ** بوت Telegram **

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = normalizeArabicText(msg.text.trim()).toLowerCase();

  try {
    const snapshot = await codesCollection.get();
    const codes = snapshot.docs.map((doc) => doc.data());

    const foundCode = codes.find((code) =>
      message.includes(normalizeArabicText(code.name).toLowerCase())
    );

    if (foundCode) {
      bot.sendMessage(
        chatId,
        `
        ها هو كود الخصم الفعال الخاص ب${foundCode.name} :
                     ${foundCode.value}
         \n
         اضغط علي الكوبون للنسخ تلقائي :
            ${foundCode.value}
         \n 
                    ${foundCode.des}
                    تابعنا يوصلك كوبونات حصرية 
        `
      );
    } else {
      // عند عدم العثور على الكود، يتم إرسال رسالة اعتذار + اختيار كود عشوائي
      const randomCode = codes[Math.floor(Math.random() * codes.length)];
      bot.sendMessage(
        chatId,
        `
       وفرنا لك جميع المتاجر البديلة ل${message} بكوبونات فعالة و موثوقة 100%
       \n
       وفرنا لك كود خصم ل${randomCode.name}
       \n
         هذا هو كود خصم خاص بك:
        \n
        ${randomCode.name} : ${randomCode.value}
        \n
        ${randomCode.des}
        \n
        تابعنا يوصلك كوبونات حصرية 
        `
      );
    }
  } catch (err) {
    console.error("Error fetching codes for Telegram bot:", err);
    bot.sendMessage(chatId, "حدث خطأ أثناء جلب الأكواد. يرجى المحاولة لاحقًا.");
  }
});

// رد على زر النسخ
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("copy_")) {
    const codeValue = data.replace("copy_", "");
    bot.sendMessage(chatId, `✅ تم نسخ الكود: ${codeValue}`);
  }
});

// ** وظيفة لتنظيف النصوص العربية للتعامل مع التشكيلات والمسافات **
function normalizeArabicText(text) {
  return text
    .replace(/[\u064B-\u065F]/g, "") // إزالة التشكيل
    .replace(/ى/g, "ي") // استبدال الألف المقصورة
    .replace(/ة/g, "ه") // استبدال التاء المربوطة
    .trim();
}

// بدء تشغيل الخادم
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
