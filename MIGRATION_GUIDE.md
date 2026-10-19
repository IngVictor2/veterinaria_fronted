# Guía de migración Vue 3 → Angular 22 (VetClinic)

Esta guía define las convenciones EXACTAS para convertir las vistas del proyecto Vue 3 + Vite + Pinia + axios
original (`github.com/SapoTurco/veterinaria-frontend`, `src/views/**`) a componentes Angular 22 standalone
en `src/app/features/**`.

## Regla de oro

**La app Angular es ZONELESS** (sin zone.js). Por eso:

- TODO el estado mutable del componente debe ser `signal()` / `computed()`. Nunca campos planos para
  datos que se muestran en el template o que se actualizan desde código asíncrono (respuestas HTTP).
- Los formularios usan un signal por campo y binding explícito:
  `[ngModel]="campo()" (ngModelChange)="campo.set($event)"` (NO usar `[(ngModel)]` con campos planos).
- `name="..."` es OBLIGATORIO en todo `input`/`select`/`textarea` que use `ngModel` dentro de un `<form>`
  (si falta, Angular lanza error en runtime).
- Importar `FormsModule` en el componente que use formularios.

## Esqueleto de componente

```ts
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { XxxApiService } from '../../../core/services/xxx-api.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-xxx',
  imports: [FormsModule, RouterLink, /* componentes shared usados */],
  template: `...`,
  styles: `
    /* aquí va el <style scoped> copiado tal cual del .vue */
  `,
})
export class XxxComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(XxxApiService);

  readonly dato = signal<Tipo[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  async ngOnInit(): Promise<void> { await this.loadData(); }
}
```

- Templates y estilos SIEMPRE inline (`template:` y `styles:` con backticks).
- El componente debe ser standalone (por defecto en Angular 22; NO poner `standalone: true`).
- Ruta de un componente típico: `src/app/features/<familia>/<nombre>/<nombre>.component.ts`.
  Desde ahí, `core/` y `shared/` quedan en `../../../core/...` y `../../../shared/...`.

## Conversión de templates (cheat sheet)

| Vue | Angular |
|---|---|
| `v-if="x"` / `v-else-if` / `v-else` | `@if (x()) { ... } @else if (...) { ... } @else { ... }` |
| `v-for="i in lista" :key="i.id"` | `@for (i of lista(); track i.id) { ... }` (`track` obligatorio; usar `track $index` si no hay id) |
| `v-show="x"` | `[class.hidden]="!x()"` o `[hidden]="!x()"` |
| `@click="fn(a)"` | `(click)="fn(a)"` |
| `@submit.prevent="fn"` en `<form>` | `(ngSubmit)="fn()"` en `<form>` (FormsModule) |
| `v-model="x"` (input) | `[ngModel]="x()" (ngModelChange)="x.set($event)"` + `name="x"` |
| `v-model.number="x"` | igual + `type="number"` (Angular convierte a number solo) |
| `v-model="obj.campo"` | `[ngModel]="campo()" (ngModelChange)="campo.set($event)"` (por señal) |
| `:class="{ a: cond }"` | `[class]="cond ? 'a' : ''"` o `[class.a]="cond"` |
| `:class="[base, cond ? 'x' : 'y']"` | `class="base" [class]="cond ? 'x' : 'y'"` |
| `:class="expr-con-clases-arbitrarias"` | `[class]="expr"` (NUNCA `[class.text-[#0D7377]]`, los corchetes y `:` rompen el parser) |
| `:disabled="x"` | `[disabled]="x()"` |
| `:value="v"` en `<option>` (string) | `<option [value]="v">` |
| `:value="v"` en `<option>` (número) | `<option [ngValue]="v">` (ngValue preserva el tipo número) |
| `<router-link to="/x">` | `<a routerLink="/x">` (o `[routerLink]="['/x', id]"`) |
| `router.push('/x')` | `router.navigateByUrl('/x')` o `router.navigate(['/x'])` |
| `route.params.id` | `Number(this.route.snapshot.paramMap.get('id'))` |
| `{{ new Date(v).toLocaleDateString() }}` | mover a método del componente: `{{ formatFecha(v) }}` (en templates NO existe `new`, `Math`, `typeof`, `Array.isArray`) |
| `v-html` | `[innerHTML]="html()"` (poco frecuente) |
| `<Transition>` | no aplica; usar clases de animación CSS condicionales (ver `.animate-shake` en login) |
| slot `#cell-x="{ item }"` (DataTable) | `<ng-template appCell="x" let-item>` |
| slot `#cell-x="{ value }"` | `<ng-template appCell="x" let-value="value">` |
| slot `#actions="{ item }"` | `<ng-template appActions let-item>` |

### Sobre `v-model.number` y señales de formulario

```ts
// El campo es un signal normal; con type="number" Angular asigna number.
readonly peso = signal<number | null>(null);
```
```html
<input name="peso" type="number" [ngModel]="peso()" (ngModelChange)="peso.set($event)" />
```

Para selects numéricos usar `[ngValue]`:

