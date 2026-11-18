// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

export const pendingInstalls = new Map();

export function clearExpiredInstalls() {
  const now = Date.now();

  for (const [messageId, install] of pendingInstalls) {
    if (!install || now > install.expiresAt) {
      pendingInstalls.delete(messageId);
    }
  }
}

export default pendingInstalls;
