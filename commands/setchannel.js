const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const guilds = require('../guilds.json')
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('set a target channel for Ban Notifications')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Target channel')
                .setRequired(true))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),


    execute: async function (interaction) {

        guilds[interaction.guildId] = interaction.options.getChannel('channel').id;
        fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => {
            if (err) console.log(err);
        });
        interaction.reply({ content: `Cross Server Ban notifications will now appear in ${interaction.options.getChannel('channel')}`, ephemeral: true });
    },
}