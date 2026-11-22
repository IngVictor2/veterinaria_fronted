# VetClinic — SPA con landing pública y blog (Angular 22)

VetClinic es una aplicación para administrar una clínica veterinaria: clientes, mascotas, citas, servicios, facturas y pagos.

La SPA tiene dos zonas:

- **Zona pública:** landing en `/`, blog en `/blog`, detalle en `/blog/:id` y alta de artículos en `/blog/nuevo`. Usa datos locales y no pide autenticación; solo el asistente de contacto consulta un servicio externo.
- **Zona autenticada:** login, dashboard, clientes, mascotas, citas reales, facturas, pagos, servicios, empleados y administración. Usa la API configurada en `src/environments/`.

## 1. Datos del grupo

- **Grupo:** 6
- **Integrantes:** Victor Martinez y Francisco Garrido
- **Dominio:** clínica veterinaria VetClinic
- **Repositorio:** https://github.com/IngVictor2/veterinaria_fronted

## 2. Entrega 2: rutas, formulario reactivo y búsqueda

La Entrega 2 amplía la SPA de la Entrega 1 con navegación entre vistas, un detalle por parámetro, una vista 404, un formulario de alta reactivo con validación y una búsqueda que reacciona a lo que escribe el usuario. Los datos locales del blog siguen vigentes.

### 2.1 Tabla de rutas

| Ruta | Vista | Parámetro | Carga |
| --- | --- | --- | --- |
| `/` | `InicioPageComponent` (landing) | — | `loadComponent` |
| `/blog` | `BlogListComponent` (listado y búsqueda) | Query param opcional `creado` | `loadComponent` |
| `/blog/nuevo` | `BlogFormComponent` (alta reactiva) | — | `loadComponent` |
| `/blog/:id` | `BlogDetailComponent` (detalle) | `id` entregado con `input()` | `loadComponent` |
| `/404` y `**` | `NotFoundComponent` (vista 404) | — | `loadComponent` |
| `/login`, `/register` | Login y registro | — | `loadComponent` |
| `/dashboard`, `/clientes`, `/mascotas`, `/citas`, `/facturas`, `/pagos`, `/servicios`, `/empleados`, `/admin/*` | Zona autenticada | Varios `:id` | `loadComponent` |

La estructura pública se comparte con `LandingLayoutComponent`, que monta una sola vez el encabezado, el `router-outlet` y el pie. La landing y las vistas del blog se cargan por separado con `loadComponent`.

### 2.2 Detalle por parámetro con `input()`

En `src/app/app.config.ts` se registra `withComponentInputBinding()`. La ruta `blog/:id` activa `BlogDetailComponent`, que declara:

```ts
readonly id = input.required<string>();
readonly articulo = computed(() => {
  const id = Number(this.id());
  return Number.isInteger(id) ? this.blog.obtenerPorId(id) : undefined;
});
```

El router entrega el parámetro `id` directamente al input, sin `ActivatedRoute.snapshot`. Si el identificador no existe, la vista muestra **“No encontramos el artículo #99999”** y enlaces para volver al blog o al inicio. Ejemplo: `http://localhost:4300/blog/99999`.

### 2.3 Vista 404

Las rutas `404` y `**` cargan `NotFoundComponent`. La vista muestra el código 404, la dirección intentada y accesos al inicio y al blog. Ejemplo: `http://localhost:4300/ruta-inexistente`.

### 2.4 Formulario de alta reactivo

#### Por qué se usa un formulario reactivo y no uno basado en plantillas (RF-E2-04)

El alta de artículos usa **formularios reactivos** (`ReactiveFormsModule` + `FormBuilder`) y no formularios basados en plantillas (`ngModel` + `FormsModule`) por estas razones:

