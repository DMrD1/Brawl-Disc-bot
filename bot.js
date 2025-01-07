require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.BRAWL_API_KEY;
const PLAYER_TAG = process.env.PLAYER_TAG;
const DISCORD_AUTH_TOKEN = process.env.DISCORD_AUTH_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!API_KEY || !PLAYER_TAG || !DISCORD_AUTH_TOKEN || !GUILD_ID) {
  console.error("Missing API_KEY, PLAYER_TAG, DISCORD_AUTH_TOKEN, or GUILD_ID in .env file!");
  process.exit(1);
}

const fetchPlayerInfo = async () => {
  try {
    const response = await axios.get(`https://api.brawlstars.com/v1/players/%23${PLAYER_TAG}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    const user = response.data.name;
    const trophies = response.data.highestTrophies.toLocaleString();
    const brawlers = response.data.brawlers;

    const rank30Count = brawlers.filter(brawler => brawler.rank > 50).length;

    console.clear();
    console.log("Trophies:", trophies);

    await updateDiscordNickname(user, trophies, rank30Count);
  } catch (error) {
    console.error("Error fetching player info:", error.response?.data || error.message);
  }
};

const updateDiscordNickname = async (user, trophies, rank30Count) => {
  const nickName = `${user} |${trophies}🏆|${rank30Count} Tier Max|`;
  try {
    const response = await fetch(`https://discord.com/api/v9/guilds/${GUILD_ID}/members/@me`, {
      method: "PATCH",
      headers: {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": DISCORD_AUTH_TOKEN,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        nick: nickName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Discord API Error: ${JSON.stringify(errorData)}`);
    }

    console.log("Nickname:", nickName);
  } catch (error) {
    console.error("Error updating Discord nickname:", error.message);
  }
};

fetchPlayerInfo();
setInterval(fetchPlayerInfo, 300000); // Fetch every 5 minutes
