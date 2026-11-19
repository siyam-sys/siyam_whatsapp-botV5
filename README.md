
<!-- ====================================================== -->
<!--                 RJ-SIYAM WHATSAPP BOT V5              -->
<!-- ====================================================== -->

<p align="center">
  <img src="https://i.imgur.com/C5LX7BN.gif" width="100%" alt="RJ Siyam WhatsApp Bot Banner">
</p>

<h1 align="center">
  🤖 RJ-SIYAM WHATSAPP BOT V5
</h1>

<p align="center">
  <b>Powerful • Advanced • Modular • Easy to Customize</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VERSION-5.0.0-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/NODE.JS-20%2B-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/PLATFORM-WHATSAPP-25D366?style=for-the-badge&logo=whatsapp&logoColor=white">
  <img src="https://img.shields.io/badge/STATUS-ACTIVE-success?style=for-the-badge">
</p>

<p align="center">
  <a href="https://github.com/siyam-sys/siyam_whatsapp-botV5">
    <img src="https://img.shields.io/badge/GITHUB-REPOSITORY-black?style=for-the-badge&logo=github">
  </a>
  <a href="https://github.com/siyam-sys/siyam_whatsapp-botV5/stargazers">
    <img src="https://img.shields.io/github/stars/siyam-sys/siyam_whatsapp-botV5?style=for-the-badge&color=yellow">
  </a>
  <a href="https://github.com/siyam-sys/siyam_whatsapp-botV5/network/members">
    <img src="https://img.shields.io/github/forks/siyam-sys/siyam_whatsapp-botV5?style=for-the-badge&color=blue">
  </a>
</p>

---

## 💎 ABOUT THE PROJECT

**RJ-SIYAM WHATSAPP BOT V5** একটি Advanced WhatsApp Automation Bot।

এটি Node.js এবং Baileys ব্যবহার করে তৈরি করা হয়েছে। এতে রয়েছে Command System, Event System, Admin Permission, Pairing Code, Welcome Card, Database এবং আরও অনেক ফিচার।

### ✨ Main Features

| Feature | Description |
|---|---|
| 🔐 Pairing Code | WhatsApp নম্বর দিয়ে Login |
| ⚙️ Command System | আলাদা Command File |
| 👑 Owner System | Main Owner Permission |
| 🛡️ Admin System | Bot Admin ও Group Admin |
| 📋 Whitelist | নির্দিষ্ট User Allow |
| 🎨 Welcome Card | সুন্দর Welcome Image |
| 📂 Event System | আলাদা Event Handler |
| 🔄 Auto Reconnect | Connection Reconnect |
| 💾 Database | User ও Group Data |
| 🧩 Modular System | নতুন Command যোগ করা যায় |

---

## 📊 PROJECT INFORMATION

<p align="center">
  <img src="https://img.shields.io/badge/Command_Files-53-blueviolet?style=for-the-badge">
  <img src="https://img.shields.io/badge/Version-5.0.0-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge">
</p>

> বর্তমানে রিপোজিটরির `scripts/cmds/` ফোল্ডারে ৫৩টি JavaScript কমান্ড ফাইল রয়েছে। এটি ফাইলের সংখ্যা; সব ফাইল সফলভাবে লোড হয়েছে—এমন নিশ্চয়তা নয়।

---

## 🗂️ PROJECT STRUCTURE

```text
siyam_whatsapp-botV5/
│
├── core/
│   ├── commandHandler.js
│   ├── connection.js
│   ├── errorHandler.js
│   ├── eventHandler.js
│   ├── messageHandler.js
│   ├── pairing.js
│   └── permission.js
│
├── database/
│   ├── groups.js
│   ├── index.js
│   └── users.js
│
├── scripts/
│   ├── cmds/
│   │   ├── help.js
│   │   ├── bot.js
│   │   ├── uid.js
│   │   └── ...more commands
│   │
│   ├── events/
│   │   ├── welcome.js
│   │   ├── leave.js
│   │   └── ...more events
│   │
│   └── authorGuard.js
│
├── system/
│   ├── cache.js
│   ├── fileChecker.js
│   ├── logger.js
│   └── watchdog.js
│
├── config.js
├── configCommands.js
├── index.js
├── package.json
├── .env
└── README.md
```

---

# 🚀 INSTALLATION GUIDE

## 1️⃣ Requirements

প্রথমে নিচের জিনিসগুলো ইনস্টল করুন:

- Node.js 20 অথবা তার নতুন Version
- npm
- Git
- একটি সচল WhatsApp Account
- Internet Connection

## 2️⃣ Clone Repository

