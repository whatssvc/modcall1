const express = require("express");
const bodyParser = require("body-parser");
const axios = require('axios');
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(bodyParser.json());

// Discord bot token
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const PORT = process.env.PORT || 3000;

// Roblox API URL for banning users
const ROBLOX_BAN_API_URL = 'https://ban-api-3qdb.onrender.com/banUser'; // Your actual Roblox ban API URL

// Mod channel and role information
const MOD_CHANNEL_ID = "1391646398977675364";
const MOD_ROLE_ID = "1391654796989169707";

// Set up Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// On bot ready
client.once("ready", () => {
  console.log(`✅ Discord bot is online as ${client.user.tag}`);
});

// Command to ban from Discord and Roblox
client.on('messageCreate', async (message) => {
  if (message.content.startsWith('?dcban')) {
    const user = message.mentions.users.first();
    if (user) {
      // Discord ban command
      try {
        await message.guild.members.ban(user);
        message.channel.send(`${user.tag} has been banned from Discord.`);
      } catch (err) {
        console.error(err);  // Log the error for debugging
        message.channel.send('An error occurred while banning the user from Discord.');
      }
    } else {
      message.channel.send('Please mention a valid user.');
    }
  }

  if (message.content.startsWith('?dcrbxban')) {
    const user = message.mentions.users.first();
    if (user) {
      // Discord + Roblox ban command
      try {
        await message.guild.members.ban(user);  // Ban from Discord

        // Send request to Roblox server-side API to ban from Roblox
        const response = await axios.post(ROBLOX_BAN_API_URL, {
          userId: user.id  // Make sure to send the correct Roblox user ID here
        });

        if (response.data.success) {
          message.channel.send(`${user.tag} has been banned from both Discord and Roblox.`);
        } else {
          message.channel.send('Failed to ban the user from Roblox.');
          console.error(response.data); // Log response for debugging
        }
      } catch (err) {
        console.error(err);  // Log the error for debugging
        message.channel.send('An error occurred while banning the user.');
      }
    } else {
      message.channel.send('Please mention a valid user.');
    }
  }
});

// Mod call API to notify the team
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

    // Both PC and mobile copy methods
    embedFields.push({
      name: "Join Server",
      value:
        `🖥️ **PC Users:** Copy and paste this into Roblox:\n` +
        `\`\`\`\n${robloxLink}\n\`\`\`\n` +
        `📱 **Mobile Users:** Tap and hold to copy:\n` +
        `\`${robloxLink}\`\n\n` +
        `🧠 Paste into your browser to join directly.`
    });

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

// Start the Discord client and Express server
client.login(DISCORD_TOKEN);
app.listen(PORT, () => console.log(`🌐 Express server live on port ${PORT}`));
