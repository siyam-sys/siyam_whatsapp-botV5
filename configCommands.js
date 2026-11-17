
export const COMMAND_CONFIG = Object.freeze({
  modes: {
    ALL: "all",
    ADMIN_ONLY: "adminOnly",
    WHITELIST: "whiteListMode",
    OWNER_ONLY: "ownerOnly"
  },
  roles: {
    USER: 0,
    GROUP_ADMIN: 1,
    BOT_ADMIN: 2,
    OWNER: 2
  },
  defaultRole: 0,
  commandExtension: ".js",
  eventExtension: ".js"
});
