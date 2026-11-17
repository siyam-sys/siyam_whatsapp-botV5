
// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import { CONFIG } from "../config.js";
import { COMMAND_CONFIG } from "../configCommands.js";
import { getGroup } from "../database/groups.js";

function digits(value = "") {
  return String(value).replace(/\D/g, "");
}

function isSameUser(a, b) {
  const first = digits(a);
  const second = digits(b);
  return Boolean(first && second && first === second);
}

function normalizeRequiredRole(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const roles = ["USER", "GROUP_ADMIN", "BOT_ADMIN", "OWNER"];
    return roles[Math.max(0, Math.min(3, Math.floor(value)))];
  }

  const role = String(value ?? "USER").toUpperCase();

  const aliases = {
    "0": "USER",
    "1": "GROUP_ADMIN",
    "2": "BOT_ADMIN",
    "3": "OWNER",
    ADMIN: "GROUP_ADMIN",
    BOTADMIN: "BOT_ADMIN"
  };

  return aliases[role] || role;
}

export async function checkPermission(context, commandConfig = {}) {
  const { sock, jid, senderJid, isGroup } = context;

  const owner = isSameUser(senderJid, CONFIG.OWNER);

  const botAdmin = (CONFIG.BOT_ADMINS || []).some(number =>
    isSameUser(senderJid, number)
  );

  const whitelisted = (CONFIG.WHITELIST || []).some(number =>
    isSameUser(senderJid, number)
  );

  let groupAdmin = false;

  if (isGroup) {
    try {
      const metadata = await sock.groupMetadata(jid);

      groupAdmin = (metadata.participants || []).some(participant =>
        isSameUser(participant.id, senderJid) &&
        ["admin", "superadmin"].includes(participant.admin)
      );
    } catch {
      groupAdmin = false;
    }
  }

  let role = "USER";

  if (owner) role = "OWNER";
  else if (botAdmin) role = "BOT_ADMIN";
  else if (groupAdmin) role = "GROUP_ADMIN";

  const roleValue = COMMAND_CONFIG.roles[role] ?? 0;
  const requiredName = normalizeRequiredRole(
    commandConfig.role ?? commandConfig.permission ?? "USER"
  );

  const requiredRole = COMMAND_CONFIG.roles[requiredName];

  if (requiredRole === undefined) {
    return {
      allowed: false,
      role,
      reason: "Invalid command role"
    };
  }

  if (roleValue < requiredRole) {
    return {
      allowed: false,
      role,
      reason: "Insufficient role"
    };
  }

  let mode = CONFIG.MESSAGE_MODE;

  if (isGroup) {
    try {
      const group = await getGroup(jid);
      if (group?.mode) mode = group.mode;
    } catch {
      // Keep global mode.
    }
  }

  if (owner) {
    return { allowed: true, role, reason: "Owner" };
  }

  if (mode === "ownerOnly") {
    return { allowed: false, role, reason: "Owner only mode" };
  }

  if (mode === "adminOnly" && !botAdmin && !groupAdmin) {
    return { allowed: false, role, reason: "Admin only mode" };
  }

  if (mode === "whiteListMode" && !whitelisted && !botAdmin) {
    return { allowed: false, role, reason: "Whitelist mode" };
  }

  return {
    allowed: true,
    role,
    reason: "Permission granted"
  };
}
