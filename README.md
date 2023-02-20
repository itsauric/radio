# discord.js-radio

An npm module that uses radio-browser to play a radio with discord.js

### Disclaimer

This is an experimental module, do not expect this to work out of the box...

## Example Usage

```ts
// In your main file
import { RadioPlayer } from 'discord.js-radio';
<Client>.radio = new RadioPlayer();

// In your command file

const member = <Interaction>.member as <GuildMember>;
const query = 'BBC Radio One'
const data = <Client>.radio.current()?.name || 'Unknown Radio';

try {
	await <Client>.radio.play({ query, voice: member.voice.channel! });
	if (<Client>.radio.playing) {
		const newData = <Client>.radio.current()?.name || 'Unknown Radio';
		return <Interaction>.reply({ content: `Switching to: **${newData}** from **${data}**` });
	}

	return <Interaction>.reply(`Now playing: **${data}**`);
} catch (error) {
	console.log(error);
	return <Interaction>.reply('No radios were found...');
}
```

## License

Dedicated to the public domain via the [Unlicense]
