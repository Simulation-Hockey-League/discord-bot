import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from 'typings/command';

const gifs = [
  'https://tenor.com/view/rat-dumb-silly-hamster-happy-rat-gif-9734756581361076180',
  'https://tenor.com/view/happy-hamp-ter-gif-1544070803255349723',
  'https://tenor.com/view/yes-gif-18049151746772451590',
  'https://tenor.com/view/hamster-hamster-doodle-hamster-meme-meme-gif-12563427307977316821',
  'https://tenor.com/view/heh-gif-3471944577404549074',
  'https://tenor.com/view/boombahh-gif-1333911931721308312',
  'https://tenor.com/view/secret-evil-hamster-gif-10545177198537770929',
  'https://tenor.com/view/hamster-hamster-meme-hampter-stupid-hampter-stupid-hamster-gif-16706152603246380038',
  'https://tenor.com/view/om-nom-nom-gif-13707462873994461292',
  'https://tenor.com/view/happy-hamster-anvil-meme-goofy-gif-1607739801956171520',
  'https://tenor.com/view/goofy-happy-hamster-star-wand-ballerina-gif-9699198830228842952',
  'https://tenor.com/view/joy-hamster-happy-crying-happy-tears-gif-6146588356797264501',
  'https://tenor.com/view/waffascraffa-hamster-meme-happy-hamster-joyous-chiikawa-happy-gif-16374986407687065427',
  'https://tenor.com/view/happy-hamster-meme-tears-teary-eyes-sad-gif-4608653560286864331',
];

export default {
  command: new SlashCommandBuilder()
    .setName('kahri')
    .setDescription('Sends a random Kahri GIF.'),

  execute: async (interaction) => {
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    await interaction.reply({
      content: randomGif,
      ephemeral: true,
    });
  },
} satisfies SlashCommand;
