import {
  IconPlay,
  IconPause,
  IconPrev,
  IconNext,
  IconShuffle,
  IconRepeat,
  IconVolume,
} from './player/icons';
import { formatTime } from './player/format';

export function PlayerBar({ player }) {
  const { currentTrack } = player;
  if (!currentTrack) return null;

  const progress = player.duration ? (player.currentTime / player.duration) * 100 : 0;

  return (
    <div className="player-bar">
      <div className="player-bar-track">
        <img className="player-cover" src={currentTrack.portada} alt="" />
        <span id="player-titulo">
          {currentTrack.titulo} — {currentTrack.proyectoTitulo}
        </span>
      </div>

      <div className="player-bar-center">
        <div className="player-controls">
          <button
            className={`player-toggle-btn${player.shuffle ? ' is-active' : ''}`}
            aria-label="Aleatorio"
            aria-pressed={player.shuffle}
            onClick={player.toggleShuffle}
          >
            <IconShuffle />
          </button>
          <button aria-label="Anterior" onClick={player.prev}>
            <IconPrev />
          </button>
          <button
            id="player-toggle"
            className={player.isPlaying ? 'is-playing' : ''}
            aria-label="Reproducir / pausar"
            onClick={player.toggle}
          >
            {player.isPlaying ? <IconPause /> : <IconPlay />}
          </button>
          <button aria-label="Siguiente" onClick={player.next}>
            <IconNext />
          </button>
          <button
            className={`player-toggle-btn${player.repeatMode !== 'off' ? ' is-active' : ''}`}
            aria-label="Repetir"
            aria-pressed={player.repeatMode !== 'off'}
            data-mode={player.repeatMode}
            onClick={player.cycleRepeat}
          >
            <IconRepeat />
            {player.repeatMode === 'one' && <span className="player-repeat-one">1</span>}
          </button>
        </div>
        <div className="player-progress-wrap">
          <span id="player-time-current">{formatTime(player.currentTime)}</span>
          <input
            type="range"
            id="player-progress"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            aria-label="Progreso de la canción"
            aria-valuetext={`${formatTime(player.currentTime)} de ${formatTime(player.duration)}`}
            onChange={(e) => player.seekToRatio(Number(e.target.value) / 100)}
          />
          <span id="player-time-total">{formatTime(player.duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <IconVolume />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={player.volume}
          aria-label="Volumen"
          onChange={(e) => player.setVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
