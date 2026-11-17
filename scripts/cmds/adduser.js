
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import { AUTHOR, normalizeNumber } from "../../config.js";

const SOURCE_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

export default {
  config: {
    name: "adduser",
    aliases: ["addmember", "inviteuser"],
    version: "1.5-wa",
    author: AUTHOR,
    sourceAuthor: SOURCE_AUTHOR,
    countDown: 5,
    role: 1,

    description: {
      en: "Add a WhatsApp user to the current group."
    },

    category: "group",

    guide: {
      en:
        "{pn} <phone number | WhatsApp JID>\n" +
        "Example: {pn} 8801XXXXXXXXX"
    }
  },

  onStart: async function ({
    sock,
    message,
    jid,
    args,
    isGroup,
    permission,
    reply
  }) {
    if (this.config.sourceAuthor !== SOURCE_AUTHOR) {
      console.log("⚠️ WARNING: Source author has been modified!");
    }

    if (!isGroup || !jid?.endsWith("@g.us")) {
      return reply("⚠️ এই কমান্ডটি শুধু WhatsApp Group-এ ব্যবহার করা যাবে।");
    }

    // Group admin permission
    if (permission?.roleLevel < 1) {
      return reply("⛔ শুধু Group Admin এই কমান্ড ব্যবহার করতে পারবে।");
    }

    if (!args.length) {
      return reply(
        "📌 ব্যবহার:\n" +
        "/adduser 8801XXXXXXXXX\n\n" +
        "WhatsApp নম্বর অথবা JID দিতে হবে।"
      );
    }

    const results = {
      success: [],
      failed: [],
      already: []
    };

    let metadata;

    try {
      metadata = await sock.groupMetadata(jid);
    } catch (error) {
      console.error("AddUser Metadata Error:", error);
      return reply("❌ Group information পাওয়া যায়নি।");
    }

    const participants = metadata.participants || [];

    for (const item of args) {
      let targetJid;

      // Accept WhatsApp JID
      if (/^\d+@s\.whatsapp\.net$/.test(item)) {
        targetJid = item;
      } else {
        // Accept phone number
        const number = normalizeNumber(String(item).replace(/\D/g, ""));

        if (!number || number.length < 8) {
          results.failed.push(item);
          continue;
        }

        targetJid = `${number}@s.whatsapp.net`;
      }

      // Check existing participant
      if (participants.some(p => p.id === targetJid)) {
        results.already.push(item);
        continue;
      }

      try {
        const response = await sock.onWhatsApp(targetJid);

        if (!response?.length || !response[0]?.exists) {
          results.failed.push(item);
          continue;
        }

        const added = await sock.groupParticipantsUpdate(
          jid,
          [targetJid],
          "add"
        );

        const status = added?.[0]?.status;

        if (status === "200") {
          results.success.push(item);
        } else if (status === "403" || status === "408") {
          // WhatsApp may require an invite link
          try {
            const inviteCode = await sock.groupInviteCode(jid);

            results.failed.push(
              `${item} (Invite required: https://chat.whatsapp.com/${inviteCode})`
            );
          } catch {
            results.failed.push(item);
          }
        } else {
          results.failed.push(item);
        }

      } catch (error) {
        console.error(`AddUser Error (${item}):`, error);
        results.failed.push(item);
      }
    }

    let output = "👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n";
    output += "━━━━━━━━━━━━━━\n";

    if (results.success.length) {
      output += `✅ Successfully added: ${results.success.length}\n`;
      output += results.success.map(x => `• ${x}`).join("\n") + "\n";
    }

    if (results.already.length) {
      output += `\n⚠️ Already in group: ${results.already.length}\n`;
      output += results.already.map(x => `• ${x}`).join("\n") + "\n";
    }

    if (results.failed.length) {
      output += `\n❌ Failed to add: ${results.failed.length}\n`;
      output += results.failed.map(x => `• ${x}`).join("\n") + "\n";
    }

    if (
      !results.success.length &&
      !results.already.length &&
      !results.failed.length
    ) {
      output += "কোনো সদস্য প্রসেস করা হয়নি।\n";
    }

    output += "\n━━━━━━━━━━━━━━\n";
    output += "🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧";

    return reply(output);
  }
};
