
import { AUTHOR } from "../../config.js";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

async function getMemberName(sock, member) {
	const jid = member.id || member.jid;

	let name =
		member.notify ||
		member.name ||
		sock.contacts?.[jid]?.name ||
		sock.store?.contacts?.[jid]?.name ||
		"";

	if (!name && typeof sock.getName === "function") {
		try {
			name = await sock.getName(jid);
		} catch {}
	}

	return name || jid.split("@")[0] || "Unknown";
}

export default {
	config: {
		name: "alluser",
		aliases: ["memberlist", "allmembers"],
		version: "1.0-wa",
		author: AUTHOR,
		role: 0,
		countDown: 2,
		description: "Get all group members and WhatsApp IDs",
		category: "box chat",
		guide: "alluser"
	},

	onStart: async function ({ sock, jid, isGroup, message, reply }) {
		try {
			if (!isGroup) {
				return reply("❌ এই কমান্ড শুধু গ্রুপে কাজ করে!");
			}

			const metadata = await sock.groupMetadata(jid);
			const participants = metadata.participants || [];

			if (!participants.length) {
				return reply("❌ গ্রুপের সদস্যদের তালিকা পাওয়া যায়নি!");
			}

			const lines = [];
			const mentionIds = [];

			for (let i = 0; i < participants.length; i++) {
				const member = participants[i];
				const memberJid = member.id;

				if (!memberJid) continue;

				const name = await getMemberName(sock, member);
				const isAdmin = ["admin", "superadmin"].includes(member.admin);

				lines.push(
					`╭─❖👤 USER #${lines.length + 1}\n` +
					`│ ✦ Name: ${name}\n` +
					`│ 🆔 WhatsApp ID: @${memberJid.split("@")[0]}\n` +
					`│ 👑 Role: ${isAdmin ? "Admin" : "Member"}\n` +
					`╰───────────────`
				);

				mentionIds.push(memberJid);
			}

			const header =
				"━━━━━━━━━━━━━━━━\n" +
				"👥 ALL GROUP USERS\n" +
				"━━━━━━━━━━━━━━━━\n" +
				`📊 Total Members: ${mentionIds.length}\n\n`;

			const footer =
				"\n━━━━━━━━━━━━━━━━\n" +
				"𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥\n" +
				"𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍\n" +
				"━━━━━━━━━━━━━━━━";

			// Split messages to avoid WhatsApp message-size limits.
			const chunks = [];
			let currentText = header;
			let currentMentions = [];

			for (let i = 0; i < lines.length; i++) {
				const nextLine = lines[i] + "\n\n";

				if (
					currentText.length + nextLine.length + footer.length > 3000 &&
					currentMentions.length
				) {
					chunks.push({
						text: currentText,
						mentions: currentMentions
					});

					currentText = "";
					currentMentions = [];
				}

				currentText += nextLine;
				currentMentions.push(mentionIds[i]);
			}

			currentText += footer;

			chunks.push({
				text: currentText,
				mentions: currentMentions
			});

			for (let i = 0; i < chunks.length; i++) {
				await sock.sendMessage(
					jid,
					{
						text: chunks[i].text,
						mentions: chunks[i].mentions
					},
					i === 0 ? { quoted: message } : {}
				);
			}

		} catch (error) {
			console.error("[ALLUSER ERROR]", error);
			return reply("❌ সদস্যদের তালিকা তৈরি করতে সমস্যা হয়েছে!");
		}
	}
};
