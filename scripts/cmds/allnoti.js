
import { AUTHOR } from "../../config.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

const SOURCE_AUTHOR = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";
const DELAY_PER_GROUP = 1500;

const sleep = ms =>
	new Promise(resolve => setTimeout(resolve, ms));

function unwrapMessage(message) {
	let current = message;

	while (current) {
		if (current.ephemeralMessage?.message) {
			current = current.ephemeralMessage.message;
		} else if (current.viewOnceMessage?.message) {
			current = current.viewOnceMessage.message;
		} else if (current.viewOnceMessageV2?.message) {
			current = current.viewOnceMessageV2.message;
		} else if (current.viewOnceMessageV2Extension?.message) {
			current = current.viewOnceMessageV2Extension.message;
		} else {
			break;
		}
	}

	return current || {};
}

function getQuotedMessage(message) {
	const msg = unwrapMessage(message?.message || {});
	const contextInfo =
		msg.extendedTextMessage?.contextInfo ||
		msg.imageMessage?.contextInfo ||
		msg.videoMessage?.contextInfo ||
		msg.documentMessage?.contextInfo ||
		msg.buttonsResponseMessage?.contextInfo ||
		{};

	if (!contextInfo.quotedMessage) return null;

	return {
		quotedMessage: unwrapMessage(contextInfo.quotedMessage),
		participant: contextInfo.participant || null,
		stanzaId: contextInfo.stanzaId || null
	};
}

async function getAttachment(quoted) {
	if (!quoted) return null;

	const mediaTypes = [
		["imageMessage", "image"],
		["videoMessage", "video"],
		["documentMessage", "document"],
		["audioMessage", "audio"]
	];

	for (const [key, type] of mediaTypes) {
		const media = quoted.quotedMessage[key];

		if (!media) continue;

		const stream = await downloadContentFromMessage(media, type);
		const chunks = [];

		for await (const chunk of stream) {
			chunks.push(chunk);
		}

		return {
			type,
			buffer: Buffer.concat(chunks),
			mimetype: media.mimetype || undefined,
			fileName: media.fileName || undefined
		};
	}

	return null;
}

function makePayload(text, attachment) {
	if (!attachment) {
		return { text };
	}

	switch (attachment.type) {
		case "image":
			return {
				image: attachment.buffer,
				caption: text,
				mimetype: attachment.mimetype || "image/jpeg"
			};

		case "video":
			return {
				video: attachment.buffer,
				caption: text,
				mimetype: attachment.mimetype || "video/mp4"
			};

		case "document":
			return {
				document: attachment.buffer,
				caption: text,
				mimetype: attachment.mimetype || "application/octet-stream",
				fileName: attachment.fileName || "owner-broadcast"
			};

		case "audio":
			return {
				audio: attachment.buffer,
				mimetype: attachment.mimetype || "audio/mpeg"
			};

		default:
			return { text };
	}
}

export default {
	config: {
		name: "allnoti",
		aliases: ["broadcastall"],
		version: "3.0-wa",
		author: AUTHOR,
		sourceAuthor: SOURCE_AUTHOR,
		role: 2,
		countDown: 5,
		description: "Owner Broadcast",
		category: "admin",
		guide: "allnoti <message>"
	},

	onStart: async function ({
		sock,
		message,
		jid,
		args,
		permission,
		reply
	}) {
		try {
			if (this.config?.author !== AUTHOR) {
				return reply(
					"⛔ This file is locked!\nAuthor change detected."
				);
			}

			if ((permission?.roleLevel ?? 0) < 2) {
				return reply("⛔ এই কমান্ডটি শুধু Bot Owner ব্যবহার করতে পারবেন!");
			}

			const msg = args.join(" ").trim();

			if (!msg) {
				return reply("⚠️ Message dao!");
			}

			let attachment = null;

			const quoted = getQuotedMessage(message);

			if (quoted) {
				try {
					attachment = await getAttachment(quoted);
				} catch (error) {
					console.error(
						"[ALLNOTI MEDIA DOWNLOAD ERROR]",
						error
					);

					return reply(
						"❌ Reply করা মিডিয়া ডাউনলোড করা যায়নি। আবার চেষ্টা করুন।"
					);
				}
			}

			const groupData =
				await sock.groupFetchAllParticipating();

			const groups = Object.values(groupData || {})
				.filter(group => group.id);

			if (!groups.length) {
				return reply("❌ Bot কোনো গ্রুপে যুক্ত নেই!");
			}

			await reply(
				`🔔 Owner Broadcast শুরু হচ্ছে!\n\n` +
				`📢 মোট গ্রুপ: ${groups.length}\n` +
				`📎 Attachment: ${attachment ? "Yes" : "No"}\n\n` +
				`⏳ অনুগ্রহ করে অপেক্ষা করুন...`
			);

			const broadcastText = `🔔 𝙉𝙊𝙏𝙄𝙁𝙄𝘾𝘼𝙏𝙄𝙊𝙉
━━━━━━━━━━━━━━━
📢 𝗢𝗪𝗡𝗘𝗥:𓆩👑-𝐒𝐈𝐘𝐀𝐌-👑𓆪

${msg}
━━━━━━━━━━━━━━━`;

			let success = 0;
			let failed = 0;

			for (const group of groups) {
				try {
					await sock.sendMessage(
						group.id,
						makePayload(broadcastText, attachment)
					);

					success++;
				} catch (error) {
					failed++;
					console.error(
						`[ALLNOTI SEND ERROR] ${group.id}:`,
						error.message
					);
				}

				await sleep(DELAY_PER_GROUP);
			}

			return reply(
				`✅ Done Owner Broadcast

✔️ Success: ${success}
❌ Failed: ${failed}
📊 Total Groups: ${groups.length}

👑 𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧`
			);

		} catch (error) {
			console.error("[ALLNOTI ERROR]", error);

			return reply(
				"❌ System Error:\n" + error.message
			);
		}
	}
};
