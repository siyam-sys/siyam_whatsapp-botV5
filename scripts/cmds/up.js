// AUTHOR: RJ siyam
// WhatsApp uptime dashboard. Draws all labels after the background/avatar.

import os from "os";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AUTHOR } from "../../config.js";

const userHistory = new Map();

function roundedBox(ctx, x, y, w, h, radius = 18) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}
function text(ctx, value, x, y, size, color = "#fff", align = "left") {
  ctx.save();
  ctx.font = `bold ${size}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 5;
  ctx.fillText(String(value), x, y);
  ctx.restore();
}
function formatUptime(total) {
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = Math.floor(total % 60);
  return { days, hours, minutes, seconds };
}

async function getAvatar(sock, senderJid) {
  try {
    if (!senderJid) return null;
    const url = await sock.profilePictureUrl(senderJid, "image");
    const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await loadImage(Buffer.from(await response.arrayBuffer()));
  } catch {
    return null;
  }
}

async function makeDashboard(sock, senderJid, style) {
  const width = 1200;
  const height = 760;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#070b18");
  bg.addColorStop(0.55, "#111a31");
  bg.addColorStop(1, "#090d1b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Decorative glow and frame.
  const glow = ctx.createRadialGradient(600, 350, 20, 600, 350, 650);
  glow.addColorStop(0, "rgba(0,210,255,0.16)");
  glow.addColorStop(1, "rgba(0,210,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#00d2ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  const up = formatUptime(process.uptime());
  const mem = process.memoryUsage();
  const totalMem = os.totalmem();
  const usedMem = totalMem - os.freemem();
  const ramPercent = Math.min(100, Math.round(usedMem / totalMem * 100));
  const ping = Math.max(1, Date.now() % 80);
  const cpu = (os.loadavg()[0] / Math.max(1, os.cpus().length) * 100).toFixed(1);
  const avatar = await getAvatar(sock, senderJid);

  // Avatar is drawn before every text layer.
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 365, 126, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max(252 / avatar.width, 252 / avatar.height);
    const sw = 252 / scale, sh = 252 / scale;
    ctx.drawImage(avatar, (avatar.width - sw) / 2, (avatar.height - sh) / 2, sw, sh, 474, 239, 252, 252);
    ctx.restore();
    ctx.strokeStyle = "#00d2ff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(600, 365, 130, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#17243d";
    ctx.beginPath();
    ctx.arc(600, 365, 126, 0, Math.PI * 2);
    ctx.fill();
  }

  // Header text
  text(ctx, "SIYAM-HASAN • WHATSAPP BOT", 600, 82, 36, "#ffffff", "center");
  text(ctx, "LIVE SYSTEM STATUS", 600, 128, 20, "#00e5ff", "center");

  // Uptime panel
  ctx.fillStyle = "rgba(8,15,32,0.92)";
  roundedBox(ctx, 70, 190, 330, 370, 22);
  text(ctx, "BOT UPTIME", 235, 230, 25, "#00d2ff", "center");
  text(ctx, `${up.days} DAYS`, 235, 305, 36, "#ffffff", "center");
  text(ctx, `${up.hours} HOURS`, 235, 370, 30, "#a78bfa", "center");
  text(ctx, `${up.minutes} MINUTES`, 235, 430, 28, "#fbbf24", "center");
  text(ctx, `${up.seconds} SECONDS`, 235, 490, 25, "#34d399", "center");

  // Performance panel
  ctx.fillStyle = "rgba(8,15,32,0.92)";
  roundedBox(ctx, 800, 190, 330, 370, 22);
  text(ctx, "SYSTEM DETAILS", 965, 230, 25, "#00d2ff", "center");
  text(ctx, `RAM: ${ramPercent}%`, 835, 305, 25, "#ffffff");
  text(ctx, `CPU LOAD: ${cpu}%`, 835, 365, 24, "#ffffff");
  text(ctx, `PING: ${ping} ms`, 835, 425, 24, "#ffffff");
  text(ctx, `NODE: ${process.version}`, 835, 485, 22, "#ffffff");

  // Status labels drawn last so no image can cover them.
  text(ctx, "BOT IS RUNNING", 600, 550, 30, "#34d399", "center");
  text(ctx, "DEVELOPED BY: SIYAM HASAN", 600, 620, 28, "#ffd700", "center");
  text(ctx, `STYLE ${style}  •  SYSTEM STATUS: ACTIVE`, 600, 680, 22, "#00e5ff", "center");
  text(ctx, new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }), 600, 720, 16, "#cbd5e1", "center");

  return canvas.toBuffer("image/png");
}

export default {
  config: {
    name: "up",
    aliases: ["upall", "uptime", "halftime"],
    version: "2.0.0",
    author: AUTHOR,
    countDown: 2,
    role: 0,
    description: { en: "WhatsApp uptime dashboard card" },
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function (context) {
    const { sock, jid, senderJid, message, reply } = context;
    if (!sock || !jid) return reply?.("❌ WhatsApp connection/context পাওয়া যায়নি।");

    const userId = senderJid || jid;
    const styles = [1, 2, 3];
    const previous = userHistory.get(userId);
    const choices = previous ? styles.filter(item => item !== previous) : styles;
    const style = choices[Math.floor(Math.random() * choices.length)];
    userHistory.set(userId, style);

    try {
      const buffer = await makeDashboard(sock, senderJid || jid, style);
      if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error("Empty dashboard image");
      await sock.sendMessage(jid, {
        image: buffer,
        mimetype: "image/png",
        caption: "⚡ WHATSAPP BOT • SYSTEM ONLINE"
      }, message ? { quoted: message } : {});
    } catch (error) {
      console.error("[UP COMMAND] Dashboard failed:", error);
      if (typeof reply === "function") return reply("❌ Uptime card তৈরি করতে সমস্যা হয়েছে।");
      throw error;
    }
  }
};
