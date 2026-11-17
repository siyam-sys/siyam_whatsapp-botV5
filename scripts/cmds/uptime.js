
import canvas from "canvas";
import fs from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { AUTHOR } from "../../config.js";

const { createCanvas, registerFont } = canvas;

const LOCKED_AUTHOR = AUTHOR || "𝐑𝐉 𝐬𝐢𝐲𝐚𝐦";
let FONT_FAMILY = "sans-serif";

function setupFonts() {
    try {
        const regular = execFileSync(
            "fc-match",
            ["-f", "%{file}", "DejaVu Sans"],
            { encoding: "utf8" }
        ).trim();

        const bold = execFileSync(
            "fc-match",
            ["-f", "%{file}", "DejaVu Sans:style=Bold"],
            { encoding: "utf8" }
        ).trim();

        if (regular && fs.existsSync(regular)) {
            registerFont(regular, {
                family: "SiyamDashboard",
                weight: "normal"
            });

            if (bold && fs.existsSync(bold)) {
                registerFont(bold, {
                    family: "SiyamDashboard",
                    weight: "bold"
                });
            }

            FONT_FAMILY = '"SiyamDashboard"';
        }
    } catch (error) {
        console.error("Font loading warning:", error.message);
    }
}

setupFonts();

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawText(ctx, text, fontSize, color, x, y, align = "left", bold = true) {
    ctx.font = `${bold ? "bold" : "normal"} ${fontSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(text), x, y);
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return { days, hours, minutes, seconds: secs };
}

function generateStatusCard(data) {
    const {
        days,
        hours,
        minutes,
        seconds,
        usedRAM,
        totalHeap,
        usedMemGB,
        totalMemGB,
        heapPercent,
        memPercent,
        ping,
        cpuLoad,
        cpuCores,
        platform,
        arch,
        hostname,
        nodeVersion,
        pid
    } = data;

    const width = 980;
    const height = 640;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#05050c");
    bg.addColorStop(0.5, "#0b0b16");
    bg.addColorStop(1, "#070710");

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const light1 = ctx.createRadialGradient(490, 0, 20, 490, 90, 480);
    light1.addColorStop(0, "rgba(139,92,246,0.2)");
    light1.addColorStop(1, "rgba(139,92,246,0)");

    ctx.fillStyle = light1;
    ctx.fillRect(0, 0, width, height);

    const light2 = ctx.createRadialGradient(900, 600, 30, 850, 500, 280);
    light2.addColorStop(0, "rgba(34,211,238,0.14)");
    light2.addColorStop(1, "rgba(34,211,238,0)");

    ctx.fillStyle = light2;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.shadowColor = "rgba(139,92,246,0.35)";
    ctx.shadowBlur = 30;

    roundRect(ctx, 35, 35, 910, 570, 28);
    ctx.fillStyle = "rgba(12,12,24,0.96)";
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle = "rgba(167,139,250,0.4)";
    ctx.lineWidth = 2.5;

    roundRect(ctx, 35, 35, 910, 570, 28);
    ctx.stroke();

    const header = ctx.createLinearGradient(55, 55, 925, 55);
    header.addColorStop(0, "#7c3aed");
    header.addColorStop(1, "#06b6d4");

    ctx.fillStyle = header;
    roundRect(ctx, 55, 55, 870, 68, 16);
    ctx.fill();

    drawText(ctx, "SIYAM-HASAN  •  BOT STATUS", 30, "#ffffff", 490, 98, "center");

    ctx.fillStyle = "rgba(24,24,46,0.95)";
    roundRect(ctx, 60, 145, 860, 90, 14);
    ctx.fill();

    ctx.fillStyle = "#a78bfa";
    ctx.fillRect(60, 145, 860, 5);

    drawText(ctx, "BOT UPTIME", 16, "#c4b5fd", 490, 175, "center");
    drawText(
        ctx,
        `${days}d   ${hours}h   ${minutes}m   ${seconds}s`,
        34,
        "#ffffff",
        490,
        215,
        "center"
    );

    const boxes = [
        { title: "PING", value: `${ping} MS`, x: 60, color: "#34d399" },
        { title: "PROCESS RAM", value: `${usedRAM} MB`, x: 280, color: "#fbbf24" },
        { title: "CPU LOAD", value: cpuLoad, x: 500, color: "#22d3ee" },
        { title: "CPU CORES", value: cpuCores, x: 720, color: "#a78bfa" }
    ];

    boxes.forEach(box => {
        const y = 255;

        ctx.fillStyle = "rgba(24,24,46,0.95)";
        roundRect(ctx, box.x, y, 200, 85, 12);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = box.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, y, 200, 4);
        ctx.restore();

        drawText(ctx, box.title, 14, "#a5b4fc", box.x + 100, y + 32, "center");
        drawText(ctx, box.value, 22, "#ffffff", box.x + 100, y + 62, "center");
    });

    ctx.fillStyle = "rgba(24,24,46,0.95)";
    roundRect(ctx, 60, 360, 860, 100, 12);
    ctx.fill();

    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(60, 360, 860, 4);

    drawText(ctx, `Process RAM  ${heapPercent.toFixed(1)}%`, 15, "#a5b4fc", 85, 395);
    drawText(ctx, `System RAM  ${memPercent.toFixed(1)}%`, 15, "#a5b4fc", 500, 395);

    ctx.fillStyle = "rgba(50,50,80,1)";
    roundRect(ctx, 85, 410, 380, 14, 7);
    ctx.fill();

    roundRect(ctx, 500, 410, 380, 14, 7);
    ctx.fill();

    ctx.fillStyle = "#fbbf24";
    roundRect(ctx, 85, 410, Math.max(0, 380 * heapPercent / 100), 14, 7);
    ctx.fill();

    ctx.fillStyle = "#22d3ee";
    roundRect(ctx, 500, 410, Math.max(0, 380 * memPercent / 100), 14, 7);
    ctx.fill();

    drawText(ctx, `${usedRAM} / ${totalHeap} MB`, 13, "#94a3b8", 85, 445, "left", false);
    drawText(ctx, `${usedMemGB} / ${totalMemGB} GB`, 13, "#94a3b8", 500, 445, "left", false);

    ctx.fillStyle = "rgba(24,24,46,0.95)";
    roundRect(ctx, 60, 480, 860, 95, 12);
    ctx.fill();

    ctx.fillStyle = "#7c3aed";
    ctx.fillRect(60, 480, 860, 4);

    const specs = [
        ["Node.js", 85, 515],
        ["Platform", 85, 550],
        ["Architecture", 300, 515],
        ["Hostname", 300, 550],
        ["PID", 560, 515],
        ["Status", 560, 550]
    ];

    specs.forEach(([label, x, y]) => {
        drawText(ctx, label, 14, "#a5b4fc", x, y);
    });

    const values = [
        [nodeVersion, 170, 515],
        [platform, 170, 550],
        [arch, 420, 515],
        [hostname.substring(0, 14), 400, 550],
        [String(pid), 620, 515],
        ["ONLINE", 640, 550]
    ];

    values.forEach(([value, x, y]) => {
        drawText(ctx, value, 14, "#ffffff", x, y);
    });

    drawText(ctx, "SIYAM BOT", 15, "#c4b5fd", 890, 530, "right");
    drawText(ctx, "Premium Real-time Card", 12, "#7c3aed", 890, 555, "right", false);

    return canvas.toBuffer("image/png");
}

export default {
    config: {
        name: "uptime",
        aliases: ["up", "status", "আপ"],
        version: "6.6",
        author: LOCKED_AUTHOR,
        countDown: 5,
        role: 0,
        descriptions: "Advanced real-time system status card",
        category: "system",
        guide: "{pn}"
    },

    onStart: async function ({ sock, message, jid, reply }) {
        try {
            const started = Date.now();

            const uptime = process.uptime();
            const { days, hours, minutes, seconds } = formatUptime(uptime);

            const memory = process.memoryUsage();

            const usedRAM = (memory.heapUsed / 1048576).toFixed(1);
            const totalHeap = (memory.heapTotal / 1048576).toFixed(1);

            const totalMem = os.totalmem();
            const freeMem = os.freemem();

            const totalMemGB = (totalMem / 1073741824).toFixed(1);
            const usedMemGB = ((totalMem - freeMem) / 1073741824).toFixed(1);

            const heapPercent = memory.heapTotal > 0
                ? Math.min(100, (memory.heapUsed / memory.heapTotal) * 100)
                : 0;

            const memPercent = totalMem > 0
                ? Math.min(100, ((totalMem - freeMem) / totalMem) * 100)
                : 0;

            const ping = Date.now() - started;
            const cpuLoad = os.loadavg()[0].toFixed(2);
            const cpuCores = os.cpus().length;

            const platform = os.platform().toUpperCase();
            const arch = os.arch().toUpperCase();
            const hostname = os.hostname();
            const nodeVersion = process.version;
            const pid = process.pid;

            const imageBuffer = generateStatusCard({
                days,
                hours,
                minutes,
                seconds,
                usedRAM,
                totalHeap,
                usedMemGB,
                totalMemGB,
                heapPercent,
                memPercent,
                ping,
                cpuLoad,
                cpuCores,
                platform,
                arch,
                hostname,
                nodeVersion,
                pid
            });

            const captionText =
`╭❮ 𝗦𝗜𝗬𝗔𝗠•𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 ❯╮
┃
┣ ⏱️ 𝗨𝗣𝗧𝗜𝗠𝗘: ${days}𝗗 ${hours}𝗛 ${minutes}𝗠 ${seconds}𝗦
┣ ⚡ 𝗣𝗜𝗡𝗚: ${ping} 𝗠𝗦
┣ 🧠 𝗣𝗥𝗢𝗖𝗘𝗦𝗦
┣ 🎀 𝗥𝗔𝗠: ${usedRAM} / ${totalHeap} 𝗠𝗕
┣ 💻 𝗖𝗣𝗨 𝗟𝗢𝗔𝗗: ${cpuLoad}
┣ 🔐 (${cpuCores} 𝗖𝗢𝗥𝗘𝗦)
┣ 📊 𝗦𝗬𝗦𝗧𝗘𝗠 𝗥𝗔𝗠:
┣ 😘 ${usedMemGB} / ${totalMemGB} 𝗚𝗕
┃
┣ ⚙️ 𝗡𝗢𝗗𝗘.𝗝𝗦: ${nodeVersion}
┣ 🖥️ 𝗣𝗟𝗔𝗧𝗙𝗢𝗥𝗠: ${platform} (${arch})
┃
┣ 👑 𝗢𝗪𝗡𝗘𝗥: 𝗦𝗜𝗬𝗔𝗠 𝗛𝗔𝗦𝗔𝗡
┣ 🤖 𝗕𝗢𝗧: 𝗦𝗜𝗬𝗔𝗠 𝗕𝗢𝗧
╰━═━═━═━═━═━═━═━═━╯`;

            await sock.sendMessage(
                jid,
                {
                    image: imageBuffer,
                    mimetype: "image/png",
                    caption: captionText
                },
                { quoted: message }
            );

        } catch (error) {
            console.error("Uptime Error:", error);

            if (typeof reply === "function") {
                return reply("❌ আপটাইম কার্ড তৈরি করতে সমস্যা হয়েছে!");
            }

            return sock.sendMessage(
                jid,
                { text: "❌ আপটাইম কার্ড তৈরি করতে সমস্যা হয়েছে!" },
                { quoted: message }
            );
        }
    }
};
