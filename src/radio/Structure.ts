import type { VoiceBasedChannel } from 'discord.js';

export interface Station {
	name: string;
	url: string;
	url_resolved: string;
}

export interface RadioOptions {
	query: string;
	voice: VoiceBasedChannel;
}
