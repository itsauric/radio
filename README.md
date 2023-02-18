# discord.js-radio

An npm module that uses radio-browser to play a radio with discord.js [this is an experimental module, do not expect it to work out of the box]

## Example

```js
const member = interaction.member as GuildMember;
const query = 'BBC Radio 1';

try {
	const connection = await connect(member.voice.channel!);
	const player = await play(interaction, { query });
	connection.subscribe(player);
	return interaction.reply('working');
} catch (e) {
	console.log(e);
	return interaction.reply('error');
}
```

## License

Dedicated to the public domain via the [Unlicense]
