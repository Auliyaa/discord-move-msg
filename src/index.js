const _configparser = require('configparser');
const _bot          = require('./bot');

async function __main__()
{
  // parse configuration
  console.log(`.. reading configuration from ${process.argv[2]}`);
  const config = new _configparser();
  config.read(process.argv[2]);

  // create the client & connect to discord
  const b = new _bot.bot(config);
  await b.connect();
}

__main__();