1. **Modelo tipado y explícito:** cada campo es un control con su tipo (`string`, `number`, `CategoriaBlog | ''`). El modelo del formulario queda en la clase y TypeScript detecta errores antes de compilar.
2. **Un control por campo:** los ocho campos (`titulo`, `autor`, `categoria`, `resumen`, `contenido`, `minutosLectura`, `etiquetas`, `destacado`) tienen su propio control y sus validadores.
3. **Validación centralizada:** las reglas se declaran junto al control, no repartidas entre atributos HTML y expresiones de la plantilla. El validador propio `tituloUnico` se reutiliza y se prueba por separado.
4. **Conversión clara al modelo de datos:** `convertirArticulo()` transforma `FormularioArticulo` en `NuevoArticuloBlog` (separa párrafos, normaliza etiquetas y recorta textos) antes de llamar al servicio.
5. **Errores y estado controlables:** el mensaje se muestra solo si el control está `touched` o `dirty`, y el botón se deshabilita con `formulario.invalid`.
6. **Pruebas:** el formulario se puede instanciar y validar sin depender del DOM; las pruebas cubren el mínimo, el máximo y el validador propio.

Un formulario con `ngModel` habría mezclado el modelo con la plantilla, habría dificultado el tipado fuerte y no habría dejado un modelo de formulario separado del modelo de datos.

#### Controles y validadores

| Control | Validadores integrados | Validador propio | Mensaje principal |
| --- | --- | --- | --- |
| `titulo` | `required`, `minLength(10)`, `maxLength(90)` | `tituloUnico` | Obligatorio, longitud o título repetido |
| `autor` | `required`, `minLength(5)`, `maxLength(60)` | — | Obligatorio o longitud |
| `categoria` | `required` | — | Selecciona una categoría |
| `resumen` | `required`, `minLength(40)`, `maxLength(220)` | — | Obligatorio o longitud |
| `contenido` | `required`, `minLength(120)` | — | Obligatorio o mínimo de caracteres |
| `minutosLectura` | `required`, `min(1)`, `max(60)` | — | Obligatorio o fuera de rango |
| `etiquetas` | `required`, `pattern` | — | Obligatorio o comas mal escritas |
| `destacado` | — | — | Es un booleano opcional |

Se usan **seis validadores integrados distintos** (`required`, `minLength`, `maxLength`, `min`, `max` y `pattern`), más el validador propio `tituloUnico`, que impide repetir un título sin importar mayúsculas, tildes o espacios.

#### Alta y actualización del listado

`BlogFormComponent.publicar()` hace lo siguiente:

1. Comprueba que el formulario sea válido.
2. Convierte el modelo con `convertirArticulo()`.
3. Llama a `BlogService.crearArticulo()`, que genera el id y la fecha, y agrega el artículo al inicio de la señal privada `_articulos`.
4. Reinicia el formulario.
5. Navega a `/blog?creado=<id>`; el listado lee el query param y muestra el aviso **“El artículo se publicó y ya aparece en el listado”**.

Como el listado y el formulario comparten la misma señal de `BlogService`, el artículo aparece sin recargar la página ni volver a pedir datos.

### 2.5 Búsqueda reactiva

`BlogListComponent` y la sección de blog de la landing usan un `FormControl` y este flujo:

```ts
this.buscador.valueChanges
  .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
  .subscribe((valor) => this.blog.cambiarBusqueda(valor));
```

- `valueChanges` escucha cada tecla.
- `debounceTime(300)` espera 300 ms desde la última tecla.
- `distinctUntilChanged()` evita repetir la misma búsqueda.
- `takeUntilDestroyed()` cierra la suscripción cuando se destruye el componente; no quedan suscripciones abiertas.

Si se escriben tres caracteres en menos de 300 ms, el filtro se actualiza una sola vez, 300 ms después de la última tecla. La búsqueda ignora mayúsculas y tildes y revisa título, resumen, autor, categoría y etiquetas.

### 2.6 `routerLinkActive` y carga diferida

El encabezado usa `routerLinkActive` en **Inicio** (coincidencia exacta) y **Blog** (coincidencia por prefijo, también activa en `/blog/:id` y `/blog/nuevo`). El enlace activo recibe la clase `nav-link-active` y `aria-current="page"` gracias a `ariaCurrentWhenActive`.

