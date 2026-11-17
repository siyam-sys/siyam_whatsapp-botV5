
import { AUTHOR } from "../../config.js";

const LOCKED_AUTHOR = "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍";

const isUserAdmin = async (sock, jid, senderJid) => {
	try {
		const metadata = await sock.groupMetadata(jid);
		const participant = metadata.participants.find(
			member => member.id === senderJid
		);

		return ["admin", "superadmin"].includes(participant?.admin);
	} catch (e) {
		return false;
	}
};

export default {
	config: {
		name: "allout",
		aliases: ["leaveall", "শালা_লিভনে"],
		version: "1.0",
		author: AUTHOR,
		countDown: 5,
		role: 1,
		description: {
			bn: "চলতি গ্রুপটি বাদে বট যুক্ত থাকা বাকি সব গ্রুপ থেকে লিভ নেবে"
		},
		category: "admin",
		guide: {
			bn: "allout"
		}
	},

	onStart: async function ({ sock, jid, senderJid, isGroup, reply }) {
		if (this.config.author !== AUTHOR) {
			this.config.author = AUTHOR;
		}

		const currentThreadID = String(jid);

		const isAdmin = await isUserAdmin(sock, jid, senderJid);

		if (!isAdmin) {
			return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐈𝐎𝐍 𝐃𝐄𝐍𝐈𝐄𝐃!
» ⚠️ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 
» 🚪 𝐀𝐥𝐥-𝐎𝐮𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝.
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
			);
		}

		const initMsg = await reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ⚙️ 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆...
» ⏳ 𝐋𝐞𝐚𝐯𝐢𝐧𝐠 𝐚𝐥𝐥 𝐨𝐭𝐡𝐞𝐫 𝐠𝐫𝐨𝐮𝐩𝐬, 
» 📌 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭!
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
		);

		try {
			const groups = await sock.groupFetchAllParticipating();

			const targetGroupIDs = Object.keys(groups || {})
				.filter(id => String(id) !== currentThreadID);

			let successCount = 0;
			let failCount = 0;

			for (const id of targetGroupIDs) {
				try {
					await sock.groupLeave(id);
					successCount++;
					await new Promise(resolve => setTimeout(resolve, 1000));
				} catch (err) {
					failCount++;
				}
			}

			return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» 🚀 𝐀𝐋𝐋-𝐎𝐔𝐓 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃!
───────────────
» ✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐋𝐞𝐟𝐭: ${successCount} Group(s)
» ❌ 𝐅𝐚𝐢𝐥𝐞𝐝: ${failCount} Group(s)
» 📌 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐆𝐫𝐨𝐮𝐩: Saved Safe 🛡️
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
			);

		} catch (error) {
			return reply(
`» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
» ❌ 𝐄𝐑𝐑𝐎𝐑!
» ⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐬𝐭.
───────────────
» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`
			);
		}
	}
};
