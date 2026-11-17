// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import { AUTHOR } from "../../config.js";
import { executeConverted } from "../helpers/convertedCommands.js";

export default {
  config: {
    name: "gemini",
    aliases: [],
    version: "1.0.0",
    author: AUTHOR,
    role: "USER",
    shortDescription: "gemini command converted for WhatsApp",
    longDescription: "Messenger source command adapted to the RJ WhatsApp bot context.",
    category: "AI",
    usage: ".gemini"
  },
  onStart: async (context) => executeConverted("gemini", context)
};