Todas las rutas públicas usan `loadComponent`, incluido el layout público. Así, la landing y el blog se descargan en fragmentos separados y el paquete inicial se mantiene por debajo del presupuesto.

### 2.7 Casos de verificación de la Entrega 2

| Entrada | Resultado esperado | Cómo comprobarlo |
| --- | --- | --- |
| Formulario con todos los campos vacíos | Un mensaje por control después de tocarlo; envío deshabilitado | Abrir `/blog/nuevo`, recorrer los campos y mirar el botón **Publicar artículo** |
| `minutosLectura` con `0` y luego con `1` | Con `0`, error de mínimo; con `1`, sin error | Escribir `0`, salir del campo; luego `1` |
| Título de un artículo existente y luego corregido | Mensaje del validador propio; desaparece al cambiarlo | Copiar el título de un artículo del listado y modificarlo |
| Formulario válido y envío | El artículo aparece en `/blog` sin recargar y el formulario se reinicia | Publicar y volver a `/blog/nuevo` |
| Tres caracteres en menos de 300 ms | Una sola filtración, 300 ms después de la última tecla | Escribir rápido en la búsqueda de `/blog` |
| `/blog/99999` y `/ruta-inexistente` | Mensaje de artículo no encontrado y vista 404 | Abrir ambas direcciones |

## 3. Qué muestra la SPA

### 3.1 Landing pública (`/`)

1. **Encabezado:** navegación a Inicio, Quiénes somos, Servicios, Blog y Contacto. Muestra un contador cuando hay artículos guardados.
2. **Hero:** presentación de la clínica, accesos a la agenda y al portafolio, y estado de atención calculado con el horario local.
3. **Quiénes somos:** propósito, diferenciales y compromiso.
4. **Servicios:** portafolio con filtros por tipo y detalle en modal.
5. **Blog:** artículo destacado, búsqueda con debounce, filtros por categoría, tarjetas y un enlace a `/blog`.
6. **Contacto:** asistente virtual, tabla de horario única y preguntas frecuentes.
7. **Pie:** enlaces, ubicación, «Cómo llegar» y acceso al sistema.

### 3.2 Blog público

- **`/blog`:** listado completo con búsqueda reactiva, filtros, contador de resultados, botón **Publicar artículo** y aviso cuando se crea un artículo.
- **`/blog/:id`:** detalle con categoría, autor, fecha, minutos de lectura, párrafos, etiquetas y guardado. Si el id no existe, muestra el mensaje de no encontrado.
- **`/blog/nuevo`:** formulario reactivo de alta con validación visible y envío deshabilitado mientras sea inválido.

### 3.3 Zona autenticada

Login, registro, dashboard, clientes, mascotas, citas, facturas, pagos, servicios, empleados y administración de roles y permisos. Estas vistas consumen la API y están protegidas por guards.

## 4. Cómo ejecutar el proyecto

```bash
npm install
npm start -- --port 4300
```

Abrir `http://localhost:4300`. El puerto 4300 se usa en este README para no chocar con otros proyectos locales; si el 4200 está libre, `npm start` también funciona.

Para compilar y probar:

```bash
npx ng build
npx ng test --watch=false
```

La aplicación completa consume una API configurada en `src/environments/` y `proxy.conf.json`. La landing y el blog **no dependen de esa API**; el asistente de contacto usa `environment.chatbotUrl`.

## 5. Palabras clave de Angular

