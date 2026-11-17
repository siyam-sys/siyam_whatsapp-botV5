
import { AUTHOR } from "../../config.js";

const listReplies = new Map();
const bridgeReplies = new Map();

const FOOTER = "» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧";

function getContextInfo(message) {
  const msg = message?.message || {};

  return (
    msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    msg.documentMessage?.contextInfo ||
    msg.audioMessage?.contextInfo ||
    msg.stickerMessage?.contextInfo ||
    {}
  );
}

function getMessageContent(message) {
  const msg = message?.message || {};

  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    msg.documentMessage?.caption ||
    msg.buttonsResponseMessage?.selectedDisplayText ||
    msg.listResponseMessage?.title ||
    ""
  ).trim();
}

function getGroupName(metadata, jid) {
  return metadata?.subject || jid.split("@")[0];
}

async function forwardMedia(sock, targetJid, message) {
  if (!message?.message || typeof sock.copyNForward !== "function") {
    return null;
  }

  const msg = message.message;

  const media =
    msg.imageMessage ||
    msg.videoMessage ||
    msg.audioMessage ||
    msg.documentMessage ||
    msg.stickerMessage;

  if (!media) return null;

  try {
    return await sock.copyNForward(targetJid, message, true);
  } catch (error) {
    console.error("[BRIDGE] Media forward error:", error);
    return null;
  }
}

