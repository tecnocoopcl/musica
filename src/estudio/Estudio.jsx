import { useCallback, useEffect, useRef, useState } from 'react';
import { escribirCatalogo, leerCatalogo } from '../catalogo/formato';
import { avisarAlDirectorio, fichaDeMusico } from './directorio';
import {
  CATALOGO,
  blobUrl,
  borrarArchivo,
  extension,
  guardarEnPod,
  hacerPublico,
  leerDelPod,
  slugUnico,
  subirArchivo,
} from './pod';
import './estudio.css';

const SITIO_PUBLICO = 'musica.aebn.cl';

// Un catálogo recién creado puede quedar sin lanzamientos; para el Estudio
// eso es una lista vacía, no un error.
function proyectosDe(doc) {
  return doc?.itemListElement?.length ? leerCatalogo(doc) : [];
}

function sinExtension(nombre) {
  const i = nombre.lastIndexOf('.');
  return i > 0 ? nombre.slice(0, i) : nombre;
}

export function Estudio({ espacio }) {
  const webId = espacio?.session?.webId;
  const [ficha, setFicha] = useState(undefined); // undefined: cargando · null: no es músico
  const [catalogo, setCatalogo] = useState(undefined); // { url, doc } | null
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setError(null);
    try {
      const [f, c] = await Promise.all([fichaDeMusico(webId), leerDelPod(espacio)]);
      setFicha(f);
      setCatalogo(c);
    } catch (err) {
      setError(err.message);
    }
  }, [espacio, webId]);

  useEffect(() => {
    if (webId) recargar();
  }, [webId, recargar]);

  if (!espacio) {
    return (
      <Pantalla>
        <h1>Estudio</h1>
        <p>El Estudio es donde los músicos de la cooperativa publican su música. Se abre desde espacio.</p>
      </Pantalla>
    );
  }
  if (!webId) {
    return (
      <Pantalla>
        <p>Inicia sesión en espacio para usar el Estudio.</p>
      </Pantalla>
    );
  }
  if (error && ficha === undefined) {
    return (
      <Pantalla>
        <p className="estudio-error">{error}</p>
        <button type="button" className="estudio-boton" onClick={recargar}>
          Reintentar
        </button>
      </Pantalla>
    );
  }
  if (ficha === undefined || catalogo === undefined) {
    return (
      <Pantalla>
        <p className="estudio-dim">Cargando…</p>
      </Pantalla>
    );
  }
  if (ficha === null) {
    return (
      <Pantalla>
        <h1>Estudio</h1>
        <p>Tu cuenta todavía no está habilitada como músico de la cooperativa.</p>
        <p className="estudio-dim">
          Pídelo a la cooperativa indicando tu WebID: <code>{webId}</code>
        </p>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <header className="estudio-header">
        <div>
          <h1>Estudio</h1>
          <p className="estudio-dim">
            {SITIO_PUBLICO}/{ficha.slug}
          </p>
        </div>
        <span className={`estudio-pill${ficha.publicado ? ' estudio-pill--ok' : ''}`}>
          {ficha.publicado ? 'Publicado' : 'Sin publicar'}
        </span>
      </header>

      <Catalogo espacio={espacio} ficha={ficha} doc={catalogo?.doc} />
      <Publicar espacio={espacio} webId={webId} ficha={ficha} onFicha={setFicha} />
    </Pantalla>
  );
}

function Pantalla({ children }) {
  return <main className="estudio">{children}</main>;
}

