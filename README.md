# VetClinic — Entrega 1 (Angular 22)

VetClinic es una aplicación para administrar una clínica veterinaria: clientes, mascotas, citas, servicios, facturas y pagos.

La aplicación completa usa una API REST. La **Entrega 1** es una vista aparte que funciona con datos de ejemplo en el navegador y **no necesita backend**.

**En una frase:** abre `/entrega-1`, mira las 10 citas de ejemplo, confirma una cita pendiente y observa cómo cambian los totales. El botón **Restablecer agenda** vuelve a dejar la demo como al inicio, sin tocar ninguna base de datos.

> **¿Es tu primera vez con Angular?** Lee la sección [Palabras clave de Angular](#4-palabras-clave-de-angular). Allí explico los términos que aparecen en este documento.

## 1. Datos del grupo

- **Grupo:** 6
- **Integrantes:** Victor Martinez y Francisco Garrido

## 2. Qué hace la demo

La demo está en la ruta pública `/entrega-1`. No pide usuario ni contraseña.

| Entorno | URL |
| --- | --- |
| Local | http://localhost:4200/entrega-1 |
| Producción | https://veterinaria-one-nu.vercel.app/entrega-1 |

También puedes entrar desde el botón **Ver agenda de citas** de la pantalla de login.

La demo usa solamente los datos de `src/app/datos/citas-demo.ts`. No consulta la API ni modifica una base de datos.

### Qué puedes probar

1. Ver las **10 citas** de ejemplo.
2. Filtrar por estado: Todas, Pendientes, Confirmadas, Atendidas o Canceladas.
3. Buscar por mascota, propietario o servicio.
4. Confirmar una cita pendiente con el botón **Confirmar**.
5. Ver cómo cambian el estado de la cita, el número de pendientes y los ingresos confirmados.
6. Abrir el filtro **Canceladas** para ver el caso vacío con el bloque `@empty`.
7. Usar **Restablecer agenda** para volver al estado inicial.

### Valores iniciales

- **10 citas** en total.
- **6 citas pendientes**.
- **$ 230.000** en ingresos confirmados.

Si confirmas la cita de **Firulais**, quedan **5 pendientes** y los ingresos suben a **$ 310.000**.

### ¿Qué hace "Restablecer agenda"?

Vuelve a dejar las 10 citas de ejemplo como al inicio. Solo cambia los datos que están en la memoria del navegador:

- No llama a la API.
- No borra nada en la base de datos.
- Si recargas la página, también vuelves al estado inicial.

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

3. Abre la demo en el navegador:

```text
http://localhost:4200/entrega-1
```

Para comprobar que el proyecto compila:

```bash
npx ng build
```

Debe terminar con el mensaje `Application bundle generation complete.`

La aplicación completa (login, dashboard, citas reales, etc.) consume una API configurada en `src/environments/` y `proxy.conf.json`. La demo de la Entrega 1 **no depende de esa API**.

## 4. Palabras clave de Angular

- **Componente:** una pieza de la pantalla. Por ejemplo, una tarjeta de cita o la barra superior.
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
- **API REST:** el backend que entrega los datos reales de la aplicación. La demo de la entrega no la usa.

## 5. Estructura de carpetas

Para revisar la Entrega 1 solo necesitas estas carpetas:

```text
src/app/
├── modelos/
│   └── cita-demo.ts                 # Interfaz CitaDemo y tipo EstadoCitaDemo
├── datos/
│   └── citas-demo.ts                # 10 registros de ejemplo (sin CANCELADA)
├── servicios/
│   └── citas-demo.service.ts        # Guarda y cambia el estado de la demo
├── pipes/
│   └── estado-cita.pipe.ts          # Convierte el estado en un texto legible
└── componentes/
    └── entrega1/
        ├── entrega1-page/           # Página pública /entrega-1
        ├── demo-header/             # Barra superior; lee el mismo estado
        ├── entrega1-view/           # Filtros, búsqueda y lista de citas
        └── cita-demo-card/          # Tarjeta de una cita
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

La indentación significa "está dentro de". Este es el árbol de la Entrega 1:

```text
App
└── Entrega1PageComponent                  (página /entrega-1)
    ├── DemoHeaderComponent                (barra superior)
    └── Entrega1ViewComponent              (contenido principal)
        └── CitaDemoCardComponent × 10     (una tarjeta por cita)
```

- **`Entrega1PageComponent`** arma la página: coloca el encabezado y la vista principal.
- **`DemoHeaderComponent`** muestra los pendientes y los ingresos. Lee la misma lista de citas que la vista.
- **`Entrega1ViewComponent`** muestra los filtros, la búsqueda y la lista. También confirma las citas.
- **`CitaDemoCardComponent`** muestra una cita. Recibe la cita con `input.required()` y avisa al padre con `output()` cuando se pulsa **Confirmar**. Se repite 10 veces con `@for` y `track cita.id`.

<details>
<summary>Ver el árbol completo de la aplicación</summary>

```text
App
├── AuthLayoutComponent                         (/login, /register, /activate-account)
│   ├── LoginComponent
│   ├── RegisterComponent
│   └── ActivateAccountComponent
├── DefaultLayoutComponent                      (rutas autenticadas, authGuard)
│   ├── DashboardComponent
│   ├── CitasListComponent → CitaFormComponent, CitaDetailComponent,
│   │                        MisCitasComponent, ConsultaFormComponent,
│   │                        EsteticaFormComponent, ClienteCitaFormComponent
│   ├── ClientesListComponent → ClienteFormComponent, ClienteDetailComponent, MiPerfilComponent
│   ├── MascotasListComponent → MascotaFormComponent, MascotaDetailComponent, MisMascotasComponent
│   ├── FacturasListComponent → FacturaDetailComponent, MisFacturasComponent
│   ├── PagosListComponent → PagoDetailComponent
│   ├── ServiciosListComponent
│   ├── EmpleadosListComponent → EmpleadoFormComponent, EmpleadoDetailComponent
│   └── RolesComponent, PermisosComponent
│
├── DataTableComponent, SearchFilterComponent, SearchSelectComponent,
│   PaginationBarComponent, ConfirmDialogComponent, LoadingSpinnerComponent,
│   CalendarDayPickerComponent                   (componentes compartidos)
│
└── Entrega1PageComponent                       (ruta pública /entrega-1)
    ├── DemoHeaderComponent                     (lee CitasDemoService)
    └── Entrega1ViewComponent                   (vista principal)
        └── CitaDemoCardComponent × 10          (@for con track cita.id)
```

</details>

## 7. Contratos: qué recibe y qué envía cada componente

Un **contrato** es la forma en que un componente se comunica:

- **Input:** dato que recibe del componente padre.
- **Output:** evento que envía al componente padre.
- **—** significa que no tiene ese tipo de comunicación.

### Componentes de la Entrega 1

| Componente | Recibe (input) | Envía (output) | Para qué sirve |
| --- | --- | --- | --- |
| `Entrega1PageComponent` | — | — | Arma la página con el encabezado y la vista. |
| `DemoHeaderComponent` | — | — | Muestra los pendientes y los ingresos usando `CitasDemoService`. |
| `Entrega1ViewComponent` | — | — | Filtra, busca y confirma citas usando el mismo servicio. |
| `CitaDemoCardComponent` | `cita: CitaDemo` (**required**) | `confirmar: number` | Muestra una cita y envía el id al padre cuando se confirma. |

<details>
<summary>Ver contratos de los componentes compartidos</summary>

Estos componentes se reutilizan en otras pantallas. No son necesarios para entender la demo, pero quedan documentados para R1.

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
| Citas de la demo (`CitaDemo[]`) | `CitasDemoService` (`providedIn: 'root'`) | Es la única lista que comparten el encabezado y la vista. La señal privada `_citas` se lee desde fuera con `citas` (`asReadonly()`) y solo se cambia con `confirmarCita()` y `reiniciarDemo()`. |
| Totales de la demo (`totalCitas`, `totalPendientes`, `ingresosConfirmados`) | `CitasDemoService` | Son valores `computed()`: se calculan solos a partir de la lista y se actualizan cuando una cita cambia. |
| Filtro, búsqueda y mensaje de confirmación | `Entrega1ViewComponent` | Solo los necesita esta pantalla. Son estado temporal y no tienen que compartirse con otras rutas. |
| Sesión, token y permisos | `AuthService` | Los usan el login, los guards, el interceptor y el layout. Se guardan en un solo lugar para no duplicarlos. |
| Datos del servidor (clientes, mascotas, citas reales, facturas, pagos, servicios, empleados) | Servicios API (`CitasApiService`, `ClientesApiService`, etc.) | Solo hacen las peticiones HTTP. Cada página decide si guarda, filtra o pagina los datos que recibe. |
| Estado de tablas, diálogos y formularios | Componentes de página y componentes compartidos | Es estado de presentación o de un formulario. Se comunica con `input()`, `output()` y `model()`. |

## 9. Criterios R1–R6

| Criterio | Lo que pide | Dónde se cumple |
| --- | --- | --- |
| **R1** | README con integrantes, dominio, cómo ejecutar, árbol de componentes, contratos y dueño del estado. | Este archivo. |
| **R2** | Al menos 3 componentes propios; un hijo repetido con `@for`, `input.required()` y `output()`. | `Entrega1PageComponent`, `DemoHeaderComponent`, `Entrega1ViewComponent` y `CitaDemoCardComponent`. El hijo se repite en `entrega1-view.component.ts` con `@for (cita of citasFiltradas(); track cita.id)`. |
| **R3** | Servicio en root, señal privada con `asReadonly()`, métodos con nombre, `computed` visible y encabezado leyendo el mismo estado. | `src/app/servicios/citas-demo.service.ts`; `DemoHeaderComponent` lee `totalPendientes()` e `ingresosConfirmados()`. |
| **R4** | `@if`, `@for` con `track`, `@empty`, `@switch`, pipes con `es-CO` y un pipe propio. | `entrega1-view.component.ts` y `cita-demo-card.component.ts`; `estado-cita.pipe.ts`; locale `es-CO` registrado en `app.config.ts`. |
| **R5** | Interfaz en `modelos/`, al menos 8 registros en `datos/` y un caso límite visible. | `src/app/modelos/cita-demo.ts` (interfaz) y `src/app/datos/citas-demo.ts` (10 registros). El filtro **Canceladas** muestra el `@empty`. |
| **R6** | Estructura, repositorio público, sin `node_modules`, commits y PDF. | Estructura de `modelos/`, `datos/`, `servicios/`, `pipes/` y `componentes/entrega1/`; `.gitignore` excluye `node_modules`; repositorio público; el PDF se entrega en el aula. |

## 10. Preguntas rápidas

**¿La demo necesita backend?**
No. Usa datos locales y funciona sin API.

**¿Restablecer agenda borra la base de datos?**
No. Solo reinicia los datos de la demo que están en la memoria del navegador.

**¿Dónde cambio las citas de ejemplo?**
En `src/app/datos/citas-demo.ts`. Edita el arreglo `CITAS_DEMO`, guarda y recarga la página.

**¿Por qué la demo no aparece dentro del dashboard?**
Porque es una ruta pública separada. Se abre en `/entrega-1` o desde el botón del login.

**¿Cuál es la diferencia entre la demo y la app completa?**
La demo usa datos locales y no llama a la API. La app completa usa la API para clientes, mascotas, citas reales, facturas, pagos, servicios y empleados.

## 11. Evidencias

### Captura 1 — Estado inicial

Así se ve la demo al abrirla: 10 citas, 6 pendientes, $ 230.000 en ingresos confirmados y el encabezado mostrando los mismos totales.

![Captura 1 — vista inicial](docs/evidencias/captura-1-vista-inicial.png)

### Captura 2 — Después de confirmar una cita

Se confirmó la cita de Firulais. Ahora hay 5 pendientes, los ingresos suben a $ 310.000 y la tarjeta muestra el estado `CONFIRMADA`.

![Captura 2 — acción de confirmar](docs/evidencias/captura-2-accion-confirmar.png)

### Captura 3 — Caso límite `@empty`

Al filtrar **Canceladas** no hay citas. Se muestra el mensaje del bloque `@empty` y el pie confirma que hay 0 de 10 citas para ese filtro. (Evidencia adicional de R5.)

![Captura 3 — caso límite @empty](docs/evidencias/captura-3-empty-canceladas.png)

## 12. Verificación

```bash
npx ng build
git shortlog -sn
```

- `npx ng build` debe terminar sin errores.
- `git shortlog -sn` muestra cuántos commits tiene cada integrante.
- El repositorio no incluye `node_modules`; se instala con `npm install`.

## 13. Repositorio y despliegue

- **Repositorio:** https://github.com/IngVictor2/veterinaria_fronted
- **Demo en producción:** https://veterinaria-one-nu.vercel.app/entrega-1
- **Login:** https://veterinaria-one-nu.vercel.app/login

Vercel publica automáticamente los cambios de la rama `main`. La demo también se puede abrir desde el botón **Ver agenda de citas** del login.
