import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';
import { createDiscordJSAdapter } from '../utils/adapter';

/**
 * Connects to the voice or stage channel
 * @param {VoiceBasedChannel} voice The voice or stage channel
 *
 */

const connect = async (voice: VoiceBasedChannel) => {
	const connection = joinVoiceChannel({
		channelId: voice.id,
		guildId: voice.guild.id,
		adapterCreator: createDiscordJSAdapter(voice)
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
};

export { connect };
