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
	private connection: VoiceConnection | null;
	private player: AudioPlayer | null;
	private data: Station | null;
	private resource: AudioResource | null;

	public constructor() {
		this.player = createAudioPlayer();
		this.connection = null;
		this.resource = null;
		this.data = null;
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
			await this.playResource(data, this.resource);
		}

		if (!this.connection) await this.connect(options.voice);
		if (!this.player) this.player = createAudioPlayer();

		if (!data) throw new Error('No radio stations found!');

		this.resource = createAudioResource(data.url_resolved as Readable, { inputType: StreamType.Arbitrary });
		await this.playResource(data, this.resource);
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
			await entersState(this.connection, VoiceConnectionStatus.Ready, 30000);
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
			this.connection = null;
			this.player?.stop();
			this.data = null;
		}
	}

	// /**
	//  * Pauses the current resource
	//  * @returns Boolean of the resource pause state
	//  */
	// public pause() {
	// 	return this.player?.pause() as boolean;
	// }

	// /**
	//  * Unpauses the current resource
	//  * @returns Boolean of the resource unpause state
	//  */
	// public unpause() {
	// 	return this.player?.unpause() as boolean;
	// }

	// /**
	//  * Sets the volume for the current resource
	//  * @param {Number} volume The volume to set
	//  */
	// public setVolume(volume: number) {
	// 	return this.resource?.volume?.setVolumeLogarithmic(volume / 100);
	// }

	/**
	 * @returns The radio data
	 */
	public current(): Station | null {
		return this.data;
	}

	// /**
	//  * @returns The current resource volume
	//  */
	// public get volume() {
	// 	return this.resource?.volume?.volume;
	// }

	/**
	 * @returns True or false, depending on if the player is playing
	 */
	public get playing() {
		if (this.player?.state.status !== AudioPlayerStatus.Idle) return true;
		return false;
	}

	private async playResource(data, resource: AudioResource) {
		this.player?.play(resource);

		this.data = data;
		this.connection?.subscribe(this.player!);

		if (this.connection?.listeners.name !== VoiceConnectionStatus.Disconnected) {
			this.connection?.on(VoiceConnectionStatus.Disconnected, async (_oldState, _newState) => {
				try {
					await Promise.race([
						entersState(this.connection!, VoiceConnectionStatus.Signalling, 5_000),
						entersState(this.connection!, VoiceConnectionStatus.Connecting, 5_000)
					]);
				} catch (error) {
					this.connection?.destroy();
					this.connection = null;
					this.player?.stop();
				}
			});

			await entersState(this.player!, AudioPlayerStatus.Playing, 5000);
		}

		if (this.connection?.listeners.name !== VoiceConnectionStatus.Destroyed) {
			this.connection?.on(VoiceConnectionStatus.Destroyed, (_oldState, _newState) => {
				this.connection?.destroy();
				this.connection = null;
				this.player?.stop();
			});
		}

		return this.data;
	}
}