- **Componente:** una pieza de la pantalla. Por ejemplo, una tarjeta de artículo o la barra superior.
- **Componente padre / hijo:** el padre contiene al hijo y le puede pasar datos. El hijo puede avisar al padre cuando ocurre algo.
- **Servicio:** una clase que guarda datos o funciones que se comparten entre varias partes de la app.
- **`providedIn: 'root'`:** hace que el servicio sea único para toda la aplicación.
- **Signal:** una “caja” que guarda un valor y avisa a Angular cuando ese valor cambia.
- **`asReadonly()`:** permite leer una señal desde fuera del servicio, pero no cambiarla directamente.
- **`computed()`:** un valor que se calcula a partir de otros valores y se actualiza solo cuando ellos cambian.
- **`input()` / `input.required()`:** un dato que el componente recibe del padre o del router.
- **`output()`:** un evento que un componente hijo envía a su padre.
- **`model()`:** un input especial que permite leer y actualizar un valor en ambos sentidos.
- **`loadComponent`:** carga diferida de una vista cuando el usuario entra a su ruta.
- **`routerLink` / `routerLinkActive`:** navegación entre rutas y marca del enlace activo.
- **`withComponentInputBinding()`:** hace que el router entregue parámetros, query params y datos de ruta a los `input()` del componente.
- **Formulario reactivo:** el modelo y los validadores viven en la clase, no en la plantilla. Se usa `FormBuilder` y `ReactiveFormsModule`.
- **`valueChanges`:** observable que emite cada cambio de un control.
- **`debounceTime(300)`:** espera 300 ms sin cambios antes de emitir.
- **`distinctUntilChanged()`:** no repite un valor igual al anterior.
- **`takeUntilDestroyed()`:** cierra una suscripción cuando se destruye el componente.
- **Pipe:** una forma de transformar un valor para mostrarlo. Por ejemplo, `currency` muestra un precio en formato de moneda.
- **`@if`, `@for`, `@empty` y `@switch`:** instrucciones de Angular para mostrar contenido según una condición, repetir elementos, mostrar un mensaje cuando una lista está vacía o elegir entre varias opciones.
- **`track`:** le dice a `@for` qué identificador tiene cada elemento para no confundirlos cuando la lista cambia.
- **`router-outlet`:** el lugar donde Angular muestra la pantalla de la ruta actual.
- **Standalone:** un componente que no necesita un módulo (`NgModule`) para funcionar.
- **Vista 404:** pantalla que se muestra cuando ninguna ruta coincide con la dirección.
- **API REST:** el backend que entrega los datos reales de la aplicación. La landing y el blog usan datos locales; solo el asistente de contacto consulta un servicio externo.

## 6. Estructura de carpetas

```text
src/app/
├── modelos/
│   ├── articulo-blog.ts             # Interfaz ArticuloBlog y categorías
│   └── servicio-portafolio.ts       # Interfaz ServicioPortafolio y tipos
├── datos/
│   ├── articulos-blog.ts            # 10 artículos de ejemplo
│   ├── clinica.ts                   # Horario, festivos y estado de atención
│   └── servicios-portafolio.ts      # 7 servicios de consulta y estética
├── servicios/
│   ├── blog.service.ts              # Estado del blog, guardados y alta
│   └── blog.service.spec.ts         # Pruebas del servicio
├── pipes/
│   └── categoria-blog.pipe.ts       # Convierte la categoría en texto legible
├── layouts/
│   ├── landing-layout/              # Encabezado + router-outlet + pie público
│   ├── auth-layout/                 # Login y registro
│   └── default-layout/              # App autenticada
├── componentes/
│   ├── inicio/
│   │   ├── inicio-page/             # Página pública /
│   │   ├── site-header/             # Encabezado y routerLinkActive
│   │   ├── hero-section/            # Presentación y estado de atención
│   │   ├── quienes-somos-section/   # Propósito y diferenciales
│   │   ├── servicios-section/       # Filtros y detalle de servicios
│   │   ├── portafolio-card/         # Tarjeta de un servicio
│   │   ├── blog-section/            # Vista previa del blog en la landing
│   │   ├── blog-card/               # Tarjeta de un artículo
│   │   ├── contacto-section/        # Asistente, horario y preguntas frecuentes
│   │   └── site-footer/             # Pie de página
│   └── not-found/                   # Vista 404
├── features/
│   └── blog/
│       ├── blog-list/               # Listado y búsqueda reactiva
│       ├── blog-detail/             # Detalle por input() y no encontrado
│       └── blog-form/               # Alta con FormBuilder y validador propio
│           ├── blog-form.model.ts   # Modelo del formulario y conversión
│           └── titulo-unico.validator.ts
└── app.routes.ts                    # Rutas públicas, autenticadas y 404
```

