import {
	AudioPlayer,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	createAudioResource,
	entersState,
	joinVoiceChannel,
	StreamType,
	VoiceConnection,
	VoiceConnectionStatus
} from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';
import RadioBrowser, { Station } from 'radio-browser';
import type { Readable } from 'stream';

interface RadioOptions {
	query: string;
	voice: VoiceBasedChannel;
}

export class RadioPlayer {
	public connection: VoiceConnection | null;
	public player: AudioPlayer | null;
	public resource: AudioResource<Station>;
	public data: Station | null;

	public constructor(connection: VoiceConnection, resource: AudioResource<Station>, data: Station) {
		this.player = createAudioPlayer();
		this.connection = connection;
		this.resource = resource;
		this.data = data;

		this.connection?.on(VoiceConnectionStatus.Disconnected, async (_oldState, _newState) => {
			try {
				await Promise.race([
					entersState(this.connection!, VoiceConnectionStatus.Signalling, 5_000),
					entersState(this.connection!, VoiceConnectionStatus.Connecting, 5_000)
				]);
			} catch (error) {
				this.connection?.destroy();
				this.player?.stop();
			}
		});

		this.player.on(AudioPlayerStatus.Playing, () => {
			console.log('The audio player has started playing!');
		});
	}

	/**
	 * Plays the given query in the voice or stage channel
	 * @param {RadioOptions} options The options to provide for the radio
	 */
	public async play(options: RadioOptions) {
		const data = await RadioBrowser.searchStations({ name: options.query }).then((data) => data[0]);

		if (this.playing) {
			this.player?.stop();
			this.resource = createAudioResource(data.url_resolved as Readable, { inputType: StreamType.Arbitrary });
			this.playResource(data, this.resource);
		}

		if (!this.connection) await this.connect(options.voice);
		if (!this.player) this.player = createAudioPlayer();

		if (!data) throw new Error('No radio stations found!');

		this.resource = createAudioResource(data.url_resolved as Readable, { inputType: StreamType.Arbitrary });
		return this.playResource(data, this.resource);
	}

	public async search(query: string) {
		const data = await RadioBrowser.searchStations({ name: query }).then((data) => data[0]);
		return data.url_resolved;
	}

	/**
	 * Connects to the voice or stage channel
	 * @param {VoiceBasedChannel} voice The voice or stage channel
	 */
	public async connect(voice: VoiceBasedChannel) {
		this.connection = joinVoiceChannel({
			channelId: voice.id,
			guildId: voice.guild.id,
			adapterCreator: voice.guild.voiceAdapterCreator
		});

		try {
			return entersState(this.connection, VoiceConnectionStatus.Ready, 30000);
		} catch (error) {
			this.connection.destroy();
			throw error;
		}
	}

	/**
	 * @returns Disconnects the player
	 */
	public async disconnect() {
		if (this.connection) {
			await entersState(this.connection, VoiceConnectionStatus.Destroyed, 5000);
			this.connection.destroy();
			this.player?.stop();
			this.data = null;
		}
	}

	/**
	 * @returns The radio data
	 */
	public current() {
		return this.data;
	}

	/**
	 * @returns True or false, depending on if the player is playing
	 */
	public get playing() {
		if (this.player?.state.status !== AudioPlayerStatus.Idle) return true;
		return false;
	}

	private playResource(data, resource: AudioResource) {
		this.player?.play(resource);
		this.connection?.subscribe(this.player!);
		this.data = data;
		return this.data;
	}
}
