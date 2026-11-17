// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import fs from "fs-extra";
import path from "path";
import { CONFIG, AUTHOR, isOwner } from "../../config.js";

const FILE = path.resolve("./database/whitelist.json");
async function readList() {
  await fs.ensureDir(path.dirname(FILE));
  if (!await fs.pathExists(FILE)) await fs.writeJson(FILE,{enabled:false,ids:[...CONFIG.WHITELIST]},{spaces:2});
  const data=await fs.readJson(FILE);
  if (!Array.isArray(data.ids)) data.ids=[];
  return data;
}
async function save(data) { await fs.writeJson(FILE,data,{spaces:2}); }
const footer="───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧";
const digits=jid=>String(jid||"").split("@")[0].split(":")[0].replace(/\D/g,"");
export default {
  config:{
    name:"wl",version:"2.0-wa",author:AUTHOR,countDown:5,role:"OWNER",
    category:"owner",description:"Manage whitelist entries and mode",
    guide:"{pn} add <number> | remove <number> | list | on | off"
  },
  onStart:async ({args,senderJid,reply})=>{
    if(!isOwner(senderJid)) return reply("❌ শুধু Bot Owner এই কমান্ড ব্যবহার করতে পারবে।");
    const action=(args[0]||"").toLowerCase();
    const data=await readList();
    const numbers=args.slice(1).map(digits).filter(Boolean);
    if(action==="add"||action==="-a"){
      if(!numbers.length) return reply("» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝐆𝐢𝐯𝐞 𝐍𝐮𝐦𝐛𝐞𝐫!\n"+footer);
      const added=[];
      for(const n of numbers) if(!data.ids.includes(n)){data.ids.push(n);added.push(n);}
      await save(data);
      return reply(`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝐀𝐝𝐝𝐞𝐝:\n${added.join("\n")||"Already exists"}\n${footer}`);
    }
    if(action==="remove"||action==="-r"){
      if(!numbers.length) return reply("» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝐆𝐢𝐯𝐞 𝐍𝐮𝐦𝐛𝐞𝐫!\n"+footer);
      data.ids=data.ids.filter(n=>!numbers.includes(n)); await save(data);
      return reply(`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝:\n${numbers.join("\n")}\n${footer}`);
    }
    if(action==="list"||action==="-l") return reply(`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» 👑 𝐖𝐡𝐢𝐭𝐞𝐋𝐢𝐬𝐭 𝐔𝐬𝐞𝐫𝐬:\n${data.ids.map(n=>"• "+n).join("\n")||"Empty"}\n${footer}`);
    if(action==="on"||action==="off"){
      data.enabled=action==="on"; await save(data);
      const now=new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Dhaka"}));
      const date=now.toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
      const time=now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
      return reply(`👑  𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍  👑\n\n𝆠፝𝐖𝐇𝐈𝐓𝐄 𝐋𝐈𝐒𝐓 𝐌𝐎𝐃𝐄 ${data.enabled?"𝐄𝐍𝐀𝐁𝐋𝐄𝐃":"𝐃𝐈𝐒𝐀𝐁𝐋𝐄𝐃"}\n\n🔐  𝆠፝𝐀𝐂𝐂𝐄𝐒𝐒 :\n   ${data.enabled?"শুধু তালিকাভুক্ত ব্যবহারকারী":"এখন সবাই বট ব্যবহার করতে পারবে"}\n\n📅  𝆠፝𝐃𝐚𝐭𝐞 : ${date}\n⏰  𝆠፝𝐓𝐢𝐦𝐞 : ${time}\n\n👑  𝆠፝𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓  👑`);
    }
    return reply("Usage: /wl add number | remove number | list | on | off");
  }
};
