const DiscordJs = require('discord.js');
const Config = require('./config');
const Permission = require('./permission');
const Embed = require('./embed');
const Commands = require('../config/commands.json');
const Responses = require('../config/responses.json');

const embedBuddy = new DiscordJs.Client();
const settings = Config.getConfigs();

// memulai bot
const init = () => {
    registerListeners();
    embedBuddy.login(settings.BOT_TOKEN);
};

// pendengar event untuk bot event
const registerListeners = () => {
    embedBuddy.on('ready', () => {
        console.log(`Logged in as ${embedBuddy.user.tag}!`);
    });

    embedBuddy.on('message', msg => {
        msgHandler(msg);
    });
};

const msgHandler = (msg) => {
    // mengabaikan pesan bot
    if (msg.author.bot) return;
    //cek pesan tidak dimulai dengan trigger
    if (!(msg.content).startsWith(settings.BOT_TRIGGER)) return;
    // cek izin pengguna
    if (!Permission.check(msg)) {
        sendResponse(msg, Responses.NO_PERMISSION);
        return;
    }

    // mengambil data dari pesan pengguna
    let discordData = (msg.content).split(settings.BOT_TRIGGER)[1].trim();

    // cek jika ini bukan custom command
    if (!Commands[discordData]) {
        // mengambil embed data objek
        let embedData = Embed.getEmbedData(discordData);
        // membuat embed
        let customEmbed = Embed.getEmbed(embedData);
        // mengirim custom embed kediscord
        sendResponse(msg, customEmbed, embedData.chName);

    } else {
        // mengirim respon untuk custom cmd
        sendResponse(msg, Commands[discordData]);
    }

};

// mengirim respon kembali ke discord
const sendResponse = (msg, str, chName = "") => {
    try {
        if (chName == "") {
            msg.channel.send(str);
        } else {
            const channel = embedBuddy.channels.find(channels => channels.name == chName);
            channel.send(str);
        }
    } catch(e) {
        msg.channel.send(Responses.MSG_SEND_ERROR);
    }
    // hapus chat dalam cmd 1 detik jika diaktifkan
    if (settings.COMMAND_AUTO_DELETE) {
        msg.delete(1000);
    }
};

module.exports = {
    init
};