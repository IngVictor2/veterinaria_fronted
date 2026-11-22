import { CategoriaBlog } from '../../../modelos/articulo-blog';
import { NuevoArticuloBlog } from '../../../servicios/blog.service';

export interface FormularioArticulo {
  titulo: string;
  autor: string;
  categoria: CategoriaBlog | '';
  resumen: string;
  contenido: string;
  minutosLectura: number | null;
  etiquetas: string;
  destacado: boolean;
}

export function convertirArticulo(valor: FormularioArticulo): NuevoArticuloBlog {
  if (!valor.categoria) {
    throw new Error('La categoría es obligatoria para publicar un artículo.');
  }

  const contenido = valor.contenido
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter((parrafo) => parrafo.length > 0);

  const etiquetas = [
    ...new Set(
      valor.etiquetas
        .split(',')
        .map((etiqueta) => etiqueta.trim().toLocaleLowerCase('es-CO'))
        .filter((etiqueta) => etiqueta.length > 0),
    ),
  ];

  return {
    titulo: valor.titulo.trim(),
    autor: valor.autor.trim(),
    categoria: valor.categoria,
    resumen: valor.resumen.trim(),
    contenido,
    minutosLectura: valor.minutosLectura ?? 1,
    etiquetas,
    destacado: valor.destacado,
  };
}