```html
<select name="idServicio" [ngModel]="idServicio()" (ngModelChange)="idServicio.set($event)">
  <option [ngValue]="0">-- Seleccionar --</option>
  @for (s of servicios(); track s.idServicio) {
    <option [ngValue]="s.idServicio">{{ s.nombre }}</option>
  }
</select>
```

## Servicios (capa API) — ya implementados en `src/app/core/services/`

Todos los métodos devuelven `Observable<T>`; en las vistas usar `await firstValueFrom(servicio.metodo(...))`.
**El valor resuelto ES el body** (equivalente a `response.data` de axios). Es decir:
`const res = await clientesApi.getAll()` → res es directamente `Cliente[]`.

- `ClientesApiService` (archivo `clientes-api.service.ts`): `getAll(includeInactive?)`, `getById(id)`,
  `getProfile()`, `updateProfile(data)`, `create(data)`, `update(id, data)`, `delete(id)`,
  `cambiarEstado(id, estado)`, `crearUsuario(id, {email,password})`.
  También exporta `ClienteProfileData`.
- `MascotasApiService`: `getAll(includeInactive?)`, `getMisMascotas({page,size}?)`, `getById`,
  `getByCliente(idCliente)`, `create`, `update`, `delete`.
- `CitasApiService` (`citas-api.service.ts`): `getAll(includeInactive?)`, `getMisCitas({page,size}?)`,
  `getById`, `getByCliente`, `getByMascota`, `getByEmpleado`, `create`, `update`, `confirmar(id,data)`,
  `cambiarEstado(id, estado)`, `cancelar(id)`, `getDisponibilidad(fecha)`,
  `registrarConsulta(data)`, `registrarEstetica(data)`.
  Exporta interfaces `RegistroConsultaRequest`, `RegistroEsteticaRequest`.
- `FacturasApiService`: `getAll(includeInactive?)`, `getMisFacturas({page,size}?)`, `getById`,
  `getByCliente`, `create`, `cambiarEstado(id, estado)`.
- `PagosApiService`: `getAll(includeInactive?)`, `getByFactura(idFactura)`, `create(data)`.
- `ServiciosApiService`: `getAll(includeInactive?, tipo?)`, `getById`, `create`, `update`, `delete`.
- `EmpleadosApiService`: `getAll(includeInactive?)`, `getById`, `create`, `update`, `delete`, `cambiarEstado`.
- `AdminApiService`: `getRoles(includeInactive?)`, `createRol`, `updateRol`, `deleteRol`,
  `getPermisos(idRol)`, `asignarPermiso`, `revocarPermiso(idRol,idModulo)`, `getUsuarioRoles(idUsuario)`,
  `asignarRolUsuario`, `revocarRolUsuario(idUsuario,idRol)`, `getCargos()`, `getMetodosPago()`,
  `getModulos()`, `getUsuarios()`, `restablecerPassword(idUsuario, nuevaPassword)`.
- `MetodosPagoApiService`: `getAll()`.
- `HistorialApiService` (`historial-api.service.ts`): `getByMascota(idMascota)`. Exporta `Historial`.
- `FacturaCitaService`: `vincularFacturaDeCita(idCita)`, `getFacturaIdDeCita(idCita)`.
- `AuthService` (`auth.service.ts`): signals `token`, `usuario`, `isAuthenticated`, `roles`, `modulos`,
  `nombreUsuario`, `nombreCompleto`, `esProfesional`, `idEmpleadoActual`, `cargoEmpleadoActual`,
  `rolesEmpleadoActual`; métodos `hasRole(r)`, `hasAnyRole(...r)`, `hasModule(m)`, `hasAnyModule(...m)`,
  `login(data)`, `register(data)`, `logout()`, `fetchProfile()`, `cargarEmpleadoActual()`,
  `limpiarEmpleadoActual()`.
  Uso en template: inyectar como `readonly auth = inject(AuthService)` (público) y usar `auth.hasRole('X')`, `auth.nombreCompleto()`, etc.

### Modelos — `src/app/core/models/`

`auth.ts`, `admin.ts`, `cita.ts` (incluye helpers `getDuracionServicio`, `formatHora`,
`citasOrdenadasCronologicamente`, `mapaNumerosCitasPorCliente`, `DURACION_SERVICIO`), `cliente.ts`,
`empleado.ts`, `factura.ts`, `mascota.ts`, `pago.ts`, `servicio.ts`, `api.ts`.

Helper de errores: `getApiErrorMessage(e, 'mensaje por defecto')` desde `core/utils/api-error.ts`
(reemplaza a `e.response?.data?.message || 'fallback'`).

## Componentes compartidos — `src/app/shared/components/`

### `app-data-table` (DataTableComponent) — `data-table/`

