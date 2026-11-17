// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
// Messenger-এর global.GoatBot.onEvent loop-এর আলাদা দরকার নেই।
// WhatsApp বটের core/eventHandler.js নিজেই সব event module লোড ও চালায়।
// এই ফাইলটি শুধু connection event-এ dispatcher সচল হওয়ার তথ্য দেখায়।

import { AUTHOR } from "../../config.js";

export default {
  config: {
    name: "onEvent",
    event: "connection.update",
    version: "1.0.0",
    author: AUTHOR,
    description: "Confirm the WhatsApp event dispatcher connection state"
  },

  onStart: async ({ data }) => {
    if (data?.connection === "open") {
      console.log("[EVENT DISPATCHER] WhatsApp event handlers are active.");
    }
  }
};
