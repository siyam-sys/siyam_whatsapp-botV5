
import { AUTHOR } from "../../config.js";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

export default {
	config: {
		name: "groupinfo",
		aliases: ["boxinfo"],
		version: "1.0-wa",
		author: AUTHOR,
		role: 0,
		countDown: 5,
		description: "See WhatsApp group information",
		category: "box chat",
		guide: "groupinfo"
	},

	onStart: async function ({ sock, jid, isGroup, message, reply }) {
		try {
			if (!isGroup) {
				return reply("❌ এই কমান্ড শুধু গ্রুপে কাজ করে!");
			}

			const info = await sock.groupMetadata(jid);
			const participants = info.participants || [];

			const admins = participants.filter(member =>
				["admin", "superadmin"].includes(member.admin)
			);

			const adminNames = [];

			for (const admin of admins) {
				const adminJid = admin.id;
				let name =
					admin.notify ||
					sock.contacts?.[adminJid]?.name ||
					sock.store?.contacts?.[adminJid]?.name ||
					"Unknown";

				if (name === "Unknown" && typeof sock.getName === "function") {
					try {
						name = await sock.getName(adminJid);
					} catch {}
				}

				adminNames.push(`» 🎀 ${name}`);
			}

			const created = info.creation
				? new Date(info.creation * 1000).toLocaleString("en-BD", {
					timeZone: "Asia/Dhaka"
				})
				: "তথ্য পাওয়া যায়নি";

			const description = info.desc || "কোনো Description নেই";

			const messageText = `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🏷️ গ্রুপের নাম:
» 📛 ${info.subject || "No Name"}
» 🆔 গ্রুপ আইডি:
» 🔢 ${info.id || jid}
» 👥 মোট মেম্বার:
» 📊 ${participants.length} জন
» 👑 মোট এডমিন:
» 🛡️ ${admins.length} জন
» 🔰 মেসেজ অনুমতি:
» ⚙️ ${info.announce ? "শুধু Admin" : "সবাই"}
» 🔒 গ্রুপ তথ্য পরিবর্তন:
» ${info.restrict ? "শুধু Admin" : "সবাই"}
» 📅 তৈরি:
» ${created}
───────────────
» 📝 গ্রুপ Description:
${description}
───────────────
» 👑 এডমিনদের তালিকা:
${adminNames.join("\n") || "কোনো Admin পাওয়া যায়নি"}
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

			return sock.sendMessage(
				jid,
				{ text: messageText },
				{ quoted: message }
			);

		} catch (error) {
			console.error("[GROUPINFO ERROR]", error);
			return reply("❌ গ্রুপের তথ্য সংগ্রহ করতে সমস্যা হয়েছে!");
		}
	}
};
