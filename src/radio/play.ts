import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, StreamType } from '@discordjs/voice';
import type { Interaction } from 'discord.js';
import RadioBrowser from 'radio-browser';
import type { Readable } from 'stream';

export interface FilterOptions {
	by: string;
	searchterm: string;
}

/**
 * Plays the radio of the query provided
 * @param {Interaction} interaction The interaction used
 * @param {FilterOptions} options The filter options to pass in
 *
 */

const play = (interaction: Interaction, options: FilterOptions) => {
	if (!getVoiceConnection(interaction.guild!.id)) throw new Error('[discord.js-radio] A voice connection was not estabilished!');

	const player = createAudioPlayer();

	RadioBrowser.getStations({
		limit: 1,
		by: options.by || 'tag',
		searchterm: options.searchterm
	})
		.then((data) => {
			const resource = createAudioResource(data[0].url_resolved as Readable, { inputType: StreamType.Arbitrary });
			player.play(resource);
		})
		.catch((err) => {
			throw new Error(`[discord.js-radio] The following error occurred ${err}`);
		});

	return player && entersState(player, AudioPlayerStatus.Playing, 5000);
};

export { play };
