# @auric/radio

A module that uses radio-browser to search and play a radio with discord.js

## Installation 

```console
yarn add @auric/radio
npm install @auric/radio
```

## Example Usage

```ts
// In your main file
import { RadioPlayer } from '@auric/radio';
<Client>.radio = new RadioPlayer();

// In your command file

const member = <Interaction>.member as <GuildMember>;
const query = 'BBC Radio One'

await <Interaction>.deferReply();

try {
	const data = await <Client>.radio.play({ query, voice: member.voice.channel! });
	return <Interaction>.editReply(`Now playing: **${data.name}**`);
} catch (error) {
	await <Interaction>.editReply('An error has occurred');
	console.log(error);
}
```

## Example Usage with External Music Packages

```ts
// In your main file
import { Player } from 'discord-player';
import { RadioPlayer } from '@auric/radio';

<Client>.player = new Player();
<Client>.radio = new RadioPlayer();

// In your command file

const member = <Interaction>.member as <GuildMember>;
const query = 'BBC Radio One'

await <Interaction>.deferReply();

try {
	const radio = await <Client>.radio.search(query);
	const res = await <Client>.player.play(member.voice.channel!.id, radio);
	return <Interaction>.editReply({ content: `Successfully enqueued: **${res.track.title}**`});
} catch (error) {
	await <Interaction>.editReply('An error has occurred');
	console.log(error);
}
```

## License

Dedicated to the public domain via the [Unlicense]
