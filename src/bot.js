const discord = require('discord.js');

/// main class for our bot
class bot
{
  constructor(config)
  {
    this.config = config;
    this.client = new discord.Client();
    this.admins = this.config.get('general','admins').split(':');
  }

  /// return the global command prefix character
  get prefix()
  {
    let r = this.config.get('general', 'prefix');
    return r ? r : '!';
  }

  /// connect using the token provided in the configuration
  connect()
  {
    return new Promise(resolve => {
      this.client.on('ready', () =>
      {
        console.log("client connected");
        resolve('ok');
      });
      this.client.on('message', (msg) => {
        this.on_message(msg);
      });
      this.client.login(this.config.get('general', 'discord_token'));
    });
  }

  disconnect()
  {
    // TODO
  }


  on_message(msg)
  {
    if (!msg.content.startsWith(this.prefix + 'move') || !this.admins.includes(msg.author.id)) return;

    // parse arguments: !move <msg-id> <target-channel-id>
    let args = msg.content.split(' ');
    let msg_id = null;
    let channel_id = null;

    if (args.length >= 2) msg_id = args[1];
    if (args.length >= 3) channel_id = args[2];

    if (msg_id == null || channel_id == null) return;

    console.log('>> moving msg #' + msg_id + ' to channel #' + channel_id);

    // locate destination channel
    let dst_channel = this.client.channels.resolve(channel_id)

    // locate source message
    msg.channel.messages.fetch(msg_id, true).then((src_msg) => {
      // fetch original message contents
      let content = src_msg.content;
      let opts = {};

      // look for attachements in the source message
      if (src_msg.attachments)
      {
        opts.files = [];
        for (let attachment of src_msg.attachments)
        {
          opts.files.push({
            attachment: attachment[1].attachment,
            name      : attachment[1].name
          });
        }
      }

      // send a copy of the source message then delete the original.
      dst_channel.send(`Message posté par <@${msg.author.id}> sur le canal <#${msg.channel.id}>:\n${content}`,
                       opts).then(() => {
                         src_msg.delete({ reason: "message moved"} ).catch((err) => {
                           console.error(err);
                           msg.channel.send("Impossible de supprimer le message ! (vérifier les permissions)");
                         });
                       }).catch((err) => {
                         console.error(err);
                         msg.channel.send("Impossible de copier le message ! (vérifier les permissions)");
                       });
    }).catch((err) => {
      console.error(err);
      msg.channel.send("Message introuvable !");
    });

  }
}

module.exports.bot = bot;