Terminal অথবা Termux খুলে নিচের Command দিন:

```bash
git clone https://github.com/siyam-sys/siyam_whatsapp-botV5.git
```

তারপর Project Folder-এ প্রবেশ করুন:

```bash
cd siyam_whatsapp-botV5
```

## 3️⃣ Install Dependencies

```bash
npm install
```

ইনস্টল সম্পূর্ণ হওয়া পর্যন্ত অপেক্ষা করুন।

---

# 📱 IMPORTANT PHONE NUMBER SETUP

**এই অংশটি ভালো করে পড়ুন। ভুল নম্বর দিলে Pairing অথবা Permission-এ সমস্যা হতে পারে।**

এই Bot-এ দুটি প্রধান Phone Number ব্যবহার হয়।

<details>
<summary><b>📌 1. BOT_PHONE_NUMBER — Bot WhatsApp Number</b></summary>

এখানে সেই WhatsApp নম্বর বসাবেন, যেটি দিয়ে Bot চালু করবেন এবং Pairing Code নেবেন।

উদাহরণ:

```env
BOT_PHONE_NUMBER=88017XXXXXXXXX
```

বাংলাদেশি নম্বরের নিয়ম:

- Country Code হবে `880`
- নম্বরের শুরুতে `+` দেবেন না
- Country Code-এর পরে অতিরিক্ত `0` দেবেন না
- Space বা Dash ব্যবহার করবেন না

এটি আপনার Bot Account-এর নম্বর।

</details>

<details>
<summary><b>👑 2. OWNER_NUMBER — Main Owner Number</b></summary>

এখানে আপনার নিজের WhatsApp নম্বর বসাবেন।

```env
OWNER_NUMBER=88018XXXXXXXXX
```

এই নম্বরটি Main Owner হিসেবে কাজ করবে।

Owner-এর জন্য বিশেষ Permission রয়েছে। Owner Command Restriction-এর মধ্যে আটকে থাকবে না।

**মনে রাখবেন:** Bot Number এবং Owner Number একই হতে পারে, আবার আলাদাও হতে পারে।

</details>

<details>
<summary><b>🛡️ 3. BOT_ADMINS — Bot Admin Numbers</b></summary>

যাদের Bot Admin বানাতে চান, তাদের WhatsApp নম্বর এখানে দিতে পারবেন।

```env
BOT_ADMINS=88017XXXXXXXXX,88018XXXXXXXXX
```

একাধিক নম্বর হলে কমা `,` দিয়ে আলাদা করবেন।

Bot Admin-রা Bot Admin Permission পাবে।

</details>

<details>
<summary><b>👥 4. GROUP_ADMIN_IDS — Group Admin IDs</b></summary>

এই সেটিংসটি `config.js` ফাইলে রয়েছে।

```js
export const GROUP_ADMIN_IDS = [
  "REPLACE_WITH_GROUP_ADMIN_ID"
];
```

এখানে Group Admin-এর WhatsApp ID বসাবেন।

একাধিক Admin:

```js
export const GROUP_ADMIN_IDS = [
  "FIRST_ADMIN_WHATSAPP_ID",
  "SECOND_ADMIN_WHATSAPP_ID"
];
```

এটি Bot-এর Group Admin Permission-এর জন্য ব্যবহৃত হয়।

</details>

<details>
<summary><b>✅ 5. WHITELIST — Approved Users</b></summary>

যাদের Whitelist-এ রাখতে চান, তাদের নম্বর `.env`-এ লিখতে পারবেন।

```env
WHITELIST=88017XXXXXXXXX,88018XXXXXXXXX
```

Whitelist Mode চালু থাকলে অনুমোদিত User-রা Bot ব্যবহার করতে পারবে।

</details>

---

# ⚙️ ENVIRONMENT CONFIGURATION

Project-এর Root Folder-এ `.env` ফাইল তৈরি করুন।

ফাইলের নাম অবশ্যই:

```text
.env
```

নিচের Template কপি করে নিজের তথ্য বসান:

```env
# ==================================
# RJ-SIYAM WHATSAPP BOT V5
# ENVIRONMENT SETTINGS
# ==================================

# Bot WhatsApp Number
BOT_PHONE_NUMBER=88017XXXXXXXXX

# Main Owner WhatsApp Number
OWNER_NUMBER=88018XXXXXXXXX

# Additional Bot Admins
# Multiple numbers separated by comma
BOT_ADMINS=

# Whitelist Users
WHITELIST=

# Bot Command Mode
# all / adminOnly / whiteListMode / ownerOnly
MESSAGE_MODE=all

# Author Protection
AUTHOR_CHECK=false

# Log Level
LOG_LEVEL=info

# Optional Special Welcome Group ID
SPECIAL_WELCOME_GROUP=
```

