import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-layout">
      <div class="flex min-h-screen">
        <!-- Mobile overlay -->
        @if (sidebarOpen()) {
          <div class="fixed inset-0 bg-black/60 z-40 lg:hidden" (click)="closeSidebar()"></div>
        }

        <!-- Sidebar -->
        <aside
          class="sidebar-glass flex flex-col fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-64 transform transition-transform duration-300 ease-in-out"
          [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        >
          <div class="p-4 flex items-center justify-between">
            <h1 class="text-xl font-bold text-[#FFFFE3] flex items-center gap-2">
              <img src="/logo.svg" alt="VetClinic" class="w-8 h-8 rounded-full" />
              VetClinic
            </h1>
            <button class="btn btn-ghost btn-sm btn-circle lg:hidden" (click)="closeSidebar()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#CBCBCB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            <!-- Dashboard -->
            <a
              (click)="navigateTo('/dashboard')"
              class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              [class.nav-link-active]="isActive('/dashboard', true)"
              [class.nav-link-inactive]="!isActive('/dashboard', true)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>

            <!-- CLIENTE: Mis cosas -->
            @if (auth.hasRole('CLIENTE')) {
              @if (auth.hasModule('MASCOTAS')) {
                <a
                  (click)="navigateTo('/mis-mascotas')"
                  class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/mis-mascotas')"
                  [class.nav-link-inactive]="!isActive('/mis-mascotas')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .137 1.217 1.5 2 2.5 2s2-.5 3-.5 1.863.283 3 .5c1-.5 1.363-.783 1.5-2 .113-.994-1.177-6.53-4-7C8.423 2.678 6.5 3.782 6.5 5.172V7" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5.172C14 3.782 12.423 2.679 10.5 3c-2.823.47-4.113 6.006-4 7 .137 1.217 1.5 2 2.5 2s2-.5 3-.5 1.863.283 3 .5c1-.5 1.363-.783 1.5-2 .113-.994-1.177-6.53-4-7C12.423 2.678 10.5 3.782 10.5 5.172V7" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14c-2.5 0-5 1.5-5 3v1h10v-1c0-1.5-2.5-3-5-3z" />
                  </svg>
                  Mis Mascotas
                </a>
              }
              @if (auth.hasModule('CITAS')) {
                <a
                  (click)="navigateTo('/mis-citas')"
                  class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/mis-citas')"
                  [class.nav-link-inactive]="!isActive('/mis-citas')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Mis Citas
                </a>
              }
              @if (auth.hasModule('FACTURACION')) {
                <a
                  (click)="navigateTo('/mis-facturas')"
                  class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/mis-facturas')"
                  [class.nav-link-inactive]="!isActive('/mis-facturas')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                  Mis Facturas
                </a>
              }
            }

            <!-- CLIENTES -->
            @if (auth.hasModule('CLIENTES') && !auth.hasRole('CLIENTE')) {
              <a
                (click)="navigateTo('/clientes')"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/clientes')"
                [class.nav-link-inactive]="!isActive('/clientes')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Clientes
              </a>
            }

            <!-- MASCOTAS -->
            @if (auth.hasModule('MASCOTAS') && !auth.hasRole('CLIENTE')) {
              <a
                (click)="navigateTo('/mascotas')"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/mascotas')"
                [class.nav-link-inactive]="!isActive('/mascotas')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .137 1.217 1.5 2 2.5 2s2-.5 3-.5 1.863.283 3 .5c1-.5 1.363-.783 1.5-2 .113-.994-1.177-6.53-4-7C8.423 2.678 6.5 3.782 6.5 5.172V7" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5.172C14 3.782 12.423 2.679 10.5 3c-2.823.47-4.113 6.006-4 7 .137 1.217 1.5 2 2.5 2s2-.5 3-.5 1.863.283 3 .5c1-.5 1.363-.783 1.5-2 .113-.994-1.177-6.53-4-7C12.423 2.678 10.5 3.782 10.5 5.172V7" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14c-2.5 0-5 1.5-5 3v1h10v-1c0-1.5-2.5-3-5-3z" />
                </svg>
                Mascotas
              </a>
            }

            <!-- CITAS -->
            @if (auth.hasModule('CITAS') && !auth.hasRole('CLIENTE')) {
              <a
                (click)="navigateTo('/citas')"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/citas')"
                [class.nav-link-inactive]="!isActive('/citas')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Citas
              </a>
            }

            <!-- FACTURAS / PAGOS -->
            @if (auth.hasModule('FACTURACION') && !auth.hasRole('CLIENTE')) {
              <a
                (click)="navigateTo('/facturas')"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/facturas')"
                [class.nav-link-inactive]="!isActive('/facturas')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                Facturas
              </a>
              <a
                (click)="navigateTo('/pagos')"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/pagos')"
                [class.nav-link-inactive]="!isActive('/pagos')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pagos
              </a>
            }

            <!-- SERVICIOS (TARIFAS) -->
            @if (auth.hasModule('TARIFAS')) {
              <a
                (click)="navigateTo('/servicios')"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/servicios')"
                [class.nav-link-inactive]="!isActive('/servicios')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.5 3.5c0-.83-.67-1.5-1.5-1.5S8.5 2.67 8.5 3.5 9.17 5 10 5s1.5-.67 1.5-1.5z"/>
                  <path d="M15.5 3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z"/>
                  <path d="M7.5 6.5c0-.83-.67-1.5-1.5-1.5S4.5 5.67 4.5 6.5 5.17 8 6 8s1.5-.67 1.5-1.5z"/>
                  <path d="M19.5 6.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z"/>
                  <path d="M12 22c-3 0-5.5-1.5-5.5-4 0-2 1.5-3.5 3-4.5.7-.5 1.5-.8 2.5-.8s1.8.3 2.5.8c1.5 1 3 2.5 3 4.5 0 2.5-2.5 4-5.5 4z"/>
                </svg>
                Servicios
              </a>
            }

            <!-- EMPLEADOS (USUARIOS) -->
            @if (auth.hasModule('USUARIOS')) {
              <a
                (click)="navigateTo('/empleados')"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/empleados')"
                [class.nav-link-inactive]="!isActive('/empleados')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Empleados
              </a>
            }

            <!-- ADMIN: Roles y Permisos -->
            @if (auth.hasModule('ROLES')) {
              <div class="pt-2 mt-2 border-t border-white/10">
                <p class="px-3 py-1 text-xs font-semibold text-[#CBCBCB]/50 uppercase tracking-wide">Admin</p>
                <a
                  (click)="navigateTo('/admin/roles')"
                  class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/admin/roles')"
                  [class.nav-link-inactive]="!isActive('/admin/roles')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Roles
                </a>
                <a
                  (click)="navigateTo('/admin/permisos')"
                  class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/admin/permisos')"
                  [class.nav-link-inactive]="!isActive('/admin/permisos')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Permisos
                </a>
              </div>
            }
          </nav>
        </aside>

        <div class="flex-1 flex flex-col min-w-0">
          <!-- Header -->
          <header class="header-glass h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 relative z-30">
            <div class="flex items-center gap-3">
              <button class="hamburger-btn lg:!hidden" (click)="sidebarOpen.set(true)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-[#CBCBCB] hidden sm:inline">{{ auth.nombreCompleto() }}</span>
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                  <div class="w-10 rounded-full bg-gradient-to-br from-[#0D7377] to-[#4A4A4A] flex items-center justify-center shadow-md">
                    <span class="text-[#FFFFE3] font-bold text-sm">
                      {{ inicialUsuario() }}
                    </span>
                  </div>
                </div>
                <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-lg bg-[#2A2A2A] rounded-xl w-52">
                  <li class="sm:hidden">
                    <span class="text-[#CBCBCB]">{{ auth.nombreCompleto() }}</span>
                  </li>
                  <li>
                    <a (click)="navigateTo('/mi-perfil')" class="text-[#CBCBCB] hover:bg-white/10 hover:text-[#FFFFE3]">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi Perfil
                    </a>
                  </li>
                  <li>
                    <a (click)="handleLogout()" class="text-[#CBCBCB] hover:bg-red-500/20 hover:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cerrar sesión
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </header>

          <!-- Main content -->
          <main class="flex-1 p-4 sm:p-6 overflow-auto">
            <router-outlet />
          </main>
        </div>
      </div>
    </div>
  `,
  styles: `
    .bg-layout {
      background: linear-gradient(-45deg, #0a1a1a, #0d2020, #0D7377, #0a1a1a);
      background-size: 400% 400%;
      animation: gradient-shift 15s ease infinite;
      min-height: 100vh;
    }

    .sidebar-glass {
      background: rgba(30, 30, 30, 0.95);
      backdrop-filter: blur(20px);
    }

    .header-glass {
      background: rgba(30, 30, 30, 0.9);
      backdrop-filter: blur(12px);
    }

    .hamburger-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(13, 115, 119, 0.2);
      color: #FFFFE3;
      border: 1px solid rgba(13, 115, 119, 0.3);
      transition: all 0.2s ease;
    }

    .hamburger-btn:hover {
      background: rgba(13, 115, 119, 0.4);
    }

    .nav-link {
      color: #CBCBCB;
    }

    .nav-link:hover {
      background: rgba(13, 115, 119, 0.15);
      color: #FFFFE3;
    }

    .nav-link-active {
      background: rgba(13, 115, 119, 0.2);
      color: #FFFFE3;
      font-weight: 600;
    }

    .nav-link-inactive {
      color: #CBCBCB;
    }

    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
})
export class DefaultLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidebarOpen = signal(false);

  readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly inicialUsuario = () => {
    const nombre = this.auth.nombreCompleto();
    return nombre ? nombre.charAt(0).toUpperCase() : '';
  };

  isActive(path: string, exact = false): boolean {
    const url = this.url();
    return exact ? url === path : url.startsWith(path);
  }

  async handleLogout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
    this.closeSidebar();
  }
}
