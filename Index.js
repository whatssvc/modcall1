const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits } = require("discord.js");

const DISCORD_TOKEN = "MTM5MTY1NDE3MDA2MjQ4NzY2Mg.G6aPyG.zH7QJd6jjA59hp0inyZVE-5JIPMQNcz03QcExw";
const MOD_CHANNEL_ID = "1391646398977675364";
const MOD_ROLE_ID = "1391654796989169707"; // just the role ID, no <@& >

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

app.use(bodyParser.json());

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

app.post("/modcall", async (req, res) => {
  const { username, userId, reason, jobId, placeId } = req.body;
  const channel = await client.channels.fetch(MOD_CHANNEL_ID);

  if (!channel) return res.status(404).send("Channel not found");

  const serverLink = `roblox://placeId=${placeId}&jobId=${jobId}`;

  channel.send({
    content: `<@&${MOD_ROLE_ID}>`,
    embeds: [{
      title: "🚨 Mod Call Alert",
      color: 0xff0000,
      fields: [
        { name: "Caller", value: `[${username}](https://www.roblox.com/users/${userId}/profile)`, inline: true },
        { name: "Reason", value: reason || "*No reason provided*", inline: true },
        { name: "Server", value: `[Join Server](${serverLink})`, inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  });

  res.send("OK");
});

client.login(DISCORD_TOKEN);
app.listen(3000, () => console.log("Server listening on port 3000"));