// El catálogo se arma aquí: el músico crea lanzamientos y sube portadas y
// canciones; catalogo.jsonld se escribe solo. Subir o borrar un archivo
// guarda el catálogo en el acto, para que nunca apunte a algo que no está.
function Catalogo({ espacio, ficha, doc }) {
  const catalogoUrl = espacio.paths.app(CATALOGO);
  const [nombre, setNombre] = useState(doc?.name ?? '');
  const [proyectos, setProyectos] = useState(() => proyectosDe(doc));
  const [guardado, setGuardado] = useState(() => JSON.stringify(doc ?? null));
  const [ocupado, setOcupado] = useState(null);
  const [error, setError] = useState(null);
  const [abierto, setAbierto] = useState(null);

  // Las subidas tardan; mientras, el músico puede seguir escribiendo. Al
  // terminar se guarda sobre lo último, no sobre lo que había al empezar.
  const actual = useRef({ nombre, proyectos });
  actual.current = { nombre, proyectos };

  const armar = (n, ps) => escribirCatalogo(ps, { nombre: n.trim() || undefined });
  const cambiado = JSON.stringify(armar(nombre, proyectos)) !== guardado;

  async function guardar(ps = actual.current.proyectos) {
    const d = armar(actual.current.nombre, ps);
    await guardarEnPod(espacio, d);
    setGuardado(JSON.stringify(d));
  }

  async function tarea(mensaje, fn) {
    setOcupado(mensaje);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(null);
    }
  }

  // Aplica un cambio a la lista y lo guarda en el pod.
  async function aplicar(fn) {
    const siguiente = fn(actual.current.proyectos);
    actual.current.proyectos = siguiente;
    setProyectos(siguiente);
    await guardar(siguiente);
  }

  const cambiarProyecto = (slug, parche) => (ps) => ps.map((p) => (p.slug === slug ? { ...p, ...parche(p) } : p));

  function editar(slug, parche) {
    setProyectos((ps) => cambiarProyecto(slug, () => parche)(ps));
  }

  function crear({ titulo, tipo }) {
    const slug = slugUnico(titulo, proyectos.map((p) => p.slug));
    const nuevo = {
      slug,
      titulo: nombre.trim() || ficha.slug,
      [tipo]: titulo,
      anio: new Date().getFullYear(),
      canciones: [],
    };
    setAbierto(slug);
    return tarea('Creando…', () => aplicar((ps) => [nuevo, ...ps]));
  }

  function subirPortada(p, file) {
    return tarea('Subiendo portada…', async () => {
      // Nombre nuevo en cada subida: así nadie ve la portada vieja en caché.
      const ruta = await subirArchivo(espacio, `portadas/${p.slug}-${Date.now()}.${extension(file.name)}`, file);
      await aplicar(cambiarProyecto(p.slug, () => ({ portada: ruta })));
      await borrarArchivo(espacio, p.portada).catch(() => {});
    });
  }

  function subirCanciones(p, files) {
    return tarea('Subiendo canciones…', async () => {
      const lista = [...files];
      for (const [n, file] of lista.entries()) {
        setOcupado(`Subiendo ${n + 1} de ${lista.length}: ${file.name}`);
        const actuales = actual.current.proyectos.find((x) => x.slug === p.slug)?.canciones ?? [];
        const slug = slugUnico(sinExtension(file.name), actuales.map((c) => c.slug));
        const ext = extension(file.name);
        const ruta = await subirArchivo(espacio, `audios/${p.slug}/${slug}.${ext}`, file);
        const cancion = {
          slug,
          titulo: sinExtension(file.name),
          archivos: [{ formato: ext, etiqueta: ext.toUpperCase(), url: ruta }],
        };
        await aplicar(cambiarProyecto(p.slug, (x) => ({ canciones: [...x.canciones, cancion] })));
      }
    });
  }

  async function borrarCancion(p, c) {
    const ok = await espacio.ui.confirm({
      title: 'Quitar canción',
      message: `¿Quitar "${c.titulo}"? El archivo se borra de tu pod.`,
      confirmLabel: 'Quitar',
      danger: true,
    });
    if (!ok) return;
    await tarea('Quitando…', async () => {
      await aplicar(cambiarProyecto(p.slug, (x) => ({ canciones: x.canciones.filter((y) => y.slug !== c.slug) })));
      for (const a of c.archivos) await borrarArchivo(espacio, a.url);
    });
  }

  async function borrarProyecto(p) {
    const ok = await espacio.ui.confirm({
      title: 'Borrar lanzamiento',
      message: `¿Borrar "${p.album || p.sencillo || p.titulo}" con su portada y sus ${p.canciones.length} canciones?`,
      confirmLabel: 'Borrar',
      danger: true,
    });
    if (!ok) return;
    await tarea('Borrando…', async () => {
      await aplicar((ps) => ps.filter((x) => x.slug !== p.slug));
      await borrarArchivo(espacio, p.portada);
      for (const c of p.canciones) for (const a of c.archivos) await borrarArchivo(espacio, a.url);
    });
  }

  function moverCancion(p, k, delta) {
    const canciones = [...p.canciones];
    const [c] = canciones.splice(k, 1);
    canciones.splice(k + delta, 0, c);
    editar(p.slug, { canciones });
  }

  return (
    <>
      <section className="estudio-seccion">
        <h2>Tu nombre público</h2>
        <p className="estudio-dim">Así apareces en el directorio de música de la cooperativa.</p>
        <input
          className="estudio-input-grande"
          value={nombre}
          placeholder={ficha.slug}
          onChange={(e) => setNombre(e.target.value)}
        />
      </section>

      <section className="estudio-seccion">
        <div className="estudio-seccion-titulo">
          <h2>Tus lanzamientos</h2>
        </div>

        <NuevoLanzamiento onCrear={crear} deshabilitado={Boolean(ocupado)} />

        {proyectos.length === 0 && (
          <p className="estudio-dim">Todavía no tienes lanzamientos. Crea el primero con su nombre.</p>
        )}

        {proyectos.map((p) => (
          <Lanzamiento
            key={p.slug}
            espacio={espacio}
            proyecto={p}
            catalogoUrl={catalogoUrl}
            abierto={abierto === p.slug}
            ocupado={Boolean(ocupado)}
            onEditar={(parche) => editar(p.slug, parche)}
            onPortada={(f) => subirPortada(p, f)}
            onCanciones={(fs) => subirCanciones(p, fs)}
            onBorrarCancion={(c) => borrarCancion(p, c)}
            onMover={(k, d) => moverCancion(p, k, d)}
            onEditarCancion={(k, parche) =>
              editar(p.slug, { canciones: p.canciones.map((c, m) => (m === k ? { ...c, ...parche } : c)) })
            }
            onBorrar={() => borrarProyecto(p)}
          />
        ))}
      </section>

      <div className="estudio-barra">
        <span className={error ? 'estudio-error' : 'estudio-dim'}>
          {ocupado || error || (cambiado ? 'Tienes cambios sin guardar' : 'Todo guardado en tu pod')}
        </span>
        <button
          type="button"
          className="estudio-boton"
          disabled={!cambiado || Boolean(ocupado)}
          onClick={() => tarea('Guardando…', () => guardar())}
        >
          Guardar cambios
        </button>
      </div>
    </>
  );
}

