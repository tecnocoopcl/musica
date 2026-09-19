export function Nav() {
  return (
    <header className="musica-header">
      <a className="musica-header-logo" href="https://aebn.cl">
        AEBN
      </a>
      <nav aria-label="Principal">
        <ul>
          <li>
            <a href="https://aebn.cl">Inicio</a>
          </li>
          {/* más enlaces de tecnocoop van aquí */}
        </ul>
      </nav>
    </header>
  );
}
