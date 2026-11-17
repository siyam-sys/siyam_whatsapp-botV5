# নতুন Event তৈরির নমুনা (বাংলা)

এই ফাইলটি ইচ্ছাকৃতভাবে `.md` রাখা হয়েছে, যাতে `core/eventHandler.js` এটিকে JavaScript event হিসেবে লোড না করে।

নতুন event বানাতে নিচের কোড কপি করে `scripts/events/myNewEvent.js` নামে সেভ করো। `event`-এর নাম Baileys-এর event name হতে হবে।

```js
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦
import { AUTHOR } from "../../config.js";

export default {
  config: {
    name: "myNewEvent",
    event: "group-participants.update",
    version: "1.0.0",
    author: AUTHOR,
    description: "My WhatsApp event"
  },

  onStart: async ({ sock, data, eventName }) => {
    console.log("Event:", eventName);
    console.log("Group:", data?.id);
    // এখানে নিজের কাজ লিখবে।
  }
};
```

**মনে রাখবে:**
- `module.exports` বা `require()` ব্যবহার করবে না; এই WhatsApp project ESM ব্যবহার করে।
- `onStart`-এ `{ sock, data, eventName }` পাওয়া যায়।
- `message`, `api`, `threadsData`, `usersData` Messenger-এর মতো এখানে সরাসরি পাওয়া যায় না।
- `reply` দরকার হলে event-এর `data` থেকে chat JID নিয়ে `sock.sendMessage(jid, { text: "..." })` ব্যবহার করবে।
- ফাইলের শুরুতে author marker এবং `config.author`-এ একই author রাখতে হবে।
