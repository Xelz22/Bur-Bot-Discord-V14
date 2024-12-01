const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('burc-bilgi-sistemi-kapat')
    .setDescription('Burç bilgi sistemini kapatır')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

  async execute(interaction, client) {
  
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
    }

    if (!client.burcKanali) {
      return interaction.reply('❌ Burç bilgi sistemi zaten kapalı.');
    }

    client.burcKanali = null;
    if (client.burcKontrolIntervalId) {
      clearInterval(client.burcKontrolIntervalId);
      client.burcKontrolIntervalId = null;
    }

    interaction.reply('✅ Burç bilgi sistemi başarıyla kapatıldı.');
  },
};
