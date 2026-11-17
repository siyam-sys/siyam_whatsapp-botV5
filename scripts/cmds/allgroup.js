
import { AUTHOR } from "../../config.js";
import { updateGroup } from "../../database/groups.js";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

const SOURCE_AUTHOR = "亗 SIYAM HASAN";

// Panel message ID -> authorized owner and group list
const pendingPanels = new Map();

function getContextInfo(message) {
	const msg = message?.message || {};

	return (
		msg.extendedTextMessage?.contextInfo ||
		msg.imageMessage?.contextInfo ||
		msg.videoMessage?.contextInfo ||
		msg.documentMessage?.contextInfo ||
		msg.buttonsResponseMessage?.contextInfo ||
		msg.listResponseMessage?.contextInfo ||
		{}
	);
}

function getGroupJid(group) {
	return group?.id || group?.jid || null;
}

export default {
	config: {
		name: "allgroup",
		aliases: ["allgc"],
		version: "2.0-wa",
		role: 2,
		author: AUTHOR,
		sourceAuthor: SOURCE_AUTHOR,
		description: "Premium All Group Panel",
		category: "admin",
		countDown: 5,
		guide: "allgroup"
	},

	onStart: async function ({
		sock,
		message,
		jid,
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
				return reply("⛔ এই প্যানেলটি শুধু বট Owner ব্যবহার করতে পারবেন!");
			}

			const result = await sock.groupFetchAllParticipating();
			const list = Object.values(result || {});

			if (!list.length) {
				return reply("❌ Failed to fetch group list.");
			}

			const groups = list.filter(group => {
				const groupJid = getGroupJid(group);
				return groupJid && groupJid !== jid;
			});

			if (!groups.length) {
				return reply("❌ Bot is not added in any other group.");
			}

			let msg = `╔𝐑𝐎𝐘𝐀𝐋 𝐆𝐑𝐎𝐔𝐏 𝐏𝐀𝐍𝐄𝐋╗
┃
┃ 🌟 𝐀𝐋𝐋 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 🌟
┃         👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 👑
┃
┃       👑 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
┃
╠═══════════════╣
`;

			const saveGroup = [];

			for (let i = 0; i < groups.length; i++) {
				const group = groups[i];
				const groupJid = getGroupJid(group);
				const name = group.subject || "Unnamed Group";
				const members = group.participants?.length || 0;

				msg += `┃ 💎 ${i + 1} ➤ ${name}
┃ 🆔 𝐆𝐂 𝐈𝐃 ➤ ${groupJid}
┃ 👥 𝐌𝐄𝐌𝐁𝐄𝐑 ➤ ${members}
┃
`;

				saveGroup.push(groupJid);
			}

			msg += `╠══════════════╣
┃  𝐑𝐄𝐏𝐋𝐘 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 𝐏𝐀𝐍𝐄𝐋
┃
┃ 🚪 out 1
┃ ➤ Leave Selected Group
┃
┃ ➕ add 2
┃ ➤ Add Yourself In Group
┃
┃ 🚫 ban 3
┃ ➤ Ban & Auto Leave Group
┃
┃  ═══════════════╣
┃ 🤖 𝐁𝐎𝐓   ➤  𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧
┃ 👑 𝐎𝐖𝐍𝐄𝐑
┃  ☠️  ➤  𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
┃ 💠 𝐏𝐑𝐄𝐅𝐈𝐗 ➤ 【,】
┃
╚  👑 𝗡𝗜𝗝𝗛𝗨𝗠 𝗕𝗢𝗧👑 ╝`;

			const sent = await sock.sendMessage(
				jid,
				{ text: msg },
				{ quoted: message }
			);

			if (sent?.key?.id) {
				pendingPanels.set(sent.key.id, {
					author: message?.key?.participant ||
						message?.key?.remoteJid,
					groupData: saveGroup
				});
			}

		} catch (error) {
			console.error("[ALLGROUP ERROR]", error);
			return reply(
				"❌ System Error:\n" + error.message
			);
		}
	},

	// WhatsApp equivalent of Messenger's onReply.
	onChat: async function ({
		sock,
		message,
		jid,
		body,
		senderJid,
		quotedMessageId,
		reply
	}) {
		try {
			if (!quotedMessageId || !body?.trim()) return;

			const panel = pendingPanels.get(quotedMessageId);
			if (!panel) return;

			// Only the owner who opened the panel can control it.
			if (senderJid !== panel.author) return;

			const args = body.trim().split(/\s+/);
			const cmd = args[0]?.toLowerCase();
			const num = Number.parseInt(args[1], 10);

			if (!cmd || !Number.isInteger(num)) {
				return reply("❌ Invalid reply format.");
			}

			const groupJid = panel.groupData[num - 1];

			if (!groupJid) {
				return reply("❌ Group not found.");
			}

			if (cmd === "out") {
				try {
					await sock.groupLeave(groupJid);
					pendingPanels.delete(quotedMessageId);

					return reply(`╔══════════════╗
┃ ✅ LEFT SUCCESS
┃ 🆔 ${groupJid}
╚══════════════╝`);
				} catch (error) {
					console.error("[ALLGROUP LEAVE ERROR]", error);
					return reply("❌ Failed to leave group.");
				}
			}

			if (cmd === "add") {
				try {
					const result = await sock.groupParticipantsUpdate(
						groupJid,
						[senderJid],
						"add"
					);

					const failed = Array.isArray(result) &&
						result.some(item => Number(item?.status) >= 400);

					if (failed) {
						return reply(
							"❌ WhatsApp could not add you to this group. " +
							"Group privacy settings or admin approval may prevent it."
						);
					}

					return reply(`╔══════════════╗
┃ ✅ ADD REQUEST SENT
┃ 🆔 ${groupJid}
╚══════════════╝`);
				} catch (error) {
					console.error("[ALLGROUP ADD ERROR]", error);
					return reply(
						"❌ Failed to add you. The bot may need group admin permission."
					);
				}
			}

			if (cmd === "ban") {
				try {
					// Save the banned flag in the bot's group database.
					await updateGroup(groupJid, {
						banned: true
					});

					await sock.sendMessage(groupJid, {
						text: "🚫 This group has been banned."
					});

					await sock.groupLeave(groupJid);
					pendingPanels.delete(quotedMessageId);

					return reply(`╔══════════════╗
┃ 🚫 BAN SUCCESS
┃ 🆔 ${groupJid}
╚══════════════╝`);
				} catch (error) {
					console.error("[ALLGROUP BAN ERROR]", error);
					return reply(
						"❌ Failed to ban and leave group:\n" + error.message
					);
				}
			}

			return reply(
				"❌ Invalid command.\n\nUse: out 1 / add 2 / ban 3"
			);

		} catch (error) {
			console.error("[ALLGROUP REPLY ERROR]", error);
			return reply(
				"❌ Reply Error:\n" + error.message
			);
		}
	}
};
