const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('burclar')
    .setDescription('Bütün burçların günlük yorumlarını alır ve belirtilen kanala gönderir.')
    .addChannelOption(option => 
      option.setName('kanal')
        .setDescription('Burç yorumlarının gönderileceği kanal')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal');
    
    if (!channel.isTextBased()) {
      return interaction.reply({ content: '❌ Lütfen bir metin kanalı seçin!', ephemeral: true });
    }

    const burclar = [
      'koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik'
    ];

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

    await interaction.reply({ content: '🟢 Burç yorumları alınıyor... Lütfen bekleyin.' });

    try {

      const messages = await channel.messages.fetch({ limit: 100 }); 
      await channel.bulkDelete(messages).catch(err => console.error('Mesajlar silinemedi:', err)); 

      for (const burc of burclar) {
        const response = await axios.get(`https://api.msidev.com.tr/burc?burc=${burc}`);
        console.log(response.data);

        if (response.data && response.data.success && response.data.data) {
          const data = response.data.data;

          // Burç yorumu yoksa geç
          if (!data.gunluk_yorum || data.gunluk_yorum.trim() === '') {
            console.log(`${burc} burcu için yorum mevcut değil.`);
            await channel.send(`❗ ${data.burc.charAt(0).toUpperCase() + data.burc.slice(1)} burcu için bugünlük yorum mevcut değil.`);
            continue;
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

          await channel.send({ embeds: [embed] });

          
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error(`${burc} burcunun yorumu alınamadı:`, response.data);
        }
      }

      await interaction.followUp({ content: '✅ Burç yorumları başarıyla gönderildi!' });

    } catch (error) {
      console.error('Burç yorumları alınırken bir hata oluştu:', error.response ? error.response.data : error.message);
      await interaction.followUp({ content: '⚠️ Burç yorumları alınırken bir hata oluştu. Lütfen tekrar deneyin.' });
    }
  },
};
