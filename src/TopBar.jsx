import { useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { ConectarModal } from './ConectarModal';
import { desconectar } from './pod/solid';
import { IconMenu, IconSearch, IconClose } from './player/icons';

// "usuario-aebn" de https://pods-rpi-tc.aebn.cl/usuario-aebn/profile/card#me
function nombreCorto(webId) {
  try {
    const url = new URL(webId);
    return url.pathname.split('/').filter(Boolean)[0] || url.hostname;
  } catch {
    return webId;
  }
}

function Cuenta({ sesion }) {
  const [conectando, setConectando] = useState(false);

  if (!sesion.conectada) {
    return (
      <>
        <button type="button" className="topbar-conectar" onClick={() => setConectando(true)}>
          Conectar<span className="topbar-conectar-extra"> con WebID</span>
        </button>
        {conectando && <ConectarModal onClose={() => setConectando(false)} />}
      </>
    );
  }

  const nombre = nombreCorto(sesion.webId);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="topbar-avatar" aria-label={`Cuenta: ${nombre}`}>
          {nombre.slice(0, 1).toUpperCase()}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu" align="end" sideOffset={8}>
          <DropdownMenu.Label className="menu-label">
            <strong>{nombre}</strong>
            <span className="menu-webid">{sesion.webId}</span>
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="menu-sep" />
          <DropdownMenu.Item className="menu-item" onSelect={() => desconectar().then(() => window.location.reload())}>
            Desconectar
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function TopBar({ sesion, busqueda, onBusqueda, onMenu, menuAbierto }) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-menu"
        aria-label="Menú"
        aria-expanded={menuAbierto}
        aria-controls="sidebar"
        onClick={onMenu}
      >
        <IconMenu />
      </button>

      <form className="topbar-buscar" role="search" onSubmit={(e) => e.preventDefault()}>
        <IconSearch />
        <input
          type="search"
          placeholder="Buscar canciones, álbumes o artistas"
          aria-label="Buscar"
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
        />
        {busqueda && (
          <button type="button" className="topbar-buscar-limpiar" aria-label="Limpiar búsqueda" onClick={() => onBusqueda('')}>
            <IconClose />
          </button>
        )}
      </form>

      <Cuenta sesion={sesion} />
    </header>
  );
}
