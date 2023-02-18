# discord.js-radio

An npm module that uses radio-browser to play a radio with discord.js

### Disclaimer

This is an experimental module, do not expect this to work out of the box...

## Example Usage

```ts
import { RadioPlayer } from 'discord.js-radio';
<Client>.radio = new RadioPlayer();

// In your radio command file

const member = <Interaction>.member as <GuildMember>;
const query = 'BBC Radio One'

try {
	// await <Client>.radio.connect(member.voice.channel); -> his can be used however <Client>.radio.play(...) will automatically run this
	if (<Client>.radio.playing) return <Interaction>.reply({ content: 'A radio is already playing', ephemeral: true });
	await <Client>.radio.play({ query, voice: member.voice.channel! });

	const data = <Client>.radio.current();
	return <Interaction>.reply(data.name || 'Unknown radio');
} catch (e) {
	console.log(e);
	return <Interaction>.reply('An error has occurred!');
}
```

## License

Dedicated to the public domain via the [Unlicense]
