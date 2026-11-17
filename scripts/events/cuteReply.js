// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import { AUTHOR } from "../../config.js";

const USER_COOLDOWN=3*60*1000;
const lastReplyUser=new Map();
const TRIGGERS=[
  {
    words:["siyam","সিয়াম","@rj siyam","হৃদয়","@পি্ঁচ্চি্ঁ রি্ঁদ্ঁয়্ঁ ত্যা্ঁহ্ঁ"],
    text:`OWNER 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
───────────────
» 🌷 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗗𝗘𝗔𝗥
» 🤲 আসসালামু আলাইকুম
» 👑 সিয়াম বস এখন
» 🦉 ব্যস্ত আছেন
» 💌 আপনার মেসেজ
» 🖥️ ইনবক্সে দিয়ে রাখুন
» ⚡ বস ফ্রি হলে উত্তর পাবেন
» 🤍 ধৈর্য ধরার জন্য ধন্যবাদ
───────────────
» 👤 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
» 📞 +8801608-279461
» 🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: https://www.facebook.com/profile.php?id=61594826054131`,
    images:["https://i.imgur.com/XDj7Lg3.jpeg","https://i.imgur.com/vPTaRaf.jpeg","https://i.imgur.com/maHcZQB.jpeg","https://i.imgur.com/pWNb6lR.jpeg"]
  },
  {
    words:["নিঝুম","@বট","@নি্ঁঝু্ঁম্ঁ রা্ঁতে্ঁর্ঁ প্ঁরী্ঁ"],
    text:`🔰💠𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧💠🔱
───────────────
» 🌷 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗗𝗘𝗔𝗥
» 😹 আমাকে মেনশন দিয়ে লাভ নাই
» 🤖 আমি একটি WhatsApp Bot
» 💌 শুধুমাত্র বিনোদনের জন্য তৈরি
» ⚡ চাইলে আপনিও নিজের গ্রুপে
» 🤖 নিতে পারেন
» 🤍 ধন্যবাদ !
───────────────
» 👑 𝗢𝗪𝗡𝗘𝗥: 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍

» 📞 𝗖𝗢𝗡𝗧𝗔𝗖𝗧: +8801608279461
» 🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: https://www.facebook.com/profile.php?id=61594826054131`,
    images:["https://i.imgur.com/rkrXNso.jpeg","https://i.imgur.com/wyNCOKV.gif"]
  }
];

export default {
  config:{name:"cuteReply",event:"messages.upsert",version:"3.2.0-wa",author:AUTHOR,description:"Exact-trigger automatic reply with random image and per-user cooldown"},
  onStart:async ({sock,data})=>{
    if(data?.type!=="notify") return;
    for(const msg of data.messages||[]){
      if(!msg?.message||msg.key?.fromMe) continue;
      const jid=msg.key?.remoteJid;
      if(!jid||jid==="status@broadcast") continue;
      const content=msg.message;
      const body=(content.conversation||content.extendedTextMessage?.text||content.imageMessage?.caption||content.videoMessage?.caption||"").toLowerCase().trim();
      if(!body) continue;
      const sender=msg.key.participant||jid;
      const now=Date.now();
      if(lastReplyUser.has(sender)&&now-lastReplyUser.get(sender)<USER_COOLDOWN) continue;
      const matched=TRIGGERS.find(item=>item.words.some(word=>body===word.toLowerCase().trim()));
      if(!matched) continue;
      lastReplyUser.set(sender,now);
      try{
        const imageUrl=matched.images[Math.floor(Math.random()*matched.images.length)];
        const response=await fetch(imageUrl);
        if(!response.ok) throw new Error(`Image HTTP ${response.status}`);
        const buffer=Buffer.from(await response.arrayBuffer());
        await sock.sendMessage(jid,{image:buffer,caption:matched.text},{quoted:msg});
      }catch(error){
        console.error("[CUTE REPLY]",error.message);
        await sock.sendMessage(jid,{text:matched.text},{quoted:msg}).catch(()=>{});
      }
    }
  }
};
