// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import { AUTHOR } from "../../config.js";
import { executeConverted } from "../helpers/convertedCommands.js";

export default {
  config: {
    name: "anime",
    aliases: [],
    version: "1.0.0",
    author: AUTHOR,
    role: "USER",
    shortDescription: "anime command converted for WhatsApp",
    longDescription: "Messenger source command adapted to the RJ WhatsApp bot context.",
    category: "FUN",
    usage: ".anime"
  },
  onStart: async (context) => executeConverted("anime", context)
};
