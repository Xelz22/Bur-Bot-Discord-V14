const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');


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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('burc')
    .setDescription('Burç yorumlarını alır')
    .addStringOption(option =>
      option.setName('burc')
        .setDescription('Günlük burç yorumu almak istediğiniz burç')
        .setRequired(true)
        .addChoices(
          { name: 'Koç', value: 'koc' },
          { name: 'Boğa', value: 'boga' },
          { name: 'İkizler', value: 'ikizler' },
          { name: 'Yengeç', value: 'yengec' },
          { name: 'Aslan', value: 'aslan' },
          { name: 'Başak', value: 'basak' },
          { name: 'Terazi', value: 'terazi' },
          { name: 'Akrep', value: 'akrep' },
          { name: 'Yay', value: 'yay' },
          { name: 'Oğlak', value: 'oglak' },
          { name: 'Kova', value: 'kova' },
          { name: 'Balık', value: 'balik' }
        )),

  async execute(interaction) {
    const burc = interaction.options.getString('burc');
    console.log(`Gelen burç: ${burc}`);

    try {
      const response = await axios.get(`https://api.msidev.com.tr/burc?burc=${burc}`);

      if (response.data.success) {
        const data = response.data.data;

        if (!data.gunluk_yorum || data.gunluk_yorum.trim() === '') {
          return interaction.reply({ content: `❗ ${burc.charAt(0).toUpperCase() + burc.slice(1)} burcu için bugünlük yorum mevcut değil.`, ephemeral: true });
        }

        
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

        interaction.reply({ embeds: [embed] });
      } else {
        console.error('API Yanıtı Başarısız:', response.data);
        interaction.reply({ content: 'Burç yorumu alınırken bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
      }
    } catch (error) {
      console.error('Burç verisi alınamadı:', error.message);
      interaction.reply({ content: `Burç yorumu alınırken bir hata oluştu: ${error.message}. Lütfen tekrar deneyin.`, ephemeral: true });
    }
  },
};
