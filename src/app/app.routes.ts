import { Routes } from '@angular/router';
import { authGuard, guestGuard, permisosGuard } from './core/guards/auth.guards';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { DefaultLayoutComponent } from './layouts/default-layout/default-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'VetClinic | Clínica veterinaria',
    loadComponent: () =>
      import('./componentes/inicio/inicio-page/inicio-page.component').then(
        (m) => m.InicioPageComponent,
      ),
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard | VetClinic',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'mis-mascotas',
        canActivate: [permisosGuard],
        data: { modulos: ['MASCOTAS'], roles: ['CLIENTE'] },
        loadComponent: () =>
          import('./features/mascotas/mis-mascotas/mis-mascotas.component').then((m) => m.MisMascotasComponent),
      },
      {
        path: 'mis-citas',
        canActivate: [permisosGuard],
        data: { modulos: ['CITAS'], roles: ['CLIENTE'] },
        loadComponent: () => import('./features/citas/mis-citas/mis-citas.component').then((m) => m.MisCitasComponent),
      },
      {
        path: 'mis-citas/nueva',
        canActivate: [permisosGuard],
        data: { modulos: ['CITAS'], roles: ['CLIENTE'] },
        loadComponent: () =>
          import('./features/citas/cliente-cita-form/cliente-cita-form.component').then((m) => m.ClienteCitaFormComponent),
      },
      {
        path: 'mis-facturas',
        canActivate: [permisosGuard],
        data: { modulos: ['FACTURACION'], roles: ['CLIENTE'] },
        loadComponent: () =>
          import('./features/facturas/mis-facturas/mis-facturas.component').then((m) => m.MisFacturasComponent),
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./features/clientes/mi-perfil/mi-perfil.component').then((m) => m.MiPerfilComponent),
      },
      {
        path: 'clientes',
        canActivate: [permisosGuard],
        data: { modulos: ['CLIENTES'] },
        loadComponent: () =>
          import('./features/clientes/clientes-list/clientes-list.component').then((m) => m.ClientesListComponent),
      },
      {
        path: 'clientes/nueva',
        canActivate: [permisosGuard],
        data: { modulos: ['CLIENTES'] },
        loadComponent: () =>
          import('./features/clientes/cliente-form/cliente-form.component').then((m) => m.ClienteFormComponent),
      },
      {
        path: 'clientes/:id/editar',
        canActivate: [permisosGuard],
        data: { modulos: ['CLIENTES'] },
        loadComponent: () =>
          import('./features/clientes/cliente-form/cliente-form.component').then((m) => m.ClienteFormComponent),
      },
      {
        path: 'clientes/:id',
        canActivate: [permisosGuard],
        data: { modulos: ['CLIENTES'] },
        loadComponent: () =>
          import('./features/clientes/cliente-detail/cliente-detail.component').then((m) => m.ClienteDetailComponent),
      },
      {
        path: 'mascotas',
        canActivate: [permisosGuard],
        data: { modulos: ['MASCOTAS'] },
        loadComponent: () =>
          import('./features/mascotas/mascotas-list/mascotas-list.component').then((m) => m.MascotasListComponent),
      },
      {
        path: 'mascotas/nueva',
        canActivate: [permisosGuard],
        data: { modulos: ['MASCOTAS'] },
        loadComponent: () =>
          import('./features/mascotas/mascota-form/mascota-form.component').then((m) => m.MascotaFormComponent),
      },
      {
        path: 'mascotas/:id/editar',
        canActivate: [permisosGuard],
        data: { modulos: ['MASCOTAS'] },
        loadComponent: () =>
          import('./features/mascotas/mascota-form/mascota-form.component').then((m) => m.MascotaFormComponent),
      },
      {
        path: 'mascotas/:id',
        canActivate: [permisosGuard],
        data: { modulos: ['MASCOTAS'] },
        loadComponent: () =>
          import('./features/mascotas/mascota-detail/mascota-detail.component').then((m) => m.MascotaDetailComponent),
      },
      {
        path: 'citas',
        canActivate: [permisosGuard],
        data: { modulos: ['CITAS'] },
        loadComponent: () => import('./features/citas/citas-list/citas-list.component').then((m) => m.CitasListComponent),
      },
      {
        path: 'citas/nueva',
        canActivate: [permisosGuard],
        data: { modulos: ['CITAS'] },
        loadComponent: () => import('./features/citas/cita-form/cita-form.component').then((m) => m.CitaFormComponent),
      },
      {
        path: 'citas/:id/editar',
        canActivate: [permisosGuard],
        data: { modulos: ['CITAS'] },
        loadComponent: () => import('./features/citas/cita-form/cita-form.component').then((m) => m.CitaFormComponent),
      },
      {
        path: 'citas/:id/consulta',
        canActivate: [permisosGuard],
        data: { modulos: ['CITAS'] },
        loadComponent: () =>
          import('./features/citas/consulta-form/consulta-form.component').then((m) => m.ConsultaFormComponent),
      },
      {
        path: 'citas/:id/estetica',
        canActivate: [permisosGuard],
        data: { modulos: ['CITAS'] },
        loadComponent: () =>
          import('./features/citas/estetica-form/estetica-form.component').then((m) => m.EsteticaFormComponent),
      },
      {
        path: 'citas/:id',
        canActivate: [permisosGuard],
        data: { modulos: ['CITAS'] },
        loadComponent: () => import('./features/citas/cita-detail/cita-detail.component').then((m) => m.CitaDetailComponent),
      },
      {
        path: 'facturas',
        canActivate: [permisosGuard],
        data: { modulos: ['FACTURACION'] },
        loadComponent: () =>
          import('./features/facturas/facturas-list/facturas-list.component').then((m) => m.FacturasListComponent),
      },
      {
        path: 'facturas/:id',
        canActivate: [permisosGuard],
        data: { modulos: ['FACTURACION'] },
        loadComponent: () =>
          import('./features/facturas/factura-detail/factura-detail.component').then((m) => m.FacturaDetailComponent),
      },
      {
        path: 'pagos',
        canActivate: [permisosGuard],
        data: { modulos: ['FACTURACION'] },
        loadComponent: () => import('./features/pagos/pagos-list/pagos-list.component').then((m) => m.PagosListComponent),
      },
      {
        path: 'pagos/:id',
        canActivate: [permisosGuard],
        data: { modulos: ['FACTURACION'] },
        loadComponent: () => import('./features/pagos/pago-detail/pago-detail.component').then((m) => m.PagoDetailComponent),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./features/servicios/servicios-list/servicios-list.component').then((m) => m.ServiciosListComponent),
      },
      {
        path: 'empleados',
        canActivate: [permisosGuard],
        data: { modulos: ['USUARIOS'] },
        loadComponent: () =>
          import('./features/empleados/empleados-list/empleados-list.component').then((m) => m.EmpleadosListComponent),
      },
      {
        path: 'empleados/nueva',
        canActivate: [permisosGuard],
        data: { modulos: ['USUARIOS'] },
        loadComponent: () =>
          import('./features/empleados/empleado-form/empleado-form.component').then((m) => m.EmpleadoFormComponent),
      },
      {
        path: 'empleados/:id/editar',
        canActivate: [permisosGuard],
        data: { modulos: ['USUARIOS'] },
        loadComponent: () =>
          import('./features/empleados/empleado-form/empleado-form.component').then((m) => m.EmpleadoFormComponent),
      },
      {
        path: 'empleados/:id',
        canActivate: [permisosGuard],
        data: { modulos: ['USUARIOS'] },
        loadComponent: () =>
          import('./features/empleados/empleado-detail/empleado-detail.component').then((m) => m.EmpleadoDetailComponent),
      },
      {
        path: 'admin/roles',
        canActivate: [permisosGuard],
        data: { modulos: ['ROLES'] },
        loadComponent: () => import('./features/admin/roles/roles.component').then((m) => m.RolesComponent),
      },
      {
        path: 'admin/permisos',
        canActivate: [permisosGuard],
        data: { modulos: ['ROLES'] },
        loadComponent: () => import('./features/admin/permisos/permisos.component').then((m) => m.PermisosComponent),
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'activate-account',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/auth/activate-account/activate-account.component').then((m) => m.ActivateAccountComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
