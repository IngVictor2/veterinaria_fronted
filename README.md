# VetClinic — Landing pública (Angular 22)

VetClinic es una aplicación para administrar una clínica veterinaria: clientes, mascotas, citas, servicios, facturas y pagos.

La **vista principal de la SPA** es una landing pública en `/` con datos locales. No pide autenticación y no consulta una API. La aplicación completa (login, dashboard, citas reales, facturas, etc.) sigue disponible en las rutas autenticadas.

## 1. Datos del grupo

- **Grupo:** 6
- **Integrantes:** Victor Martinez y Francisco Garrido
- **Dominio:** clínica veterinaria VetClinic
- **Repositorio:** https://github.com/IngVictor2/veterinaria_fronted

## 2. Qué muestra la vista principal

La landing está construida con datos locales y permite consultar los registros del dominio y ejecutar una acción que cambia el estado.

### Secciones

1. **Encabezado:** navegación a Inicio, Quiénes somos, Servicios, Blog y Contacto. Muestra un contador cuando hay artículos guardados.
2. **Hero:** presentación de la clínica, accesos a la agenda y al blog, total de servicios, total de artículos y horario.
3. **Quiénes somos:** presentación de la clínica y sus valores de atención.
4. **Portafolio de servicios:** 7 servicios divididos en **Consulta** (4) y **Estética** (3). Permite filtrar por tipo y abrir el detalle.
5. **Blog de cuidado:** 10 artículos con búsqueda, filtro por categoría, artículo destacado, detalle y opción de guardar.
6. **Contacto:** formulario de demostración que valida los campos y muestra un mensaje local; no envía correos.
7. **Pie de página:** enlaces a las secciones, horario y accesos al sistema.

### Qué puedes probar

1. Filtrar los servicios por **Consulta** o **Estética**.
2. Abrir **Ver detalle** en una tarjeta de servicio.
3. Buscar artículos por título, resumen o etiqueta.
4. Filtrar el blog por categoría.
5. Guardar un artículo y ver cómo cambia el contador de la cabecera.
6. Abrir el detalle de un artículo.
7. Escribir una búsqueda sin resultados para ver el caso vacío con `@empty`.
8. Enviar el formulario de contacto y leer la confirmación local.

### Servicios incluidos

| Tipo | Servicios |
| --- | --- |
| Consulta | Consulta general, Consulta especializada, Vacunación, Consulta avanzada |
| Estética | Baño medicado, Corte de pelo, Limpieza dental |

## 3. Cómo ejecutar el proyecto

Necesitas **Node.js 20 o superior** y **npm**.

1. Instala las dependencias:

```bash
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm start
```

3. Abre la landing:

```text
http://localhost:4200/
```

Para comprobar que el proyecto compila:

```bash
npx ng build
```

Debe terminar con el mensaje `Application bundle generation complete.`

La aplicación completa consume una API configurada en `src/environments/` y `proxy.conf.json`. La landing pública **no depende de esa API**.

## 4. Palabras clave de Angular

- **Componente:** una pieza de la pantalla. Por ejemplo, una tarjeta de servicio o la barra superior.
- **Componente padre / hijo:** el padre contiene al hijo y le puede pasar datos. El hijo puede avisar al padre cuando ocurre algo.
- **Servicio:** una clase que guarda datos o funciones que se comparten entre varias partes de la app.
- **`providedIn: 'root'`:** hace que el servicio sea único para toda la aplicación.
- **Signal:** una "caja" que guarda un valor y avisa a Angular cuando ese valor cambia.
- **`asReadonly()`:** permite leer una señal desde fuera del servicio, pero no cambiarla directamente.
- **`computed()`:** un valor que se calcula a partir de otros valores y se actualiza solo cuando ellos cambian.
- **`input.required()`:** un dato obligatorio que un componente hijo recibe de su padre.
- **`output()`:** un evento que un componente hijo envía a su padre.
- **`model()`:** un input especial que permite leer y actualizar un valor en ambos sentidos.
- **Pipe:** una forma de transformar un valor para mostrarlo. Por ejemplo, `currency` muestra un precio en formato de moneda.
- **`@if`, `@for`, `@empty` y `@switch`:** instrucciones de Angular para mostrar contenido según una condición, repetir elementos, mostrar un mensaje cuando una lista está vacía o elegir entre varias opciones.
- **`track`:** le dice a `@for` qué identificador tiene cada elemento para no confundirlos cuando la lista cambia.
- **`router-outlet`:** el lugar donde Angular muestra la pantalla de la ruta actual.
- **Standalone:** un componente que no necesita un módulo (`NgModule`) para funcionar.
- **API REST:** el backend que entrega los datos reales de la aplicación. La landing no la usa.

