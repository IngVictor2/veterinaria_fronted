# VetClinic — Frontend (Angular)

Migración a **Angular 22** (zoneless + signals) del frontend Vue 3 + Vite original
(`github.com/SapoTurco/veterinaria-frontend`).

## Stack

- Angular 22 (standalone components, zoneless, `signal()`/`computed()`)
- Tailwind CSS 4 + daisyUI 5 (`src/styles.css`)
- `HttpClient` + RxJS `firstValueFrom` (los servicios devuelven `Observable<T>`)
- Autenticación JWT: `AuthService` (signals) + `authInterceptor` + guards funcionales

## Estructura

```
src/app/
├── core/
│   ├── models/        # Tipos del dominio (cliente, mascota, cita, factura, pago, ...)
│   ├── services/      # Servicios API (clientes-api, citas-api, ...) + auth.service
│   ├── interceptors/  # authInterceptor (Bearer + manejo 401)
│   ├── guards/        # authGuard, guestGuard, permisosGuard
│   └── utils/         # getApiErrorMessage, ...
├── shared/components/ # DataTable, SearchSelect, SearchFilter, PaginationBar,
│                      # ConfirmDialog, LoadingSpinner, CalendarDayPicker
├── layouts/           # auth-layout, default-layout (sidebar/header)
├── features/          # Vistas por familia (auth, dashboard, clientes, mascotas,
│                      # citas, facturas, pagos, servicios, empleados, admin)
└── app.routes.ts      # Rutas con lazy loading y guards (espejo del router original)
```

## Desarrollo

```bash
npm start        # ng serve → http://localhost:4200
npm run build    # build de producción → dist/
```

### Backend

El backend (Kotlin + Spring Boot, repo `veterinaria_backend`) corre por defecto en
`http://localhost:8080` y no usa prefijo `/api` en los controladores
(`/auth`, `/clientes`, `/citas`, ...).

En desarrollo, el dev server proxifica `/api` hacia el backend y **reescribe**
`/api/...` → `...` (ver `proxy.conf.json`). Por eso `environment.apiUrl = '/api'`
funciona sin cambios:

```bash
# 1) backend: variables requeridas (PostgreSQL + JWT)
DB_HOST=... DB_NAME=... DB_USER=... DB_PASSWORD=... JWT_SECRET=... ./gradlew bootRun
# 2) frontend
npm start
```

El backend ya permite CORS desde `http://localhost:4200`
(`app.cors.allowed-origins` / `CORS_ALLOWED_ORIGINS`) y expone Swagger en
`/swagger-ui.html`.

> **Producción**: configura un rewrite equivalente (`/api/*` → backend) en el
> hosting, o cambia `apiUrl` en `src/environments/environment.ts` por la URL
> absoluta del backend. Sin backend, las vistas muestran sus mensajes de error
> (comportamiento esperado).

## Notas de la migración

- Convenciones y patrones usados en el port (señales, `ngModel` dividido,
  control flow `@if`/`@for`, componentes compartidos): ver `MIGRATION_GUIDE.md`.
- El proyecto Vue original (referencia de paridad visual) está en `github.com/SapoTurco/veterinaria-frontend`.
