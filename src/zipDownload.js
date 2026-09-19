import JSZip from 'jszip';

export async function descargarZip(urls, nombre) {
  const zip = new JSZip();
  await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url);
      const blob = await res.blob();
      const filename = decodeURIComponent(url.split('/').pop());
      zip.file(filename, blob);
    })
  );
  const content = await zip.generateAsync({ type: 'blob' });
  const nombreArchivo = (nombre || 'musica').trim().toLowerCase().replace(/\s+/g, '-');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = nombreArchivo + '.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
