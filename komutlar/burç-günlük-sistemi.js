const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('burc-günlük-sistem')
    .setDescription('Burç bilgi sistemini başlatır.')
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Burç yorumlarının gönderileceği kanal')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('kanal');

    if (!channel.isTextBased()) {
      return interaction.reply({ content: '❌ Lütfen bir metin kanalı seçin!', ephemeral: true });
    }

    if (client.burcKanali) {
      return interaction.reply(`❗ Burç bilgi sistemi zaten ${client.burcKanali} kanalında aktif.`);
    }

    client.burcKanali = channel;
    interaction.reply(`✅ Burç bilgi sistemi ${channel} kanalında aktif edildi.`);
    channel.send('🌟 Burç bilgi sistemi başlatıldı! Her 3 saatte bir burç yorumları burada görüntülenecek.');


    if (!client.burcKontrolIntervalId) {
      client.burcKontrolIntervalId = setInterval(() => checkBurcYorumlari(client), 3 * 60 * 60 * 1000); 
    }
  },
};


const burcEmojileri = {
  koc: '♈️',
  boga: '♉️',
  ikizler: '♊️',
  yengec: '♋️',
  aslan: '♌️',
  basak: '♍️',
  terazi: '♎️',
  akrep: '♏️',
  yay: '♐️',
  oglak: '♑️',
  kova: '♒️',
  balik: '♓️'
};

async function checkBurcYorumlari(client) {
  try {
    const burclar = [
      'koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik'
    ];

    for (const burc of burclar) {
      const response = await axios.get(`https://api.msidev.com.tr/burc?burc=${burc}`);
      if (response.data.success) {
        const data = response.data.data;

        const yeniYorum = data.gunluk_yorum;

        if (!yeniYorum || yeniYorum.trim() === '') {
          console.log(`${burc} burcu için yorum mevcut değil.`);
          continue;
        }

        if (client.burcKanali) {
          const messages = await client.burcKanali.messages.fetch({ limit: 100 });
          messages.forEach(async (msg) => {
            if (msg.author.bot) {
              await msg.delete();
            }
          });

          const burcEmoji = burcEmojileri[burc];

          const embed = new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle(`${burcEmoji} ${data.burc.charAt(0).toUpperCase() + data.burc.slice(1)} Burcu - Günlük Yorum`)
            .setDescription(data.gunluk_yorum)
            .addFields(
              { name: 'Tarih', value: data.tarih, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'Burç Yorumları' });

          await client.burcKanali.send({ embeds: [embed] });
        }
      } else {
        console.error('API Yanıtı Başarısız:', response.data);
      }
    }
  } catch (error) {
    console.error('Burç yorumları alınırken bir hata oluştu:', error.message);
    if (client.burcKanali) {
      await client.burcKanali.send('⚠️ Burç yorumları alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }
}