```html
<app-data-table
  [columns]="columns"                 <!-- DataTableColumn[]: {key,label,sortable?} -->
  [data]="data()"
  [loading]="loading()"
  emptyMessage="No se encontraron X"
  [dimInactive]="true"
  (sort)="handleSort($event)"
>
  <ng-template appCell="primerNombre" let-item>...</ng-template>
  <ng-template appCell="createdAt" let-value="value">{{ formatFecha(value) }}</ng-template>
  <ng-template appActions let-item>
    <button class="btn btn-ghost btn-xs text-info" (click)="router.navigate(['/x', item.id])">Ver</button>
  </ng-template>
</app-data-table>
```
Importar: `DataTableComponent, CellTemplateDirective, ActionsTemplateDirective, DataTableColumn`
(desde `shared/components/data-table/data-table.component` y `.../cell-template.directive`).
Sin `ng-template` para una columna, se muestra `item[col.key]` (admite rutas anidadas con puntos).

### `app-search-filter` (SearchFilterComponent)

```html
<app-search-filter [(value)]="search" (search)="handleSearch()" placeholder="Buscar..." />
```
`value` es un signal string; `(search)` se emite con Enter o con el botón.

### `app-search-select` (SearchSelectComponent)

```html
<app-search-select [(value)]="idCliente" [options]="opciones()" placeholder="Seleccionar cliente..." />
```
- `value`: `number | string | null`. Al construir `opciones`: `{ value: c.idCliente, label: nombre(c), sublabel: c.numeroDocumento ?? '' }`.

### `app-pagination-bar` (PaginationBarComponent)

```html
<app-pagination-bar [(page)]="page" [totalPages]="totalPages()" [totalElements]="totalElements()" [size]="size()" />
```
`page` es signal number (base 0, igual que el original).

### `app-confirm-dialog` (ConfirmDialogComponent)

```html
<app-confirm-dialog
  [show]="showDeleteDialog()"
  title="Eliminar cliente"
  [message]="mensaje()"
  confirmText="Eliminar"
  variant="error"                    <!-- 'primary' | 'error' | 'warning' | 'success' -->
  (confirm)="handleDelete()"
  (cancel)="showDeleteDialog.set(false)"
/>
```
`variant` por defecto `'primary'`.

### `app-loading-spinner` (LoadingSpinnerComponent)

```html
<app-loading-spinner [show]="loading()" title="Cargando..." />
```

### `app-calendar-day-picker` (CalendarDayPickerComponent)

```html
<app-calendar-day-picker
  [(value)]="fechaCita"           <!-- signal<string> 'yyyy-MM-dd' -->
  [idEmpleado]="idEmpleado()"
  [tipoServicio]="tipoServicio()"
  [minDate]="minDate()"
/>
```
El calendario carga solo la disponibilidad del mes visible (GET `/citas/disponibilidad/{fecha}` por día),
muestra tooltip con horas ocupadas y deshabilita días llenos/pasados.

## Estilos

- Copiar el bloque `<style scoped>` completo de cada `.vue` al `styles:` del componente, tal cual
  (Angular los scopea igual que Vue).
- Las clases Tailwind / daisyUI se copian sin cambios.
- Si el original usa clases definidas por componente (`.stat-card`, `.cita-item`, etc.) ya vendrán en su
  `<style scoped>`; copiarlas.

## Comportamiento a preservar

- Textos, placeholders, títulos, iconos SVG, clases CSS y flujos EXACTAMENTE iguales al original.
- Mensajes de error/success en español, mismo texto por defecto del original.
- Mismas llamadas a la API en el mismo orden y con los mismos parámetros.
- Paginación local igual (page base 0, size 10) cuando el original filtra en cliente.
- `watch(x, load)` de Vue → llamar a `loadData()` explícitamente en el handler que cambia `x`
  (o `effect()` si de verdad es necesario).
- `onMounted(loadData)` → `ngOnInit` con `await this.loadData()` (clase `implements OnInit`).

## Qué NO tocar

- `src/app/core/**`, `src/app/shared/**`, `src/app/layouts/**`, `src/app/app.routes.ts`, `src/app/app.config.ts`,
  `src/styles.css`: ya están implementados. NO modificarlos (otro agente podría estar escribiendo en paralelo).
- No agregar dependencias a `package.json`.

## Rutas parametrizadas

```ts
private readonly route = inject(ActivatedRoute);
readonly id = Number(this.route.snapshot.paramMap.get('id'));
```
Para detectar modo edición: la misma ruta sirve para crear (`/x/nueva`) y editar (`/x/:id/editar`);
ver ejemplo en las rutas de `app.routes.ts`. Usar `route.snapshot.paramMap.get('id')` — si es `null`, es creación.

## Componentes de referencia (leer antes de escribir código)

1. `src/app/features/clientes/clientes-list/clientes-list.component.ts` — DataTable + SearchFilter +
   PaginationBar + ConfirmDialog + señales + computed (patrón canónico de listas).
2. `src/app/features/auth/login/login.component.ts` — formulario con señales, ngModel, error handling.
3. `src/app/features/auth/register/register.component.ts` — wizard multi-paso, selects, validaciones.
4. `src/app/features/dashboard/dashboard.component.ts` — datos async, cards, `formatHora` como propiedad.