## 5. Estructura de carpetas

```text
src/app/
├── modelos/
│   ├── articulo-blog.ts             # Interfaz ArticuloBlog y categorías
│   └── servicio-portafolio.ts       # Interfaz ServicioPortafolio y tipos
├── datos/
│   ├── articulos-blog.ts            # 10 artículos de ejemplo
│   └── servicios-portafolio.ts      # 7 servicios de consulta y estética
├── servicios/
│   └── blog.service.ts              # Estado del blog y de los guardados
├── pipes/
│   └── categoria-blog.pipe.ts       # Convierte la categoría en texto legible
└── componentes/
    └── inicio/
        ├── inicio-page/             # Página pública /
        ├── site-header/             # Encabezado; lee el contador de guardados
        ├── hero-section/            # Presentación e indicadores
        ├── quienes-somos-section/   # Presentación de la clínica y valores
        ├── servicios-section/       # Filtros y detalle de servicios
        ├── portafolio-card/         # Tarjeta de un servicio
        ├── blog-section/            # Búsqueda, filtros y detalle del blog
        ├── blog-card/               # Tarjeta de un artículo
        ├── contacto-section/        # Formulario de demostración
        └── site-footer/             # Pie de página
```

<details>
<summary>Ver el resto de la aplicación</summary>

```text
core/          Servicios HTTP, autenticación, guards, interceptores y utilidades.
shared/        Componentes reutilizables como tablas, buscadores y diálogos.
layouts/       auth-layout (login/registro) y default-layout (app autenticada).
features/      Pantallas de la app: auth, dashboard, citas, clientes, mascotas,
               facturas, pagos, servicios, empleados y admin.
app.routes.ts  Define las rutas de la aplicación.
```

</details>

## 6. Árbol de componentes

La indentación significa "está dentro de".

```text
App
└── InicioPageComponent                        (página /)
    ├── SiteHeaderComponent                    (barra superior)
    ├── HeroSectionComponent                   (presentación)
    ├── QuienesSomosSectionComponent           (quiénes somos)
    ├── ServiciosSectionComponent              (portafolio)
    │   └── PortafolioCardComponent × 7        (una tarjeta por servicio)
    ├── BlogSectionComponent                   (blog)
    │   └── BlogCardComponent × 10             (una tarjeta por artículo)
    ├── ContactoSectionComponent               (formulario)
    └── SiteFooterComponent                    (pie de página)
```

- **`InicioPageComponent`** arma la página y ordena las secciones.
- **`SiteHeaderComponent`** lee `BlogService.totalGuardados()` para mostrar el contador de artículos guardados. Es el mismo estado que modifica el blog.
- **`HeroSectionComponent`** muestra los totales de servicios y artículos.
- **`QuienesSomosSectionComponent`** presenta la clínica y sus valores.
- **`ServiciosSectionComponent`** filtra por tipo, abre el detalle y repite `PortafolioCardComponent` con `@for` y `track servicio.id`.
- **`PortafolioCardComponent`** recibe el servicio con `input.required()` y avisa al padre con `output()` cuando se pulsa **Ver detalle**.
- **`BlogSectionComponent`** busca, filtra, guarda artículos y abre el detalle. Repite `BlogCardComponent` con `@for` y `track articulo.id`.
- **`BlogCardComponent`** recibe el artículo con `input.required()` y el estado de guardado con `input()`, y envía dos eventos al padre con `output()`.
- **`ContactoSectionComponent`** valida el formulario y muestra una confirmación local.
- **`SiteFooterComponent`** cierra la página con enlaces y horario.

## 7. Contratos: qué recibe y qué envía cada componente

Un **contrato** es la forma en que un componente se comunica:

- **Input:** dato que recibe del componente padre.
- **Output:** evento que envía al componente padre.
- **—** significa que no tiene ese tipo de comunicación.

