
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import { AUTHOR } from "../../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function baseApiUrl() {
  const res = await axios.get(
    "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json",
    { timeout: 15000 }
  );

  if (!res.data?.gist) {
    throw new Error("Gist API URL not found");
  }

  return res.data.gist.replace(/\/+$/, "");
}

function formatMsg(text) {
  return `» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑
───────────────
  ${text}`;
}

function getQuotedText(message) {
  const contextInfo =
    message.message?.extendedTextMessage?.contextInfo ||
    message.message?.imageMessage?.contextInfo ||
    message.message?.videoMessage?.contextInfo ||
    {};

  const quoted = contextInfo.quotedMessage;

  return (
    quoted?.conversation ||
    quoted?.extendedTextMessage?.text ||
    quoted?.documentMessage?.caption ||
    quoted?.imageMessage?.caption ||
    quoted?.videoMessage?.caption ||
    ""
  );
}

export default {
  config: {
    name: "cl",
    version: "2.0",
    role: 2,
    author: AUTHOR,
    description: "Generate Gist from code or bot files",
    category: "convert",
    guide: "cl [file] | Reply to code | cl -e [event-file]",
    coolDown: 1
  },

  onStart: async function ({ sock, message, jid, args, reply }) {
    try {
      let fileName = args[0] || "";
      let code = "";

      if (fileName === "cl") {
        fileName = args[1] || "";
      }

      const quotedCode = getQuotedText(message);

      if (quotedCode) {
        code = quotedCode;

        if (!fileName || fileName === "-e") {
          fileName = `gist_${Date.now()}.js`;
        }

        if (!fileName.endsWith(".js")) {
          fileName += ".js";
        }
      } else if (fileName) {
        let folder = "../../scripts/cmds";

        if (args[0] === "-e" || args[1] === "-e") {
          folder = "../../scripts/events";
          fileName = args[0] === "-e" ? args[1] : args[2];
        }

        if (!fileName) {
          return reply(formatMsg("⚠️ File name missing."));
        }

        if (!fileName.endsWith(".js")) {
          fileName += ".js";
        }

        const basePath = path.resolve(__dirname, folder);
        const filePath = path.resolve(basePath, fileName);

        if (!filePath.startsWith(basePath + path.sep)) {
          return reply(formatMsg("❌ Invalid file path."));
        }

        if (!fs.existsSync(filePath)) {
          return reply(formatMsg(`❌ ${fileName} not found.`));
        }

        if (!fs.statSync(filePath).isFile()) {
          return reply(formatMsg("❌ Invalid file."));
        }

        code = fs.readFileSync(filePath, "utf8");
      } else {
        return reply(formatMsg("⚠️ Reply to code or give a file name."));
      }

      if (!code.trim()) {
        return reply(formatMsg("⚠️ Code is empty."));
      }

      await reply(formatMsg("⏳ Creating Gist..."));

      const apiUrl = await baseApiUrl();

      const res = await axios.post(
        `${apiUrl}/gist`,
        {
          code: encodeURIComponent(code),
          nam: fileName
        },
        {
          timeout: 30000,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const gistUrl = res.data?.data;

      if (!gistUrl || typeof gistUrl !== "string") {
        throw new Error("Invalid Gist response");
      }

      return reply(formatMsg(`🔗 Gist Link:\n${gistUrl}`));

    } catch (error) {
      console.error("CL COMMAND ERROR:", error);
      return reply(formatMsg("❌ Failed to create gist."));
    }
  }
};
