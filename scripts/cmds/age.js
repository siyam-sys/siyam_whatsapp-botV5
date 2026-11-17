
import { AUTHOR } from "../../config.js";

// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

const SOURCE_AUTHOR = "সিয়াম";
const TIME_ZONE = "Asia/Dhaka";

const monthMap = {
	jan: 1, january: 1,
	feb: 2, february: 2,
	mar: 3, march: 3,
	apr: 4, april: 4,
	may: 5,
	jun: 6, june: 6,
	jul: 7, july: 7,
	aug: 8, august: 8,
	sep: 9, september: 9,
	oct: 10, october: 10,
	nov: 11, november: 11,
	dec: 12, december: 12
};

const banglaDays = {
	Sunday: "রবিবার",
	Monday: "সোমবার",
	Tuesday: "মঙ্গলবার",
	Wednesday: "বুধবার",
	Thursday: "বৃহস্পতিবার",
	Friday: "শুক্রবার",
	Saturday: "শনিবার"
};

function getDhakaNow() {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: TIME_ZONE,
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hourCycle: "h23"
	}).formatToParts(new Date());

	const values = {};
	for (const part of parts) {
		if (part.type !== "literal") {
			values[part.type] = Number(part.value);
		}
	}

	return new Date(Date.UTC(
		values.year,
		values.month - 1,
		values.day,
		values.hour,
		values.minute,
		values.second
	));
}

function daysInMonth(year, month) {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function makeDate(year, month, day) {
	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day) ||
		month < 1 ||
		month > 12 ||
		day < 1 ||
		day > daysInMonth(year, month)
	) {
		return null;
	}

	return new Date(Date.UTC(year, month - 1, day));
}

function parseBirthDate(input) {
	let day;
	let month;
	let year;

	if (/^\d{4}$/.test(input)) {
		day = 1;
		month = 1;
		year = Number(input);
	} else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(input)) {
		const parts = input.split("/");
		day = Number(parts[0]);
		month = Number(parts[1]);
		year = Number(parts[2]);

		if (year < 100) year += 2000;
	} else if (/^\d{1,2}\s+[a-zA-Z]{3,9}\s+\d{4}$/.test(input)) {
		const parts = input.split(" ");
		day = Number(parts[0]);
		month = monthMap[parts[1].toLowerCase()];
		year = Number(parts[2]);
	} else if (/^\d{1,2}\/[a-zA-Z]{3,9}\/\d{4}$/.test(input)) {
		const parts = input.split("/");
		day = Number(parts[0]);
		month = monthMap[parts[1].toLowerCase()];
		year = Number(parts[2]);
	} else {
		return null;
	}

	if (!month || !year) return null;

	return makeDate(year, month, day);
}

function addMonthsClamped(date, months) {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth() + months;
	const targetYear = year + Math.floor(month / 12);
	const targetMonth = ((month % 12) + 12) % 12;
	const day = Math.min(
		date.getUTCDate(),
		daysInMonth(targetYear, targetMonth + 1)
	);

	return new Date(Date.UTC(
		targetYear,
		targetMonth,
		day,
		date.getUTCHours(),
		date.getUTCMinutes(),
		date.getUTCSeconds()
	));
}

function getAge(birth, now) {
	let years = now.getUTCFullYear() - birth.getUTCFullYear();

	let anniversary = addMonthsClamped(birth, years * 12);
	if (anniversary > now) {
		years--;
		anniversary = addMonthsClamped(birth, years * 12);
	}

	let months =
		(now.getUTCFullYear() - anniversary.getUTCFullYear()) * 12 +
		(now.getUTCMonth() - anniversary.getUTCMonth());

	let monthDate = addMonthsClamped(anniversary, months);
	if (monthDate > now) {
		months--;
		monthDate = addMonthsClamped(anniversary, months);
	}

	const days = Math.floor((now - monthDate) / 86400000);

	return { years, months, days };
}