| Componente | Recibe (input) | Envía (output) | Para qué sirve |
| --- | --- | --- | --- |
| `InicioPageComponent` | — | — | Arma la página con todas las secciones. |
| `SiteHeaderComponent` | — | — | Navegación y contador de artículos guardados. |
| `HeroSectionComponent` | — | — | Presentación, accesos e indicadores. |
| `QuienesSomosSectionComponent` | — | — | Presenta la clínica y sus valores de atención. |
| `ServiciosSectionComponent` | — | — | Filtra servicios y controla el detalle. |
| `PortafolioCardComponent` | `servicio: ServicioPortafolio` (**required**) | `verDetalle: ServicioPortafolio` | Muestra un servicio y envía el registro al padre. |
| `BlogSectionComponent` | — | — | Búsqueda, filtros, guardados y detalle del blog. |
| `BlogCardComponent` | `articulo: ArticuloBlog` (**required**), `guardado: boolean` | `ver: ArticuloBlog`, `guardar: number` | Muestra un artículo y envía el registro o su id al padre. |
| `ContactoSectionComponent` | — | — | Formulario de contacto de demostración. |
| `SiteFooterComponent` | — | — | Enlaces, horario y acceso al sistema. |

<details>
<summary>Ver contratos de los componentes compartidos</summary>

Estos componentes se reutilizan en otras pantallas. No son necesarios para entender la landing, pero quedan documentados para R1.

| Componente | Recibe (input) | Envía (output) | Para qué sirve |
| --- | --- | --- | --- |
| `DataTableComponent<T>` | `columns: DataTableColumn[]` (required), `data: T[]` (required), `loading: boolean`, `emptyMessage: string`, `dimInactive: boolean` | `sort: string` | Tabla reutilizable con celdas y acciones proyectadas. |
| `CellTemplateDirective` | `key: string` (alias `appCell`, required) | — | Plantilla de celda por columna. |
| `ActionsTemplateDirective` | — | — | Plantilla de acciones por fila. |
| `SearchSelectComponent` | `value` (model), `options: SearchSelectOption[]`, `placeholder?: string`, `required: boolean`, `disabled: boolean` | — | Selector con búsqueda. |
| `ConfirmDialogComponent` | `title?: string`, `message: string` (required), `confirmText?: string`, `cancelText?: string`, `variant?: 'primary' \| 'error' \| 'warning' \| 'success'` | `confirm: void`, `cancel: void` | Diálogo de confirmación. |
| `SearchFilterComponent` | `value` (model), `placeholder?: string` | `search: void` | Campo de búsqueda con evento. |
| `PaginationBarComponent` | `page` (model, required), `totalPages: number`, `totalElements: number`, `size: number` | — | Paginación reutilizable. |
| `CalendarDayPickerComponent` | `value` (model), `idEmpleado?: number`, `tipoServicio?: string`, `minDate?: string` | — | Calendario de disponibilidad. |
| `LoadingSpinnerComponent` | `title?: string` | — | Indicador de carga. |
| `DefaultLayoutComponent` | — | — | Estructura de la app autenticada con barra lateral, encabezado y `router-outlet`. |
| `AuthLayoutComponent` | — | — | Estructura de las pantallas de login y registro con `router-outlet`. |

</details>

## 8. ¿Quién guarda el estado?

El **estado** son los datos que la aplicación necesita recordar. Si dos componentes necesitan el mismo dato, se guarda en un servicio para que ambos vean la misma información.

| Dato | Quién lo guarda | Por qué |
| --- | --- | --- |
| Artículos del blog (`ArticuloBlog[]`) | `BlogService` (`providedIn: 'root'`) | Son la fuente de la lista, la búsqueda y el detalle. La señal privada `_articulos` se lee con `articulos` (`asReadonly()`). |
| Filtro, búsqueda y artículos guardados | `BlogService` | El encabezado y el blog comparten el contador de guardados. Solo cambian con `cambiarCategoria()`, `cambiarBusqueda()`, `alternarGuardado()` y `reiniciarFiltros()`. |
| Totales del blog (`totalArticulos`, `totalGuardados`, `totalPorCategoria`, `articulosFiltrados`) | `BlogService` | Son valores `computed()`: se recalculan solos cuando cambian los artículos, el filtro o la búsqueda. |
| Servicios del portafolio (`ServicioPortafolio[]`) | `src/app/datos/servicios-portafolio.ts` | Es un catálogo de demostración que no cambia en tiempo de ejecución. El filtro y el detalle viven en `ServiciosSectionComponent`. |
| Sesión, token y permisos | `AuthService` | Los usan el login, los guards, el interceptor y el layout. Se guardan en un solo lugar para no duplicarlos. |
| Datos del servidor (clientes, mascotas, citas reales, facturas, pagos, servicios, empleados) | Servicios API (`CitasApiService`, `ClientesApiService`, etc.) | Solo hacen las peticiones HTTP. Cada página decide si guarda, filtra o pagina los datos que recibe. |
| Estado de tablas, diálogos y formularios | Componentes de página y componentes compartidos | Es estado de presentación o de un formulario. Se comunica con `input()`, `output()` y `model()`. |

