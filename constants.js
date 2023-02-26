const { Client, GatewayIntentBits, Partials  } = require('discord.js')

module.exports = Object.freeze({
    client: new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildWebhooks
        ], partials: [
            Partials.Channel
        ] })
});