<details>
<summary>Ver el resto de la aplicación</summary>

```text
core/          Servicios HTTP, autenticación, guards, interceptores y utilidades.
shared/        Componentes reutilizables como tablas, buscadores y diálogos.
layouts/       landing-layout, auth-layout y default-layout.
features/      auth, dashboard, citas, clientes, mascotas, facturas, pagos,
               servicios, empleados, admin y blog.
```

</details>

## 7. Árbol de componentes

La indentación significa “está dentro de”.

```text
App
├── LandingLayoutComponent                 (encabezado + router-outlet + pie)
│   ├── SiteHeaderComponent                (navegación y contador de guardados)
│   ├── RouterOutlet
│   │   ├── InicioPageComponent            (ruta /)
│   │   │   ├── HeroSectionComponent
│   │   │   ├── QuienesSomosSectionComponent
│   │   │   ├── ServiciosSectionComponent
│   │   │   │   └── PortafolioCardComponent × 7
│   │   │   ├── BlogSectionComponent
│   │   │   │   └── BlogCardComponent × N
│   │   │   └── ContactoSectionComponent
│   │   ├── BlogListComponent              (ruta /blog)
│   │   │   └── BlogCardComponent × N
│   │   ├── BlogDetailComponent            (ruta /blog/:id)
│   │   └── BlogFormComponent              (ruta /blog/nuevo)
│   └── SiteFooterComponent
└── NotFoundComponent                      (rutas /404 y **)
```

- **`LandingLayoutComponent`** comparte el encabezado y el pie entre la landing y el blog.
- **`InicioPageComponent`** ordena las secciones de la landing.
- **`SiteHeaderComponent`** lee `BlogService.totalGuardados()` y marca el enlace activo con `routerLinkActive`.
- **`BlogListComponent`** usa `FormControl`, `valueChanges`, `debounceTime(300)` y `distinctUntilChanged`; repite `BlogCardComponent` con `@for` y `track articulo.id`.
- **`BlogDetailComponent`** recibe `id` con `input.required()` y muestra el artículo o el mensaje de no encontrado.
- **`BlogFormComponent`** usa `FormBuilder`, validadores integrados, el validador propio `tituloUnico` y `convertirArticulo()`.
- **`NotFoundComponent`** muestra la vista 404 y la dirección intentada.

## 8. Contratos: qué recibe y qué envía cada componente

- **Input:** dato que recibe del componente padre o del router.
- **Output:** evento que envía al componente padre.
- **—** significa que no tiene ese tipo de comunicación.

| Componente | Recibe (input) | Envía (output) | Para qué sirve |
| --- | --- | --- | --- |
| `LandingLayoutComponent` | — | — | Encabezado, `router-outlet` y pie público. |
| `InicioPageComponent` | — | — | Arma la landing con sus secciones. |
| `SiteHeaderComponent` | — | — | Navegación, enlace activo y contador de guardados. |
| `BlogListComponent` | `creado?: string` (query param) | — | Listado, búsqueda y filtros. |
| `BlogDetailComponent` | `id: string` (**required**, parámetro de ruta) | — | Detalle o mensaje de no encontrado. |
| `BlogFormComponent` | — | — | Alta reactiva con validación. |
| `NotFoundComponent` | — | — | Vista 404. |
| `BlogSectionComponent` | — | — | Vista previa del blog en la landing. |
| `BlogCardComponent` | `articulo: ArticuloBlog` (**required**), `guardado: boolean` | `ver: ArticuloBlog`, `guardar: number` | Muestra un artículo y avisa al padre. |
| `BlogService` | — | — | Estado compartido de artículos, filtros y guardados. |

<details>
<summary>Ver contratos de los componentes compartidos</summary>

