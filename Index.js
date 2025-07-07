const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

const app = express();
app.use(bodyParser.json());

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const PORT = process.env.PORT || 3000;

const MOD_CHANNEL_ID = "1391646398977675364"; // Replace with your actual channel ID
const MOD_ROLE_ID = "1391654796989169707";   // Replace with your actual mod role ID

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once("ready", () => {
  console.log(`✅ Discord bot is online as ${client.user.tag}`);
});

app.post("/modcall", async (req, res) => {
  const {
    username,
    userId,
    reason,
    targetUserId,
    targetUserName,
    jobId,
    placeId
  } = req.body;

  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID);
    if (!channel) return res.status(404).send("Channel not found");

    const robloxJoinLink = `roblox://placeId=${placeId}&jobId=${jobId}`;
    const robloxWebLink = `https://www.roblox.com/games/${placeId}?jobId=${jobId}`;

    const embedFields = [
      {
        name: "Caller",
        value: `[${username}](https://www.roblox.com/users/${userId}/profile)`,
        inline: true
      },
      {
        name: "Reason",
        value: reason || "*No reason provided*",
        inline: true
      }
    ];

    if (targetUserName && targetUserName.trim() !== "") {
      embedFields.push({
        name: "Target",
        value: `[${targetUserName}](https://www.roblox.com/users/${targetUserId}/profile)`,
        inline: true
      });
    } else if (targetUserId && !isNaN(Number(targetUserId))) {
      embedFields.push({
        name: "Target",
        value: `[User ${targetUserId}](https://www.roblox.com/users/${targetUserId}/profile)`,
        inline: true
      });
    } else {
      embedFields.push({
        name: "Target",
        value: "*Invalid or unknown target*",
        inline: true
      });
    }

    // Add server link with Join button
    embedFields.push({
      name: "Server Info",
      value: `Use the button below to join the game server.`
    });

    const joinButton = new ButtonBuilder()
      .setLabel("Join Server")
      .setStyle(ButtonStyle.Link)
      .setURL(robloxWebLink); // Use web URL, more mobile friendly

    const row = new ActionRowBuilder().addComponents(joinButton);

    await channel.send({
      content: `<@&${MOD_ROLE_ID}>`,
      embeds: [{
        title: "🚨 Mod Call",
        color: 0xff0000,
        fields: embedFields,
        timestamp: new Date().toISOString()
      }],
      components: [row]
    });

    res.send("✅ Mod call sent");
  } catch (err) {
    console.error("❌ Failed to send mod call:", err);
    res.status(500).send("Server error");
  }
});

client.login(DISCORD_TOKEN);
app.listen(PORT, () => console.log(`🌐 Express server live on port ${PORT}`));
