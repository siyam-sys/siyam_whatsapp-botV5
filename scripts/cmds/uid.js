import { createCanvas, loadImage } from "@napi-rs/canvas";

const LOCKED_AUTHOR_1 = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const userLastSelection = new Map();

function cleanText(text) {
    if (!text) return "";
    return String(text)
        .normalize("NFKC")
        .replace(/[^\x20-\x7E\u0980-\u09FF]/g, "")
        .trim();
}

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

function drawPolygon(ctx, x, y, radius, sides) {
    ctx.beginPath();

    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }

    ctx.closePath();
}

function getQuotedParticipant(message) {
    const contextInfo =
        message?.message?.extendedTextMessage?.contextInfo ||
        message?.message?.imageMessage?.contextInfo ||
        message?.message?.videoMessage?.contextInfo ||
        message?.message?.documentMessage?.contextInfo;

    return contextInfo?.participant || null;
}

function getTargetJid(message, jid) {
    const quotedParticipant = getQuotedParticipant(message);

    if (quotedParticipant) return quotedParticipant;

    if (message?.key?.participant) {
        return message.key.participant;
    }

    const remoteJid = message?.key?.remoteJid || jid;

    if (remoteJid && !remoteJid.endsWith("@g.us")) {
        return remoteJid;
    }

    return message?.sender || message?.senderJid || null;
}

function getUserName(message, targetJid, isQuoted) {
    if (!isQuoted && message?.pushName) {
        return message.pushName;
    }

    return targetJid?.split("@")[0] || "WhatsApp User";
}

async function getAvatar(sock, targetJid) {
    try {
        if (typeof sock.profilePictureUrl !== "function") {
            return null;
        }

        const avatarUrl = await sock.profilePictureUrl(targetJid, "image");
        if (!avatarUrl) return null;

        const response = await fetch(avatarUrl);
        if (!response.ok) return null;

        const buffer = Buffer.from(await response.arrayBuffer());
        return await loadImage(buffer);
    } catch {
        return null;
    }
}

function drawDesign1(targetID, targetName, avatar) {
    const width = 850;
    const height = 420;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#020204";
    ctx.fillRect(0, 0, width, height);

    const orbCyan = ctx.createRadialGradient(180, 100, 10, 180, 100, 320);
    orbCyan.addColorStop(0, "rgba(0,245,212,0.25)");
    orbCyan.addColorStop(0.5, "rgba(0,245,212,0.08)");
    orbCyan.addColorStop(1, "transparent");

    ctx.fillStyle = orbCyan;
    ctx.fillRect(0, 0, width, height);

    const orbMagenta = ctx.createRadialGradient(720, 320, 10, 720, 320, 350);
    orbMagenta.addColorStop(0, "rgba(255,0,127,0.22)");
    orbMagenta.addColorStop(0.5, "rgba(255,0,127,0.07)");
    orbMagenta.addColorStop(1, "transparent");

    ctx.fillStyle = orbMagenta;
    ctx.fillRect(0, 0, width, height);

    roundRect(ctx, 25, 25, width - 50, height - 50, 22);
    ctx.fillStyle = "rgba(8,10,18,0.92)";
    ctx.fill();

    ctx.save();
    ctx.shadowColor = "#00f5d4";
    ctx.shadowBlur = 18;
    ctx.strokeStyle = "#00f5d4";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const hexX = 160;
    const hexY = 210;
    const hexRadius = 110;

    drawPolygon(ctx, hexX, hexY, hexRadius + 8, 6);

    const hexGrad = ctx.createLinearGradient(
        hexX - hexRadius,
        hexY - hexRadius,
        hexX + hexRadius,
        hexY + hexRadius
    );

    hexGrad.addColorStop(0, "#00f5d4");
    hexGrad.addColorStop(0.5, "#7000ff");
    hexGrad.addColorStop(1, "#ff007f");

    ctx.strokeStyle = hexGrad;
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.save();
    drawPolygon(ctx, hexX, hexY, hexRadius, 6);
    ctx.clip();

    if (avatar) {
        ctx.drawImage(
            avatar,
            hexX - hexRadius,
            hexY - hexRadius,
            hexRadius * 2,
            hexRadius * 2
        );
    } else {
        ctx.fillStyle = "#12182e";
        ctx.fillRect(
            hexX - hexRadius,
            hexY - hexRadius,
            hexRadius * 2,
            hexRadius * 2
        );

        ctx.fillStyle = "#00f5d4";
        ctx.font = "bold 70px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
            cleanText(targetName).charAt(0).toUpperCase() || "U",
            hexX,
            hexY + 24
        );
    }

    ctx.restore();

    const contentX = 330;
    const displayName = cleanText(targetName).toUpperCase();

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#8e9bbd";
    ctx.fillText("USER NAME", contentX, 85);

    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(displayName.slice(0, 24), contentX, 125);

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#8e9bbd";
    ctx.fillText("WHATSAPP ID", contentX, 190);

    ctx.font = "bold 29px sans-serif";
    ctx.fillStyle = "#00f5d4";
    ctx.fillText(targetID.slice(0, 22), contentX, 232);

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#8e9bbd";
    ctx.fillText("SYSTEM OWNER", contentX, 295);

    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#ffee32";
    ctx.fillText("SIYAM HASAN", contentX, 335);

    return canvas.toBuffer("image/png");
}

