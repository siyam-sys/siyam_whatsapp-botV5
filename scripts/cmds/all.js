
import { AUTHOR } from "../../config.js";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

const SOURCE_AUTHOR = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

export default {
	config: {
		name: "all",
		aliases: ["tagall", "everyone"],
		version: "1.2-wa",
		author: AUTHOR,
		sourceAuthor: SOURCE_AUTHOR,
		countDown: 5,
		role: 1,
		description: {
			en: "Tag all members in your group chat"
		},
		category: "box chat",
		guide: "all [content | empty]"
	},

	onStart: async function ({ sock, message, jid, args, isGroup, permission, reply }) {
		try {
			if (this.config?.author !== AUTHOR) {
				return reply("⛔ This file is locked!\nAuthor change detected.");
			}

			if (!isGroup) {
				return reply("❌ এই কমান্ডটি শুধু গ্রুপে ব্যবহার করা যাবে!");
			}

			if ((permission?.roleLevel ?? 0) < 1) {
				return reply("⛔ শুধুমাত্র গ্রুপ অ্যাডমিন এই কমান্ড ব্যবহার করতে পারবেন!");
			}

			const metadata = await sock.groupMetadata(jid);
			const participants = metadata.participants || [];

			if (!participants.length) {
				return reply("❌ গ্রুপের সদস্যদের তালিকা পাওয়া যায়নি!");
			}

			const mentions = participants
				.map(member => member.id)
				.filter(Boolean);

			const content = args?.join(" ").trim() || "@all";

			const mentionText = mentions
				.map(jid => `@${jid.split("@")[0]}`)
				.join(" ");

			const body = `${content}\n\n${mentionText}`;

			await sock.sendMessage(
				jid,
				{
					text: body,
					mentions
				},
				{ quoted: message }
			);

		} catch (error) {
			console.error("[ALL COMMAND ERROR]", error);
			return reply("❌ সবাইকে মেনশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
		}
	}
};