### ⚠️ গুরুত্বপূর্ণ

- `BOT_PHONE_NUMBER` অবশ্যই দিতে হবে।
- `OWNER_NUMBER` নিজের নম্বর দিয়ে সেট করুন।
- `BOT_ADMINS` খালি রাখলে অতিরিক্ত Bot Admin থাকবে না।
- `WHITELIST` খালি রাখলে অতিরিক্ত Whitelist User থাকবে না।
- `MESSAGE_MODE=all` দিলে সাধারণ Mode-এ Bot ব্যবহার করা যাবে।
- `AUTHOR_CHECK` শুধু `true` অথবা `false` হবে।
- `SPECIAL_WELCOME_GROUP` ঐচ্ছিক।

**কখনো নিজের `.env` ফাইল অন্য কাউকে দেবেন না।**

---

# 🔧 CONFIG.JS SETTINGS

`config.js` ফাইলে কিছু Admin ID সরাসরি সেট করা যায়।

### Group Admin

```js
export const GROUP_ADMIN_IDS = [
  "REPLACE_WITH_GROUP_ADMIN_ID"
];
```

### Bot Admin

```js
export const BOT_ADMIN_IDS = [
  "REPLACE_WITH_BOT_ADMIN_ID"
];
```

### Whitelist

```js
export const WHITELIST_IDS = [
  "REPLACE_WITH_WHATSAPP_ID"
];
```

একাধিক ID দিতে চাইলে:

```js
export const WHITELIST_IDS = [
  "FIRST_USER_ID",
  "SECOND_USER_ID",
  "THIRD_USER_ID"
];
```

> `REPLACE_WITH_...` লেখাগুলো উদাহরণ মাত্র। নিজের সঠিক WhatsApp Number অথবা WhatsApp ID দিয়ে পরিবর্তন করবেন।

---

# 🔑 WHATSAPP PAIRING GUIDE

Bot চালু করার পর Terminal-এ Pairing Code আসবে।

### 📲 Pair করার নিয়ম

1. নিজের WhatsApp খুলুন।
2. উপরের তিন ডট মেনুতে যান।
3. **Linked Devices** নির্বাচন করুন।
4. **Link a Device** চাপুন।
5. **Link with phone number instead** নির্বাচন করুন।
6. Terminal-এর Pairing Code লিখুন।
7. কিছুক্ষণ অপেক্ষা করুন।

<details>
<summary><b>📸 Pairing-এর ধাপগুলো দেখুন</b></summary>

```text
WhatsApp
   ↓
Linked Devices
   ↓
Link a Device
   ↓
Link with phone number instead
   ↓
Enter Pairing Code
   ↓
Connected Successfully
```

</details>

---

# ▶️ START THE BOT

সব সেটিংস ঠিক করার পর চালু করুন:

```bash
npm start
```

Development Mode:

```bash
npm run dev
```

সফলভাবে চালু হলে Terminal-এ Connection Status দেখা যাবে।

---

# 🧩 HOW TO ADD NEW COMMAND

নতুন Command তৈরি করতে:

```text
scripts/cmds/
```

ফোল্ডারে একটি `.js` ফাইল তৈরি করুন।

উদাহরণ:

```text
scripts/cmds/hello.js
```

Command Module-এ প্রয়োজনীয় Config এবং `onStart` Function থাকতে হবে।

একটি Command-এর সাধারণ Structure:

```js
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

export default {
  config: {
    name: "hello",
    aliases: ["hi"],
    version: "1.0.0",
    author: "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦",
    role: 0,
    description: "Hello command",
    category: "general"
  },

  onStart: async function ({ reply }) {
    return reply("Hello! Bot is working.");
  }
};
```

**নোট:** `author` অবশ্যই `config.js`-এর `AUTHOR`-এর সঙ্গে মিলতে হবে। অন্যথায় Command Load হবে না।

---

# 📂 HOW TO ADD EVENTS

Event File রাখতে হবে:

```text
scripts/events/
```

এখানে `.js` Extension-এর Event Module রাখা হয়।

উদাহরণ:

```text
scripts/events/myEvent.js
```

Event Module-এর Config এবং প্রয়োজনীয় Handler Structure ঠিক রাখতে হবে।

---

# 💾 SESSION & DATABASE

Bot-এর গুরুত্বপূর্ণ Data সংরক্ষিত হয়:

```text
session/
```

এখানে WhatsApp Login Session থাকে।

```text
database/
```