function NuevoLanzamiento({ onCrear, deshabilitado }) {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('album');

  function enviar(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onCrear({ titulo: titulo.trim(), tipo });
    setTitulo('');
  }

  return (
    <form className="estudio-nuevo" onSubmit={enviar}>
      <input placeholder="Nombre del álbum o sencillo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo">
        <option value="album">Álbum</option>
        <option value="sencillo">Sencillo</option>
      </select>
      <button type="submit" className="estudio-boton" disabled={deshabilitado || !titulo.trim()}>
        Crear
      </button>
    </form>
  );
}

function Portada({ espacio, url }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let vigente = true;
    let creado = null;
    setSrc(null);
    if (url) {
      blobUrl(espacio, url).then((u) => {
        creado = u;
        if (vigente) setSrc(u);
      });
    }
    return () => {
      vigente = false;
      if (creado) URL.revokeObjectURL(creado);
    };
  }, [espacio, url]);
  return src ? <img className="estudio-portada" src={src} alt="" /> : <div className="estudio-portada" />;
}

function Campo({ etiqueta, valor, onChange, multilinea, tipo = 'text', placeholder }) {
  const props = {
    value: valor ?? '',
    placeholder,
    onChange: (e) => onChange(tipo === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value),
  };
  return (
    <label className="estudio-campo">
      <span>{etiqueta}</span>
      {multilinea ? <textarea rows={3} {...props} /> : <input type={tipo} {...props} />}
    </label>
  );
}