function drawDesign2(targetID, targetName, avatar) {
    const width = 820;
    const height = 480;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#1c0a16");
    bg.addColorStop(1, "#1a0b1c");

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    roundRect(ctx, 20, 20, 780, 440, 26);
    ctx.fillStyle = "rgba(25,12,32,0.9)";
    ctx.fill();

    ctx.strokeStyle = "rgba(251,113,133,0.6)";
    ctx.lineWidth = 3;

    roundRect(ctx, 20, 20, 780, 440, 26);
    ctx.stroke();

    const headerGrad = ctx.createLinearGradient(45, 40, 775, 40);
    headerGrad.addColorStop(0, "#fb7185");
    headerGrad.addColorStop(1, "#c084fc");

    ctx.fillStyle = headerGrad;
    roundRect(ctx, 45, 40, 730, 52, 14);
    ctx.fill();

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("WHATSAPP UID CARD", 410, 76);

    const avatarSize = 175;
    const avatarX = 70;
    const avatarY = 120;

    ctx.save();
    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();

    if (avatar) {
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    } else {
        ctx.fillStyle = "#4a1d3a";
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);

        ctx.font = "bold 42px Arial";
        ctx.fillStyle = "#f9a8d4";
        ctx.textAlign = "center";
        ctx.fillText(
            cleanText(targetName).charAt(0).toUpperCase() || "?",
            avatarX + avatarSize / 2,
            avatarY + avatarSize / 2 + 16
        );
    }

    ctx.restore();

    ctx.fillStyle = "rgba(45,20,50,0.85)";
    roundRect(ctx, 290, 115, 480, 100, 16);
    ctx.fill();

    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#f9a8d4";
    ctx.textAlign = "left";
    ctx.fillText("USER NAME", 320, 150);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#ffffff";

    const displayName = targetName.length > 20
        ? targetName.slice(0, 20) + "..."
        : targetName;

    ctx.fillText(displayName, 320, 195);

    ctx.fillStyle = "rgba(45,20,50,0.85)";
    roundRect(ctx, 290, 235, 480, 100, 16);
    ctx.fill();

    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#e9d5ff";
    ctx.fillText("WHATSAPP ID", 320, 270);

    ctx.font = "bold 27px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(targetID.slice(0, 22), 320, 315);

    ctx.fillStyle = "rgba(50,20,55,0.9)";
    roundRect(ctx, 50, 360, 720, 70, 16);
    ctx.fill();

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Owner : Siyam Hasan", 410, 405);

    return canvas.toBuffer("image/png");
}

function makeCaption(targetName, targetID) {
    return `╭━❮ 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗜𝗡𝗙𝗢 ❯━╮
┃
┣ 👤 𝗡𝗔𝗠𝗘: ${targetName}
┣ 🆔 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗜𝗗: ${targetID}
┃
┣ 📋 𝗖𝗢𝗣𝗬 𝗜𝗗: ${targetID}
┃
┣ 👑 𝗢𝗪𝗡𝗘𝗥: 𝗦𝗜𝗬𝗔𝗠 𝗛𝗔𝗦𝗔𝗡
┣ 🤖 𝗕𝗢𝗧: 𝗦𝗜𝗬𝗔𝗠 𝗕𝗢𝗧
╰━═━═━═━═━═━═━═━═━╯`;
}

export default {
    config: {
        name: "uid",
        aliases: ["uid2", "ইউআইডি", "useid"],
        version: "8.0",
        author: LOCKED_AUTHOR_1,
        countDown: 5,
        role: 0,
        description: "Get WhatsApp user ID card with two unique designs",
        category: "user",
        guide: "{pn}"
    },

    onStart: async function ({ sock, message, jid, reply }) {
        try {
            const targetJid = getTargetJid(message, jid);

            if (!targetJid) {
                return reply("❌ WhatsApp user ID পাওয়া যায়নি।");
            }

            const targetID = targetJid.split("@")[0];

            const isQuoted = Boolean(getQuotedParticipant(message));
            const targetName = getUserName(message, targetJid, isQuoted);

            const avatar = await getAvatar(sock, targetJid);

            const userKey = targetJid;
            const lastDesign = userLastSelection.get(userKey);

            const availableDesigns = [1, 2];
            const eligibleDesigns = lastDesign
                ? availableDesigns.filter(d => d !== lastDesign)
                : availableDesigns;

            const selectedDesign = eligibleDesigns[
                Math.floor(Math.random() * eligibleDesigns.length)
            ];

            userLastSelection.set(userKey, selectedDesign);

            const imageBuffer = selectedDesign === 1
                ? drawDesign1(targetID, targetName, avatar)
                : drawDesign2(targetID, targetName, avatar);

            const caption = makeCaption(targetName, targetID);

            await sock.sendMessage(
                jid,
                {
                    image: imageBuffer,
                    mimetype: "image/png",
                    caption
                },
                { quoted: message }
            );

        } catch (error) {
            console.error("WhatsApp UID Error:", error);

            if (typeof reply === "function") {
                return reply("❌ UID Card তৈরি করতে সমস্যা হয়েছে!");
            }

            await sock.sendMessage(
                jid,
                { text: "❌ UID Card তৈরি করতে সমস্যা হয়েছে!" },
                { quoted: message }
            );
        }
    }
};
