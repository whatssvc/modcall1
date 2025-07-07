const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits } = require("discord.js");

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
  const { username, userId, reason, target, jobId, placeId } = req.body;

  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID);
    if (!channel) return res.status(404).send("Channel not found");

    const robloxLink = `roblox://placeId=${placeId}&jobId=${jobId}`;

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
      },
      {
        name: "Server",
        value: `**Copy and paste to join:**\n\`\`\`\n${robloxLink}\n\`\`\``
      }
    ];

    // Only add Target field if a valid target user ID is provided
    if (target && !isNaN(target)) {
      embedFields.splice(2, 0, {
        name: "Target",
        value: `[User ${target}](https://www.roblox.com/users/${target}/profile)`,
        inline: true
      });
    } else if (target !== undefined) {
      embedFields.splice(2, 0, {
        name: "Target",
        value: "*Invalid or unknown target*",
        inline: true
      });
    }

    await channel.send({
      content: `<@&${MOD_ROLE_ID}>`,
      embeds: [{
        title: "🚨 Mod Call",
        color: 0xff0000,
        fields: embedFields,
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
