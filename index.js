// index.js - RLC: DM user when TARGET_ROLE_ID is removed + log to channel
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,   // role updates
    GatewayIntentBits.DirectMessages, // DMs
    GatewayIntentBits.GuildMessages   // for logging
  ],
  partials: [Partials.Channel]
});

const GUILD_ID = process.env.GUILD_ID;
const TARGET_ROLE_ID = process.env.TARGET_ROLE_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || null;
const DM_TEXT = process.env.DM_TEXT || "Hey {user}, you just lost access.";

async function logLine(guild, content) {
  console.log(content);
  if (!LOG_CHANNEL_ID) return;
  try {
    const channel = await guild.channels.fetch(LOG_CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      await channel.send(content);
    }
  } catch (e) {
    console.error("Log channel send failed:", e?.message || e);
  }
}

client.once(Events.ClientReady, async c => {
  console.log(`Logged in as ${c.user.tag}`);
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await logLine(guild, `✅ Bot online. Watching role <@&${TARGET_ROLE_ID}> in **${guild.name}**.`);
  } catch (e) {
    console.error("Startup fetch guild failed:", e?.message || e);
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    if (!oldMember || !newMember) return;
    if (newMember.guild.id !== GUILD_ID) return;

    const lostRole = oldMember.roles.cache.has(TARGET_ROLE_ID) && !newMember.roles.cache.has(TARGET_ROLE_ID);
    if (!lostRole) return;

    const msg = DM_TEXT.replace("{user}", `<@${newMember.id}>`);
    try {
      await newMember.user.send(msg);
      await logLine(newMember.guild, `📨 DM sent to ${newMember.user.tag} (${newMember.id}) after losing <@&${TARGET_ROLE_ID}>.`);
    } catch (err) {
      await logLine(newMember.guild, `⚠️ DM FAILED to ${newMember.user.tag} (${newMember.id}). Likely DMs disabled. Error: ${err?.message || err}`);
    }
  } catch (e) {
    console.error("GuildMemberUpdate handler error:", e?.message || e);
  }
});

client.login(process.env.BOT_TOKEN);