এখানে User ও Group সম্পর্কিত Data সংরক্ষণ হয়।

**সতর্কতা:**

- `session/` Folder কাউকে দেবেন না।
- Session File Public করবেন না।
- Bot বন্ধ করে Session Delete করলে পুনরায় Pair করতে হতে পারে।
- Hosting পরিবর্তন করলে Session ও প্রয়োজনীয় Data Backup রাখুন।

---

# 🛠️ TROUBLESHOOTING

| সমস্যা | করণীয় |
|---|---|
| Pairing Code আসছে না | `BOT_PHONE_NUMBER` পরীক্ষা করুন |
| Invalid Phone Number | Country Code-সহ সঠিক নম্বর দিন |
| Owner Permission কাজ করছে না | `OWNER_NUMBER` পরীক্ষা করুন |
| Admin Permission কাজ করছে না | Admin ID পরীক্ষা করুন |
| Module Load হচ্ছে না | `author` এবং Command Structure পরীক্ষা করুন |
| Connection বন্ধ হচ্ছে | Internet ও Session পরীক্ষা করুন |
| npm Error | Node.js 20+ ব্যবহার করে `npm install` দিন |

### 🔄 Restart

```bash
npm start
```

---

# 🔐 SECURITY NOTICE

আপনার WhatsApp Account নিরাপদ রাখুন।

- `.env` Public করবেন না।
- `session/` Public করবেন না।
- Pairing Code কাউকে দেবেন না।
- Owner Number ও Admin ID প্রয়োজন ছাড়া শেয়ার করবেন না।
- অজানা কাউকে Bot Admin বানাবেন না।
- নিজের WhatsApp Account-এর নিরাপত্তা বজায় রাখুন।

এই Project Baileys-এর মতো Unofficial WhatsApp Connection Library ব্যবহার করে। WhatsApp-এর নীতিমালা ও Account Restrictions সম্পর্কে সচেতন থাকুন।

---

# 🎬 VIDEO TUTORIAL

<p align="center">
  <a href="https://youtu.be/vKzIu2iyg8I?feature=shared">
    <img src="https://img.youtube.com/vi/vKzIu2iyg8I/0.jpg" width="85%" alt="Setup Tutorial">
  </a>
</p>

<p align="center">
  <b>▶️ Click the Image to Watch Setup Tutorial</b>
</p>

---

# 👑 OWNER & DEVELOPER

<p align="center">
  <img src="https://img.shields.io/badge/OWNER-𝐒𝐈𝐘𝐀𝐌%20𝐇𝐀𝐒𝐒𝐀𝐍-blueviolet?style=for-the-badge">
</p>

<p align="center">
  <b>Developer: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦</b><br>
  <b>Project: RJ-SIYAM WHATSAPP BOT V5</b>
</p>

<p align="center">
  <a href="https://t.me/ri_siyam">
    <img src="https://img.shields.io/badge/TELEGRAM-OWNER-26A5E4?style=for-the-badge&logo=telegram&logoColor=white">
  </a>
  <a href="https://www.facebook.com/profile.php?id=61596102516084">
    <img src="https://img.shields.io/badge/FACEBOOK-OWNER-1877F2?style=for-the-badge&logo=facebook&logoColor=white">
  </a>
</p>

<p align="center">
  <a href="https://t.me/siyam_esb">
    <img src="https://img.shields.io/badge/TELEGRAM-PUBLIC%20GROUP-229ED9?style=for-the-badge&logo=telegram">
  </a>
  <a href="https://t.me/siyambothub">
    <img src="https://img.shields.io/badge/TELEGRAM-CHANNEL-0088CC?style=for-the-badge&logo=telegram">
  </a>
</p>

<p align="center">
  <a href="https://chat.whatsapp.com/IbxqvkgbySJ10XsL7geN8B?s=cl&p=a&iam=2">
    <img src="https://img.shields.io/badge/WHATSAPP-PUBLIC%20GROUP-25D366?style=for-the-badge&logo=whatsapp&logoColor=white">
  </a>
</p>

---

# ⭐ SUPPORT THE PROJECT

আপনার ভালো লাগলে Repository-তে একটি Star দিয়ে Support করুন।

<p align="center">
  <a href="https://github.com/siyam-sys/siyam_whatsapp-botV5">
    <img src="https://img.shields.io/badge/⭐%20STAR%20THIS%20REPOSITORY-yellow?style=for-the-badge">
  </a>
</p>

<p align="center">
  <b>THANK YOU FOR USING RJ-SIYAM WHATSAPP BOT V5 ❤️</b>
</p>

<p align="center">
  <i>Made with ❤️ by 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦</i>
</p>