## 9. Criterios R1–R6

| Criterio | Lo que pide | Dónde se cumple |
| --- | --- | --- |
| **R1** | README con integrantes, dominio, cómo ejecutar, árbol de componentes, tabla de contratos y dueño del estado. | Este archivo. |
| **R2** | Al menos 3 componentes propios; un hijo repetido con `@for`, `input.required()` y `output()`. | `InicioPageComponent`, `SiteHeaderComponent`, `HeroSectionComponent`, `QuienesSomosSectionComponent`, `ServiciosSectionComponent`, `BlogSectionComponent` y sus tarjetas. `BlogCardComponent` se repite con `@for (articulo of blog.articulosFiltrados(); track articulo.id)` y usa `input.required()` y `output()`. |
| **R3** | Servicio en root, señal privada con `asReadonly()`, métodos con nombre, `computed` visible y encabezado leyendo el mismo estado. | `src/app/servicios/blog.service.ts`: `_articulos`, `_categoria`, `_busqueda` y `_guardados` son privadas; se exponen con `asReadonly()`. `SiteHeaderComponent` lee `totalGuardados()` y el blog lo modifica con `alternarGuardado()`. |
| **R4** | `@if`, `@for` con `track`, `@empty`, `@switch` o varias ramas, pipes con `es-CO` y un pipe propio. | `blog-section.component.ts` y `servicios-section.component.ts`; `categoria-blog.pipe.ts`; locale `es-CO` en `app.config.ts`; pipes `currency`, `date` y `number` con `es-CO`. |
| **R5** | Interfaz en `modelos/`, al menos 8 registros en `datos/` y un caso límite visible. | `src/app/modelos/articulo-blog.ts` y `servicio-portafolio.ts`; `src/app/datos/articulos-blog.ts` (10 registros) y `servicios-portafolio.ts` (7 registros). Una búsqueda sin resultados muestra el `@empty` del blog. |
| **R6** | Estructura, repositorio público, sin `node_modules`, commits de todos y PDF. | Estructura de `modelos/`, `datos/`, `servicios/`, `pipes/` y `componentes/inicio/`; `.gitignore` excluye `node_modules`; repositorio público; commits de ambos integrantes. El PDF se entrega en el aula. |

## 10. Preguntas rápidas

**¿La landing necesita backend?**
No. Usa datos locales y funciona sin API.

**¿El formulario de contacto envía correos?**
No. Es una demostración local: valida los campos y muestra una confirmación en pantalla.

**¿Dónde cambio los servicios del portafolio?**
En `src/app/datos/servicios-portafolio.ts`. Edita el arreglo `PORTAFOLIO_SERVICIOS` y guarda.

**¿Dónde cambio los artículos del blog?**
En `src/app/datos/articulos-blog.ts`. Edita el arreglo `ARTICULOS_BLOG` y guarda.

**¿Dónde se guardan los artículos marcados?**
En `BlogService`, en memoria del navegador. Si recargas la página, vuelven a quedar sin guardar.

**¿Cuál es la diferencia entre la landing y la app completa?**
La landing usa datos locales. La app completa usa la API para clientes, mascotas, citas reales, facturas, pagos, servicios y empleados.

## 11. Verificación

```bash
npx ng build
git shortlog -sn
```

- `npx ng build` debe terminar sin errores.
- `git shortlog -sn` muestra cuántos commits tiene cada integrante.
- El repositorio no incluye `node_modules`; se instala con `npm install`.

## 12. Repositorio y despliegue

- **Repositorio:** https://github.com/IngVictor2/veterinaria_fronted
- **Landing en producción:** https://veterinaria-one-nu.vercel.app/
- **Login:** https://veterinaria-one-nu.vercel.app/login

Vercel publica automáticamente los cambios de la rama `main`.
