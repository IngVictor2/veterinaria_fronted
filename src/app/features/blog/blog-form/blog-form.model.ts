import { CategoriaBlog } from '../../../modelos/articulo-blog';
import { NuevoArticuloBlog } from '../../../servicios/blog.service';

/**
 * Modelo del formulario: todos los controles son textos o números simples.
 * No coincide con `ArticuloBlog` porque el identificador y la fecha los
 * genera el servicio, y el contenido y las etiquetas se escriben como texto.
 */
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

/**
 * Convierte el modelo del formulario en el modelo de datos que recibe el
 * servicio. Los párrafos se separan con una línea en blanco y las etiquetas
 * con comas.
 */
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
