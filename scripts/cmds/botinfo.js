// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { CONFIG, AUTHOR } from "../../config.js";
import { getCommands } from "../../core/commandHandler.js";

const execFileAsync = promisify(execFile);
const bold = value => String(value ?? "").replace(/[A-Za-z0-9]/g, c => {
  const n = c.charCodeAt(0);
  return String.fromCodePoint(n >= 65 && n <= 90 ? 0x1D400+n-65 :
    n >= 97 && n <= 122 ? 0x1D41A+n-97 : 0x1D7CE+n-48);
});
const bytes = n => {
  const units=["B","KB","MB","GB","TB"]; let i=0;
  while(n>=1024 && i<units.length-1){n/=1024;i++;}
  return `${n.toFixed(2)} ${units[i]}`;
};
const duration = sec => {
  const d=Math.floor(sec/86400), h=Math.floor(sec%86400/3600),
    m=Math.floor(sec%3600/60), s=Math.floor(sec%60);
  return `${d}D ${h}H ${m}M ${s}S`;
};

export default {
  config: {
    name: "botinfo",
    aliases: ["botinf", "infobot", "binfo"],
    version: "2.0-wa",
    author: AUTHOR,
    countDown: 5,
    role: "USER",
    category: "info",
    description: "Get bot and system information",
    guide: "{pn}"
  },

  onStart: async ({ sock, jid, isGroup, reply }) => {
    try {
      const start=Date.now();
      let groupName="Private Chat";
      if (isGroup) {
        try { groupName=(await sock.groupMetadata(jid)).subject || jid; }
        catch { groupName=jid; }
      }
      const ping=Date.now()-start;
      const now=new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Dhaka"}));
      const date=now.toLocaleDateString("en-US",{month:"long",day:"2-digit",year:"numeric"});
      const time=now.toLocaleTimeString("en-US");
      let disk="N/A";
      try {
        const {stdout}=await execFileAsync("df",["-k","/"]);
        const p=stdout.trim().split("\n")[1].trim().split(/\s+/);
        disk=`${bytes(Number(p[2])*1024)} / ${bytes(Number(p[1])*1024)}`;
      } catch {}
      const cpus=os.cpus();
      const text=`
━━━━━━━━━━━━━━━━
𝐁𝐎𝐓 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
━━━━━━━━━━━━━━━━

☂ | 𝐁𝐎𝐓 𝐍𝐀𝐌𝐄:
☂ | ${bold(CONFIG.BOT_NAME)}
☂ | 𝐁𝐎𝐓 𝐏𝐑𝐄𝐅𝐈𝐗: ${bold(CONFIG.PREFIX)}
☂ | 𝐁𝐎𝐓 𝐏𝐈𝐍𝐆: ${bold(ping)}𝐦𝐬
☂ | 𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄: ${bold(duration(process.uptime()))}
☂ | 𝐓𝐎𝐓𝐀𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒:
☂ | 👏 ${bold(getCommands().size)} 👈
☂ | 𝐆𝐑𝐎𝐔𝐏 𝐍𝐀𝐌𝐄:
☂ | ${bold(groupName)}

━━━━━━━━━━━━━━━━━
𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
━━━━━━━━━━━━━━━━━━

☂ | 𝐎𝐒: ${bold(`${os.type()} ${os.release()}`)}
☂ | 𝐀𝐑𝐂𝐇: ${bold(os.arch())}
☂ | 𝐂𝐏𝐔: ${bold(`${cpus[0]?.model || "Unknown"} (${cpus.length} cores)`)}
☂ | 𝐓𝐈𝐌𝐄: ${bold(time)}
☂ | 𝐃𝐀𝐓𝐄: ${bold(date)}
☂ | 𝐒𝐄𝐑𝐕𝐄𝐑 𝐔𝐏𝐓𝐈𝐌𝐄: ${bold(duration(os.uptime()))}
☂ | 𝐑𝐀𝐌 𝐔𝐒𝐀𝐆𝐄: ${bold(bytes(os.totalmem()-os.freemem()))}
☂ | 𝐓𝐎𝐓𝐀𝐋 𝐑𝐀𝐌: ${bold(bytes(os.totalmem()))}
☂ | 𝐃𝐈𝐒𝐊 𝐔𝐒𝐄𝐃 / 𝐓𝐎𝐓𝐀𝐋: ${bold(disk)}

━━━━━━━━━━━━━━━━━━
👑 | 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑
 👑 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
━━━━━━━━━━━━━━━━━━`;
      await reply(bold(text));
    } catch (error) {
      console.error("[BOTINFO]",error);
      await reply(`❌ Error:\n${error.message}`);
    }
  }
};
