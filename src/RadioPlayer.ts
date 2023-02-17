import { createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import type { StageChannel, VoiceChannel } from 'discord.js';
import RadioBrowser from 'radio-browser';
import ytdl from 'ytdl-core';

export interface FilterOptions {
	limit: 1;
	by: string;
	searchterm: string;
}

export default class RadioPlayer {
	public play(voice: VoiceChannel | StageChannel, options: FilterOptions) {
		let stream;

		RadioBrowser.getStations(options)
			.then((data) => {
				console.log(data.url_resolved);
				stream = ytdl(data.url_resolved, { filter: 'audioonly' });
			})
			.catch((err) => console.log(err));

		const player = createAudioPlayer();
		const resource = createAudioResource(stream);
		const connection = joinVoiceChannel({
			channelId: voice.id,
			guildId: voice.guild.id,
			adapterCreator: voice.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
		});

		connection.subscribe(player);
		player.play(resource);
	}
}