async function sendBridgeMessage({
  sock,
  targetJid,
  sourceJid,
  sourceMessage,
  senderName,
  text,
  backToMessageId
}) {
  const content =
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 📩 𝐑𝐄𝐏𝐋𝐘 𝐅𝐑𝐎𝗠 : ${senderName}
» 💬 ${text || "Sent an attachment / একটি ফাইল পাঠিয়েছেন"}
───────────────
» 🔄 এই মেসেজের রিপ্লাই দিন
${FOOTER}`;

  const sent = await sock.sendMessage(targetJid, {
    text: content
  });

  if (sent?.key?.id) {
    bridgeReplies.set(sent.key.id, {
      otherJid: sourceJid,
      otherMessageId: backToMessageId || sourceMessage?.key?.id || null,
      sourceMessageId: sent.key.id
    });
  }

  // মিডিয়া থাকলে আলাদাভাবে ফরওয়ার্ড
  await forwardMedia(sock, targetJid, sourceMessage);

  return sent;
}

export default {
  config: {
    name: "bridge",
    aliases: ["রিপ্লাই", "কল"],
    version: "24.0.0",
    author: AUTHOR,
    role: 0,
    category: "Communication",
    description: "গ্রুপ চ্যাট ব্রিজ এবং কানেকশন সিস্টেম"
  },

  onStart: async function ({ sock, args, jid, message, reply }) {
    if (args[0]?.toLowerCase() !== "list") {
      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ⚠️ 𝐔𝐒𝐄 𝐛𝐫𝐢𝐝𝐠𝐞 𝐥𝐢𝐬𝐭 𝐓𝐎
» ↪️ 𝐒𝐄𝐄 𝐀𝐂𝐓𝐈𝗩𝐄 𝐆𝐑𝐎𝐔𝐏𝐒!
» 💡 গ্রুপ তালিকা দেখতে
» 🧑‍💻 কমান্ড ব্যবহার করুন।
───────────────
${FOOTER}`
      );
    }

    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupData = Object.entries(groups)
        .filter(([groupJid]) => groupJid !== jid)
        .map(([groupJid, metadata], index) => ({
          index: index + 1,
          jid: groupJid,
          name: getGroupName(metadata, groupJid)
        }));

      if (!groupData.length) {
        return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐍𝐎 𝐀𝐂𝐓𝗜𝐕𝐄
» 🚼 𝐆𝐑𝐎𝐔𝐏𝐒 𝐅𝐎𝐔𝐍𝐃!
» ⚠️ কোনো গ্রুপ পাওয়া যায়নি।
───────────────
${FOOTER}`
        );
      }

      let msg =
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🏢 𝐀𝐂𝐓𝗜𝐕𝐄 𝐆𝐑𝐎𝐔𝐏𝐒 𝐋𝐈𝐒𝐓
`;

      for (const group of groupData) {
        msg += `» ${group.index}. 🏷️ ${group.name}\n`;
      }

      msg +=
`───────────────
» 💡 𝐑𝐄𝐏𝐋𝐘 𝐖𝐈𝐓𝐇
» 🥁 [𝐍𝐮𝐦𝐛𝐞𝐫] [𝐌𝐞𝐬𝐬𝐚𝐠𝐞]
» 🧞‍♂️ 𝐓𝐎 𝐂𝐎𝐍𝐍𝐄𝐂𝐓
───────────────
${FOOTER}`;

      const sent = await sock.sendMessage(jid, {
        text: msg
      }, {
        quoted: message
      });

      if (sent?.key?.id) {
        listReplies.set(sent.key.id, {
          sourceJid: jid,
          groups: groupData
        });
      }

    } catch (error) {
      console.error("[BRIDGE] Group list error:", error);

      return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐋𝐎𝐀𝐃
» 😅 𝐆𝐑𝐎𝐔𝐏𝐒!
» ⚠️ গ্রুপ তালিকা লোড
» 🧘 করতে ব্যর্থ হয়েছে।
───────────────
${FOOTER}`
      );
    }
  },

  onChat: async function ({
    sock,
    message,
    jid,
    senderJid,
    pushName,
    body,
    reply
  }) {
    try {
      const context = getContextInfo(message);
      const quotedId = context.stanzaId;

      if (!quotedId || !jid || !message?.key?.id) return;

      // ১. গ্রুপ তালিকার Reply
      const listData = listReplies.get(quotedId);

      if (listData && listData.sourceJid === jid) {
        const input = (body || "").trim();
        const match = input.match(/^(\d+)\s+([\s\S]+)$/);

        if (!match) {
          return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ⚠️ 𝐏𝐋𝐄𝐀𝐒𝐄 𝐄𝐍𝐓𝐄𝐑
» 🎁 𝐀 𝐌𝐄𝐒𝐒𝐀𝐆𝐄!
» ✍️ দয়া করে নাম্বারের পর
» 🥰 আপনার মেসেজটি লিখুন।
» 😪 যেমন: 1 সিয়াম ভাই বট কই
───────────────
${FOOTER}`
          );
        }

        const serial = Number(match[1]);
        const content = match[2].trim();

        const targetGroup = listData.groups.find(
          group => group.index === serial
        );

        if (!targetGroup) {
          return reply("❌ ভুল গ্রুপ নম্বর দিয়েছেন। আবার bridge list দিন।");
        }

        const sent = await sendBridgeMessage({
          sock,
          targetJid: targetGroup.jid,
          sourceJid: jid,
          sourceMessage: message,
          senderName: pushName || senderJid.split("@")[0],
          text: content,
          backToMessageId: message.key.id
        });

        if (!sent) {
          return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐌𝐄𝐒𝐒𝐀𝐆𝐄 𝐅𝐀𝐈𝐋𝐄𝐃!
» ⚠️ বট এই গ্রুপে নেই
» 🧞‍♂️ মেসেজ পাঠানো যায়নি।
───────────────
${FOOTER}`
          );
        }

        return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ✅ 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃
» 🫶🏾 𝐓𝐎 𝐆𝐑𝐎𝐔𝐏 #${serial}!
» 🔗 সফলভাবে গ্রুপে বার্তা
» 🤩 পাঠানো হয়েছে।
───────────────
${FOOTER}`
        );
      }

      // ২. ব্রিজ মেসেজের Reply
      const route = bridgeReplies.get(quotedId);

      if (!route) return;

      const text = (body || "").trim();

      const sent = await sendBridgeMessage({
        sock,
        targetJid: route.otherJid,
        sourceJid: jid,
        sourceMessage: message,
        senderName: pushName || senderJid.split("@")[0],
        text,
        backToMessageId: message.key.id
      });

      if (sent) {
        await sock.sendMessage(jid, {
          react: {
            text: "✅",
            key: message.key
          }
        });
      }

    } catch (error) {
      console.error("[BRIDGE] Reply error:", error);
    }
  }
};
