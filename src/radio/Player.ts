import {
	AudioPlayer,
	AudioPlayerStatus,
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

// interface Status {
// 	PLAYER_PLAYING: null;
// }

export class RadioPlayer {
	// public status: Status | null;
	private connection: VoiceConnection | null;
	private player: AudioPlayer | null;
	private radioData: Station | null;

	public constructor() {
		// this.status = null;
		this.connection = null;
		this.player = createAudioPlayer();
		this.radioData = null;
	}

	public async connect(voice: VoiceBasedChannel): Promise<void> {
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

	public async play(options: RadioOptions): Promise<void> {
		const { query, voice } = options;

		if (!this.connection) await this.connect(voice);
		if (!this.player) this.player = createAudioPlayer();
		if (this.player.state.status !== AudioPlayerStatus.Idle) {
			// this.status?.PLAYER_PLAYING = true;
			throw new Error('Player is already playing!');
		}

		// this.status?.PLAYER_PLAYING = false;

		const radioData = await RadioBrowser.searchStations({ name: query }).then((data) => data[0]);

		if (!radioData) throw new Error('No radio stations found!');

		const resource = createAudioResource(radioData.url_resolved as Readable, { inputType: StreamType.Arbitrary });

		this.player.play(resource);
		this.radioData = radioData;
		this.connection?.subscribe(this.player);
		// this.status?.PLAYER_PLAYING = true;
		this.connection?.on(VoiceConnectionStatus.Disconnected, async (_oldState, _newState) => {
			try {
				await Promise.race([
					entersState(this.connection!, VoiceConnectionStatus.Signalling, 5_000),
					entersState(this.connection!, VoiceConnectionStatus.Connecting, 5_000)
				]);
				// Seems to be reconnecting to a new channel - ignore disconnect
			} catch (error) {
				// Seems to be a real disconnect which SHOULDN'T be recovered from
				this.connection?.destroy();
				this.connection = null;
				this.player?.stop();
			}
		});

		await entersState(this.player, AudioPlayerStatus.Playing, 5000);
	}

	public async disconnect(): Promise<void> {
		if (this.connection) {
			await entersState(this.connection, VoiceConnectionStatus.Destroyed, 5000);
			this.connection = null;
			this.player?.stop();
			this.radioData = null;
		}
	}

	public getRadioData(): Station | null {
		return this.radioData;
	}
}