function getNextBirthday(birth, now) {
	const month = birth.getUTCMonth();
	const day = birth.getUTCDate();
	let year = now.getUTCFullYear();

	let next = makeDate(year, month + 1, day);

	// February 29 birthday: use February 28 in non-leap years.
	if (!next && month === 1 && day === 29) {
		next = makeDate(year, 2, 28);
	}

	if (next < new Date(Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate()
	))) {
		year++;
		next = makeDate(year, month + 1, day);

		if (!next && month === 1 && day === 29) {
			next = makeDate(year, 2, 28);
		}
	}

	return next;
}

export default {
	config: {
		name: "age",
		aliases: ["myage", "বয়স"],
		version: "11.0-wa",
		author: AUTHOR,
		sourceAuthor: SOURCE_AUTHOR,
		role: 0,
		category: "utility",
		guide: "age <YYYY | DD/MM/YYYY | D Month YYYY>",
		countDown: 3
	},

	onStart: async function ({ args, reply }) {
		try {
			if (this.config?.author !== AUTHOR) {
				return reply(
					"⛔ This file is locked!\nAuthor change detected."
				);
			}

			if (!args?.length) {
				return reply(
					"⚠️ আপনার জন্মতারিখ সঠিকভাবে লিখুন!\n\n" +
					"উদাহরণ:\n" +
					"• age 2007\n" +
					"• age 01/05/2007\n" +
					"• age 5 May 2007"
				);
			}

			const input = args.join(" ").trim().replace(/\s+/g, " ");
			const birth = parseBirthDate(input);

			if (!birth) {
				return reply(
					"❌ তারিখের ফরম্যাট সঠিক নয়!\n\n" +
					"✔ সঠিক ব্যবহার:\n" +
					"• age 2007\n" +
					"• age 01/05/2007\n" +
					"• age 3 May 2007"
				);
			}

			const now = getDhakaNow();

			if (birth > now) {
				return reply("❌ জন্মতারিখ ভবিষ্যতের হতে পারে না!");
			}

			const { years, months, days } = getAge(birth, now);

			const totalMonths = years * 12 + months;
			const totalDays = Math.floor((now - birth) / 86400000);
			const totalHours = Math.floor((now - birth) / 3600000);

			const dayName = banglaDays[
				new Intl.DateTimeFormat("en-US", {
					timeZone: TIME_ZONE,
					weekday: "long"
				}).format(birth)
			];

			const nextBirthday = getNextBirthday(birth, now);
			const daysToNextBirthday = Math.ceil(
				(nextBirthday - now) / 86400000
			);

			const birthDay = birth.getUTCDate();
			const birthMonth = birth.getUTCMonth() + 1;
			const birthYear = birth.getUTCFullYear();

			const msgText = `» 👑 𝗢𝗪𝗡𝗘𝗥 : 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍
───────────────
» 🎂 𝗔𝗚𝗘 𝗥𝗘𝗦𝗨𝗟𝗧
» 📅 জন্মতারিখ : ${birthDay}/${birthMonth}/${birthYear} (${dayName})
───────────────
»🎂 𝗕𝗔𝗥𝗧𝗔𝗠𝗔𝗡 𝗕𝗢𝗬𝗢𝗦
» ${years} বছর ${months} মাস ${days} দিন
───────────────
» 📊 𝗧𝗢𝗧𝗔𝗟
» 📅 ${totalDays.toLocaleString("en-US")} দিন
» 🗓️ ${totalMonths.toLocaleString("en-US")} মাস
» ⏰ ${totalHours.toLocaleString("en-US")} ঘণ্টা
───────────────
🎁 𝗡𝗘𝗫𝗧 𝗕𝗜𝗥𝗧𝗛𝗗𝗔𝗬
» আর ${daysToNextBirthday} দিন বাকি!
───────────────
» 🧚‍♀️ 𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧`;

			return reply(msgText);

		} catch (error) {
			console.error("[AGE COMMAND ERROR]", error);
			return reply(
				"❌ বয়স গণনা করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।"
			);
		}
	}
};
