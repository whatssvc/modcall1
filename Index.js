const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(bodyParser.json());

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const PORT = process.env.PORT || 3000; // Render uses its own port

const MOD_CHANNEL_ID = "1391646398977675364"; // put your channel ID
const MOD_ROLE_ID = "1391654796989169707";       // put your mod role ID

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once("ready", () => {
  console.log(`✅ Discord bot is online as ${client.user.tag}`);
});

app.post("/modcall", async (req, res) => {
  const { username, userId, reason, jobId, placeId } = req.body;

  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID);
    if (!channel) return res.status(404).send("Channel not found");

    const serverLink = `roblox://placeId=${placeId}&jobId=${jobId}`;

await channel.send({
  content: `## __<@&${MOD_ROLE_ID}> Game Link: [Click to Join](roblox://placeId=${placeId}&jobId=${jobId})__`,
  embeds: [{
    title: "🚨 Mod Call",
    color: 0xff0000,
    fields: [
      { name: "Caller", value: `[${username}](https://www.roblox.com/users/${userId}/profile)`, inline: true },
      { name: "Reason", value: reason || "*No reason provided*", inline: true },
      { name: "Game Page", value: `[View on Roblox](https://www.roblox.com/games/${placeId})`, inline: false }
    ],
    timestamp: new Date().toISOString()
  }]
});

    res.send("✅ Mod call sent");
  } catch (err) {
    console.error("❌ Failed to send mod call:", err);
    res.status(500).send("Server error");
  }
});

client.login(DISCORD_TOKEN);
app.listen(PORT, () => console.log(`🌐 Express server live on port ${PORT}`));
