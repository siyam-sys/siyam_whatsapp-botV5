// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import { AUTHOR } from "../../config.js";
import { executeConverted } from "../helpers/convertedCommands.js";

export default {
  config: {
    name: "imagine",
    aliases: [],
    version: "1.0.0",
    author: AUTHOR,
    role: "USER",
    shortDescription: "imagine command converted for WhatsApp",
    longDescription: "Messenger source command adapted to the RJ WhatsApp bot context.",
    category: "AI",
    usage: ".imagine"
  },
  onStart: async (context) => executeConverted("imagine", context)
};
