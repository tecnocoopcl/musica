import { DropdownMenu } from 'radix-ui';
import { useMusica } from './contexto';
import { IconPlaylistAdd, IconPlus } from './player/icons';

// cancion: { src, titulo, artista }
export function AgregarAPlaylist({ cancion }) {
  const { biblioteca } = useMusica();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="track-video" aria-label={`Agregar ${cancion.titulo} a una playlist`}>
          <IconPlaylistAdd />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu" align="end" sideOffset={4}>
          <DropdownMenu.Label className="menu-label">Agregar a playlist</DropdownMenu.Label>
          {biblioteca.playlists.map((p) => {
            const yaEsta = p.canciones.some((c) => c.src === cancion.src);
            return (
              <DropdownMenu.Item
                key={p.id}
                className="menu-item"
                disabled={yaEsta}
                onSelect={() => biblioteca.agregarAPlaylist(p.id, cancion)}
              >
                {p.nombre}
                {yaEsta && <span className="menu-item-nota">ya está</span>}
              </DropdownMenu.Item>
            );
          })}
          {biblioteca.playlists.length > 0 && <DropdownMenu.Separator className="menu-sep" />}
          <DropdownMenu.Item
            className="menu-item"
            onSelect={() => biblioteca.crearPlaylist(`Mi playlist #${biblioteca.playlists.length + 1}`, [cancion])}
          >
            <IconPlus />
            Nueva playlist
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