function Lanzamiento({
  espacio,
  proyecto: p,
  catalogoUrl,
  abierto,
  ocupado,
  onEditar,
  onPortada,
  onCanciones,
  onBorrarCancion,
  onMover,
  onEditarCancion,
  onBorrar,
}) {
  const tipo = p.album !== undefined ? 'album' : 'sencillo';
  const nombreLanzamiento = p.album ?? p.sencillo ?? '';

  return (
    <details className="estudio-proyecto" open={abierto || undefined}>
      <summary>
        <Portada espacio={espacio} url={p.portada && new URL(p.portada, catalogoUrl).href} />
        <span>
          <strong>{nombreLanzamiento || p.titulo}</strong>
          <span className="estudio-dim">
            {' '}
            · {tipo === 'album' ? 'Álbum' : 'Sencillo'} · {p.canciones.length}{' '}
            {p.canciones.length === 1 ? 'canción' : 'canciones'}
          </span>
        </span>
      </summary>

      <div className="estudio-cuerpo">
        <div className="estudio-portada-editor">
          <Portada espacio={espacio} url={p.portada && new URL(p.portada, catalogoUrl).href} />
          <label className="estudio-boton estudio-boton--secundario">
            {p.portada ? 'Cambiar portada' : 'Subir portada'}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={ocupado}
              onChange={(e) => {
                if (e.target.files[0]) onPortada(e.target.files[0]);
                e.target.value = '';
              }}
            />
          </label>
        </div>

        <div className="estudio-grilla">
          <Campo
            etiqueta={tipo === 'album' ? 'Nombre del álbum' : 'Nombre del sencillo'}
            valor={nombreLanzamiento}
            onChange={(v) => onEditar({ [tipo]: v })}
          />
          <label className="estudio-campo">
            <span>Tipo</span>
            <select
              value={tipo}
              onChange={(e) =>
                onEditar({ album: undefined, sencillo: undefined, [e.target.value]: nombreLanzamiento })
              }
            >
              <option value="album">Álbum</option>
              <option value="sencillo">Sencillo</option>
            </select>
          </label>
          <Campo
            etiqueta="Artista o proyecto"
            valor={p.titulo}
            onChange={(v) => onEditar({ titulo: v })}
          />
          <Campo etiqueta="Género" valor={p.genero} onChange={(v) => onEditar({ genero: v || undefined })} />
          <Campo etiqueta="Año" tipo="number" valor={p.anio} onChange={(v) => onEditar({ anio: v })} />
        </div>
        <Campo
          etiqueta="Descripción"
          multilinea
          valor={p.descripcion}
          onChange={(v) => onEditar({ descripcion: v || undefined })}
        />

        <h3>Canciones</h3>
        {p.canciones.length === 0 && <p className="estudio-dim">Sube los audios: el título sale del nombre del archivo y lo puedes cambiar.</p>}
        <ol className="estudio-canciones">
          {p.canciones.map((c, k) => (
            <li key={c.slug}>
              <div className="estudio-cancion">
                <input
                  aria-label="Título"
                  value={c.titulo}
                  onChange={(e) => onEditarCancion(k, { titulo: e.target.value })}
                />
                <input
                  aria-label="Precio (CLP)"
                  type="number"
                  placeholder="Precio CLP"
                  value={c.precio ?? ''}
                  onChange={(e) => onEditarCancion(k, { precio: e.target.value ? Number(e.target.value) : undefined })}
                />
                <input
                  aria-label="Link de pago"
                  placeholder="Link de pago"
                  value={c.linkPago ?? ''}
                  onChange={(e) => onEditarCancion(k, { linkPago: e.target.value })}
                />
                <span className="estudio-acciones">
                  <button type="button" className="estudio-icono" aria-label="Subir" disabled={k === 0} onClick={() => onMover(k, -1)}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="estudio-icono"
                    aria-label="Bajar"
                    disabled={k === p.canciones.length - 1}
                    onClick={() => onMover(k, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="estudio-icono"
                    aria-label={`Quitar ${c.titulo}`}
                    disabled={ocupado}
                    onClick={() => onBorrarCancion(c)}
                  >
                    ×
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ol>
        <label className="estudio-boton estudio-boton--secundario">
          Agregar canciones…
          <input
            type="file"
            accept="audio/*"
            multiple
            hidden
            disabled={ocupado}
            onChange={(e) => {
              if (e.target.files.length) onCanciones(e.target.files);
              e.target.value = '';
            }}
          />
        </label>

        <h3>Escúchalo también en</h3>
        <ListaDeEnlaces
          items={p.streaming || []}
          onChange={(l) => onEditar({ streaming: l.length ? l : undefined })}
          placeholderNombre="Apple Music, YouTube…"
        />

        <h3>Aportes</h3>
        <div className="estudio-grilla">
          <Campo
            etiqueta="Link aporte mensual"
            valor={p.apoyo?.mensual}
            onChange={(v) => onEditar({ apoyo: { mensual: v, unico: p.apoyo?.unico || '' } })}
          />
          <Campo
            etiqueta="Link aporte único"
            valor={p.apoyo?.unico}
            onChange={(v) => onEditar({ apoyo: { mensual: p.apoyo?.mensual || '', unico: v } })}
          />
        </div>

        <button type="button" className="estudio-peligro" disabled={ocupado} onClick={onBorrar}>
          Borrar lanzamiento
        </button>
      </div>
    </details>
  );
}

function ListaDeEnlaces({ items, onChange, placeholderNombre }) {
  function set(i, parche) {
    onChange(items.map((it, j) => (j === i ? { ...it, ...parche } : it)));
  }
  return (
    <div className="estudio-enlaces">
      {items.map((it, i) => (
        <div key={i} className="estudio-enlace">
          <input placeholder={placeholderNombre} value={it.nombre} onChange={(e) => set(i, { nombre: e.target.value })} />
          <input placeholder="https://…" value={it.url} onChange={(e) => set(i, { url: e.target.value })} />
          <button
            type="button"
            className="estudio-icono"
            aria-label="Quitar enlace"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="estudio-boton estudio-boton--secundario"
        onClick={() => onChange([...items, { nombre: '', url: '' }])}
      >
        Agregar enlace
      </button>
    </div>
  );
}

function Publicar({ espacio, webId, ficha, onFicha }) {
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState(null);

  async function publicar() {
    const ok = await espacio.ui.confirm({
      title: 'Publicar tu música',
      message:
        'Tu música quedará visible para cualquiera y aparecerás en el directorio de música de la cooperativa.',
      confirmLabel: 'Publicar',
    });
    if (!ok) return;
    setPublicando(true);
    setError(null);
    try {
      await hacerPublico(espacio, webId);
      const f = await avisarAlDirectorio(webId);
      onFicha(f);
      if (!f.publicado) setError(f.error || 'El directorio no pudo leer tu catálogo');
      else await espacio.ui.notify({ message: 'Tu música está publicada' });
    } catch (err) {
      setError(err.message);
    } finally {
      setPublicando(false);
    }
  }

  return (
    <section className="estudio-seccion">
      <h2>Publicar</h2>
      {ficha.publicado ? (
        <p>
          Estás en el directorio como <strong>{ficha.nombre}</strong>.{' '}
          <span className="estudio-dim">Después de guardar cambios, vuelve a publicar para que se vean.</span>
        </p>
      ) : (
        <p className="estudio-dim">
          Cuando tengas al menos un lanzamiento con canciones, publícalo para que aparezca en {SITIO_PUBLICO}.
        </p>
      )}
      {error && <p className="estudio-error">{error}</p>}
      <button type="button" className="estudio-boton" disabled={publicando} onClick={publicar}>
        {publicando ? 'Publicando…' : ficha.publicado ? 'Volver a publicar' : 'Publicar'}
      </button>
    </section>
  );
}
