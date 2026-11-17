
import { AUTHOR } from "../../config.js";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

const SOURCE_AUTHOR = "kshitiz";

export default {
	config: {
		name: "allbox",
		aliases: ["boxlist"],
		author: AUTHOR,
		sourceAuthor: SOURCE_AUTHOR,
		version: "2.0-wa",
		countDown: 5,
		role: 0,
		description: {
			en: "List all group chats the bot is in."
		},
		category: "admin",
		guide: "allbox"
	},

	onStart: async function ({ sock, jid, message, reply }) {
		try {
			if (this.config?.author !== AUTHOR) {
				return reply(
					"⛔ This file is locked!\nAuthor change detected."
				);
			}

			// Fetch all groups where the bot is a participant.
			const groups = await sock.groupFetchAllParticipating();

			const groupList = Object.values(groups || {});

			if (groupList.length === 0) {
				return reply("No group chats found.");
			}

			// Sort groups alphabetically by subject.
			groupList.sort((a, b) =>
				(a.subject || "").localeCompare(b.subject || "")
			);

			const formattedList = groupList.map((group, index) => {
				const groupName = group.subject || "Unknown Group";
				const groupId = group.id || "Unknown ID";

				return `│🍂${index + 1}. ${groupName}\n│➥𝐓𝐈𝐃: ${groupId}\n`;
			});

			const text = `╭─╮
│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:
${formattedList.join("\n")}
╰───────────ꔪ`;

			await sock.sendMessage(
				jid,
				{ text },
				{ quoted: message }
			);

		} catch (error) {
			console.error("[ALLBOX COMMAND ERROR]", error);
			return reply(
				"❌ গ্রুপ লিস্ট সংগ্রহ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
			);
		}
	}
};