| Componente | Recibe (input) | Envía (output) | Para qué sirve |
| --- | --- | --- | --- |
| `DataTableComponent<T>` | `columns`, `data`, `loading`, `emptyMessage`, `dimInactive` | `sort: string` | Tabla reutilizable con celdas y acciones proyectadas. |
| `SearchFilterComponent` | `value` (model), `placeholder?` | `search: void` | Campo de búsqueda con evento. |
| `ConfirmDialogComponent` | `title?`, `message` (required), `confirmText?`, `cancelText?`, `variant?` | `confirm: void`, `cancel: void` | Diálogo de confirmación. |
| `PaginationBarComponent` | `page` (model), `totalPages`, `totalElements`, `size` | — | Paginación reutilizable. |
| `DefaultLayoutComponent` | — | — | Estructura de la app autenticada. |
| `AuthLayoutComponent` | — | — | Estructura de login y registro. |

</details>

## 9. ¿Quién guarda el estado?

| Dato | Quién lo guarda | Por qué |
| --- | --- | --- |
| Artículos del blog (`ArticuloBlog[]`) | `BlogService` (`providedIn: 'root'`) | Es la fuente del listado, del detalle y del alta. La señal privada `_articulos` se lee con `articulos` (`asReadonly()`) y cambia solo con `crearArticulo()`. |
| Filtro, búsqueda y artículos guardados | `BlogService` | La landing, el listado y el encabezado comparten la misma información. Se modifican con `cambiarCategoria()`, `cambiarBusqueda()`, `alternarGuardado()` y `reiniciarFiltros()`. |
| Totales del blog (`totalArticulos`, `totalGuardados`, `totalPorCategoria`, `articulosFiltrados`) | `BlogService` | Son valores `computed()`: se recalculan solos cuando cambian los artículos, el filtro o la búsqueda. |
| Estado del formulario de alta | `BlogFormComponent` | Es estado de presentación del formulario. No debe vivir en el servicio porque solo pertenece a esa vista. |
| Servicios del portafolio (`ServicioPortafolio[]`) | `src/app/datos/servicios-portafolio.ts` | Es un catálogo de demostración que no cambia en tiempo de ejecución. |
| Horario y festivos (`HORARIO_SEMANAL`) | `src/app/datos/clinica.ts` | Es la única fuente del horario. `estadoApertura()` calcula abierto o cerrado con la hora de Bogotá. |
| Sesión, token y permisos | `AuthService` | Los usan el login, los guards, el interceptor y el layout. |
| Datos del servidor (clientes, mascotas, citas reales, facturas, pagos, servicios, empleados) | Servicios API | Solo hacen las peticiones HTTP. Cada página decide si guarda, filtra o pagina. |

## 10. Criterios de la Entrega 2 (R1–R6)

| Criterio | Lo que pide | Dónde se cumple |
| --- | --- | --- |
| **R1** | README con tabla de rutas y justificación del formulario reactivo (RF-E2-04). | Secciones 2.1 y 2.4 de este README. |
| **R2** | Tres vistas con ruta propia, detalle con `input()`, mensaje de no encontrado, 404, `routerLinkActive` y `loadComponent`. | `/blog`, `/blog/:id` y `/blog/nuevo`; `BlogDetailComponent`; `NotFoundComponent`; `SiteHeaderComponent`; rutas con `loadComponent`. |
| **R3** | `FormBuilder` tipado, un control por campo, conversión al modelo de datos y alta por el servicio; listado actualizado sin recargar. | `BlogFormComponent`, `convertirArticulo()` y `BlogService.crearArticulo()`; el listado lee la misma señal. |
| **R4** | Cuatro validadores integrados distintos y uno propio; errores con `touched` o `dirty`; envío deshabilitado. | `required`, `minLength`, `maxLength`, `min`, `max` y `pattern`; `tituloUnico`; `mensajeError()`; `[disabled]="formulario.invalid"`. |
| **R5** | Búsqueda con `valueChanges`, `debounceTime(300)` y `distinctUntilChanged`, sin suscripciones abiertas. | `BlogListComponent` y `BlogSectionComponent`, con `takeUntilDestroyed()`. |
| **R6** | Estructura, repositorio público sin `node_modules`, commits de todos y PDF. | Estructura de `features/blog`, `layouts`, `componentes` y `servicios`; `.gitignore` excluye `node_modules`; commits de ambos integrantes; PDF en el aula. |

