import type { StageChannel, VoiceChannel } from 'discord.js';
import type RadioPlayer from './RadioPlayer';
import type { FilterOptions } from './RadioPlayer';
interface radioPlayer extends RadioPlayer {
	play(voice: VoiceChannel | StageChannel, options: FilterOptions): any;
}
export default radioPlayer;
