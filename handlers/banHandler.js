const {client} = require("../constants");
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, AuditLogEvent } = require("discord.js");
const { REST }  = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const guilds = require("../guilds.json");

client.on(Events.GuildBanAdd, async e => {

    const logs = await e.guild.fetchAuditLogs({limit: 1, type: AuditLogEvent.MemberBanAdd});
    if(logs.entries.first().executor.id !== client.user.id) {
        const Embed = new EmbedBuilder().setColor('#ff2828').setTitle(`Banned User: ${e.user.tag}`);
        if(e.reason === undefined) {
            e.reason = 'None'
        }
        Embed.addFields({name: 'Reason Provided:', value: `${e.reason}`, inline: false}, {name: 'User ID:', value: `${e.user.id}`, inline: true})
        const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('banHandler.share').setLabel('Share Ban').setStyle('Danger'))
        e.guild.channels.cache.get(guilds[e.guild.id]).send({embeds: [Embed], components: [button]})
    }
});

module.exports = {
    name: "banHandler",
    share: async function (interaction) {
        if(interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            const modal = new ModalBuilder().setCustomId('banHandler.submit').setTitle(`Share ban for: ${interaction.message.embeds[0].title.split(':')[1]}`)
            const reason = new TextInputBuilder().setCustomId('reason_paragraph').setLabel('Ban Reason').setPlaceholder('Fill out a brief ban reason to give other NintenHub servers an idea as to why the user was banned.',).setStyle(TextInputStyle.Paragraph).setMinLength(16).setMaxLength(512).setRequired(true)
            const reasonrow = new ActionRowBuilder().addComponents(reason)
            modal.addComponents(reasonrow)
            await interaction.showModal(modal)
        } else {
            interaction.reply({content: 'Only users with the ban member permission can use this button', ephemeral: true})
        }
    },

    submit: async function (interaction) {
        const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('banHandler.share').setLabel('Share Ban').setStyle('Danger').setDisabled(true))
        interaction.message.edit({components: [button]})
        const Embed = new EmbedBuilder();
        Embed.setColor('#ff2828');
        const rest = new REST({ version: '10' }).setToken(client.token);

        try {
            await rest.get(Routes.user(interaction.message.embeds[0].fields[1].value))
                .then(user => {
                    Embed.setTitle(`Shared Ban: ${user.username}#${user.discriminator}`);
                    if(user.avatar !== null) {Embed.setImage(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`)}
                    Embed.addFields(
                        {name: 'User ID:', value: user.id},
                        {name: 'Ban Reason:', value: interaction.components[0].components[0].value},
                        {name: 'Banned from:', value: `${interaction.guild.name}(${interaction.guild.id})`}
                    )

                    Object.keys(guilds).forEach(function (key) {
                        try {
                            if (key !== interaction.guild.id) {
                                console.log(user.id)
                                console.log(client.guilds.cache.get(key).members.cache.has(user.id))
                                if (client.guilds.cache.get(key).members.cache.has(user.id)) {
                                    client.guilds.cache.get(key).channels.cache.get(guilds[key]).send({embeds: [Embed]})
                                }
                            }
                        } catch (e) {
                            console.log(`No access to ${key}`)
                        }
                    });
                })
        } catch (error) {
            console.log(error)
        }
        interaction.reply({content: 'Ban has been shared with other NintenHub servers', ephemeral: true})
    }
}