<details>
<summary>Ver criterios de la Entrega 1 (referencia)</summary>

| Criterio | Lo que pedía | Dónde se cumple |
| --- | --- | --- |
| **R1** | README con integrantes, dominio, cómo ejecutar, árbol de componentes y contratos. | Este archivo. |
| **R2** | Componentes propios, un hijo repetido con `@for`, `input.required()` y `output()`. | `BlogCardComponent` y `PortafolioCardComponent`. |
| **R3** | Servicio en root, señal privada con `asReadonly()`, métodos con nombre y `computed`. | `BlogService`. |
| **R4** | `@if`, `@for` con `track`, `@empty`, `@switch`, pipes con `es-CO` y un pipe propio. | Landing, blog y `categoria-blog.pipe.ts`. |
| **R5** | Interfaces en `modelos/`, al menos 8 registros en `datos/` y un caso límite visible. | `articulo-blog.ts`, `servicios-portafolio.ts`, 10 artículos y 7 servicios. |
| **R6** | Estructura, repositorio público, sin `node_modules`, commits de todos y PDF. | Estructura del proyecto y `.gitignore`. |

</details>

## 11. Preguntas rápidas

**¿La landing y el blog necesitan backend?**
No. Usan datos locales. El asistente de contacto consulta un servicio externo configurado en `environment.chatbotUrl`.

**¿El asistente de contacto envía correos?**
No. Responde preguntas sobre la clínica y no envía correos ni guarda la conversación en el backend.

**¿Dónde cambio los servicios del portafolio?**
En `src/app/datos/servicios-portafolio.ts`. Edita el arreglo `PORTAFOLIO_SERVICIOS` y guarda.

**¿Dónde cambio los artículos del blog?**
En `src/app/datos/articulos-blog.ts` para los artículos iniciales. Los artículos nuevos se crean en memoria desde `/blog/nuevo`.

**¿Dónde se guardan los artículos marcados?**
En `BlogService`, en memoria del navegador. Si recargas la página, vuelven a quedar sin guardar.

**¿Dónde se ve el detalle de un artículo?**
En `/blog/:id`. El parámetro `id` llega al `input.required()` de `BlogDetailComponent`. Si no existe, se muestra el mensaje de no encontrado.

**¿Dónde está la vista 404?**
En `src/app/componentes/not-found/not-found.component.ts`; las rutas `404` y `**` la cargan.

**¿Cuál es la diferencia entre la landing y la app completa?**
La landing y el blog usan datos locales (salvo el asistente). La app completa usa la API para clientes, mascotas, citas reales, facturas, pagos, servicios y empleados.

## 12. Verificación

```bash
npx ng build
npx ng test --watch=false
git shortlog -sn
```

- `npx ng build` debe terminar sin errores ni advertencias de presupuesto.
- `npx ng test --watch=false` ejecuta las pruebas unitarias del blog, el horario, las tablas y los componentes existentes.
- `git shortlog -sn` muestra cuántos commits tiene cada integrante.
- El repositorio no incluye `node_modules`; se instala con `npm install`.

Resultados de la última ejecución local:

- `npx ng build`: compilación correcta, sin advertencias.
- `npx ng test --watch=false`: **12 archivos, 44 pruebas aprobadas**.
- Rutas verificadas en navegador: `/`, `/blog`, `/blog/1`, `/blog/99999`, `/blog/nuevo`, `/404` y `/ruta-inexistente`.

## 13. Repositorio y despliegue

- **Repositorio:** https://github.com/IngVictor2/veterinaria_fronted
- **Landing en producción:** https://vetclinicbaq.vercel.app/
- **Login:** https://vetclinicbaq.vercel.app/login

Vercel publica automáticamente los cambios de la rama `main`.
