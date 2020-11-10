const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = process.env['PREFIX'];

function getMembers(voiceChannel) {
    return voiceChannel.members.filter(member => {
        return member.roles.cache.has('748681873567514664');
    });
}

function shuffle(array = []) {
    return array
        .map(a => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort).map(a => a.value);
}

const commands = {
    'status': (member, channel, args = []) => {
        const voiceChannel = member.voice.channel;
        const members = getMembers(voiceChannel);

        const mensagem = new Discord.MessageEmbed();
        mensagem.setTitle('Status Dojo');
        mensagem.setColor('#0099ff');
        mensagem.setTimestamp();

        mensagem.addField('Membros', members.map(e => e.user.tag).join('\n'));

        channel.send(mensagem);
    },
    'sorteio': (member, channel, args = []) => {
        if (!args[1]) {
            return channel.send(`Favor informar uma quantidade! Exemplo: ${prefix}sorteio 2`);
        }

        const qtdTimes = parseInt(args[1]);

        const voiceChannel = member.voice.channel;
        const members = getMembers(voiceChannel);

        if (qtdTimes >= (members.size - 1) || qtdTimes <= 1) {
            return channel.send('Quantidade inválida');
        }

        const quantidade = members.size;
        const sorted = shuffle(members);

        const qtdEquipe = Math.floor(quantidade / qtdTimes).toFixed();

        const times = [];
        for (let i = 0; i < qtdTimes; i++) {
            times.push(sorted.splice(0, qtdEquipe));
        }

        const sobra = sorted.filter(e => !times.flat().includes(e));
        for (let i = 0, j = 0; i < sobra.length; i++) {
            if (j === times.length) {
                j = 0;
            }

            times[j].push(sobra[i]);
            j = Math.min(j + 1, times.length);
        }

        const mensagem = new Discord.MessageEmbed();
        mensagem.setColor('#0099ff');
        mensagem.setTitle('Times Sorteados');
        mensagem.setTimestamp();

        times.forEach((time, i) => {
            mensagem.addField(`Time ${i + 1}`, time.map(e => e.user.tag).join('\n'));
        });

        channel.send(mensagem);
    }
}

client.on('ready', () => {
    console.log('Bot is ready');

    client.on('message', message => {
        const member = message.member;

        if (message.content.startsWith(prefix)) {
            const command = message.content.substr(1);
            const args = command.split(/\s+/g);

            if (commands[args[0]]) {
                commands[args[0]](member, message.channel, args);
            }
        }
    });
});

client.login(process.env['TOKEN']);