
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// WhatsApp Baileys adaptation of Messenger AutoLink command.

import fs from "fs-extra";
import { createRequire } from "node:module";
import { AUTHOR } from "../../config.js";

const require = createRequire(import.meta.url);
const { downloadVideo } = require("sagor-video-downloader");

// 🔒 LOCK CONFIG
const COMMAND_NAME = "autolink";
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const config = Object.freeze({
  name: COMMAND_NAME,
  version: "1.3",
  author: AUTHOR,
  countDown: 5,
  role: 0,
  shortDescription: "Auto-download & send videos silently (no messages)",
  category: "media"
});

// 🔒 SECURITY CHECK
function isAuthorized() {
  return (
    config.author === AUTHOR &&
    config.name === COMMAND_NAME
  );
}

// WhatsApp Reaction
async function setReaction(sock, jid, message, reaction) {
  try {
    if (!message?.key?.id) return;

    await sock.sendMessage(jid, {
      react: {
        text: reaction,
        key: message.key
      }
    });
  } catch (error) {
    console.error("[AUTOLINK REACTION]", error.message);
  }
}

export default {
  config,

  // 🔒 SECURITY CHECK
  onStart: async function () {
    if (!isAuthorized()) {
      throw new Error("⛔ Unauthorized file modification detected!");
    }
  },

  // WhatsApp AutoLink Listener
  onChat: async function ({ sock, message, jid, body }) {
    // 🔒 EXTRA SECURITY CHECK
    if (!isAuthorized()) return;

    if (!sock || !message || !jid) return;

    const messageText = String(body || "");

    const linkMatches = messageText.match(/(https?:\/\/[^\s]+)/g);

    if (!linkMatches || linkMatches.length === 0) return;

    const uniqueLinks = [...new Set(linkMatches)];

    // Initial reaction
    await setReaction(sock, jid, message, "💋");

    let successCount = 0;
    let failCount = 0;

    for (const url of uniqueLinks) {
      let filePath = null;

      try {
        // Download video
        const result = await downloadVideo(url);

        const title = result?.title || "Video File";
        filePath = result?.filePath;

        if (
          !filePath ||
          !(await fs.pathExists(filePath))
        ) {
          throw new Error("Downloaded video file not found");
        }

        const stats = await fs.stat(filePath);

        if (!stats.isFile()) {
          throw new Error("Invalid video file");
        }

        const fileSizeInMB = stats.size / (1024 * 1024);

        // 25 MB limit
        if (stats.size > MAX_FILE_SIZE) {
          failCount++;
          continue;
        }

        // Read downloaded video
        const videoBuffer = await fs.readFile(filePath);

        // Send video to WhatsApp chat
        await sock.sendMessage(
          jid,
          {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption:
`📥 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃
━━━━━━━━━━━━━━━
🎬 𝐓𝐈𝐓𝐋𝐄 : ${title}
📦 𝐒𝐈𝐙𝐄 : ${fileSizeInMB.toFixed(2)} 𝐌𝐁
━━━━━━━━━━━━━━━
🦋 ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
          },
          { quoted: message }
        );

        successCount++;

      } catch (error) {
        failCount++;
        console.error(
          "[AUTOLINK DOWNLOAD]",
          error?.message || error
        );

      } finally {
        // Remove temporary downloaded file
        if (filePath) {
          try {
            if (await fs.pathExists(filePath)) {
              await fs.remove(filePath);
            }
          } catch (error) {
            console.error(
              "[AUTOLINK CLEANUP]",
              error.message
            );
          }
        }
      }
    }

    // Final reaction
    const finalReaction =
      successCount > 0 && failCount === 0 ? "✅" :
      successCount > 0 ? "⚠️" :
      "❌";

    await setReaction(sock, jid, message, finalReaction);
  }
};
