import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-layout">
      <div class="flex min-h-screen">
        <!-- Mobile overlay -->
        @if (sidebarOpen()) {
          <div class="fixed inset-0 bg-black/60 z-40 lg:hidden" (click)="closeSidebar()"></div>
        }

        <!-- Sidebar -->
        <aside
          id="sidebar-navigation"
          class="sidebar-glass flex flex-col fixed lg:sticky lg:top-0 h-dvh shrink-0 inset-y-0 left-0 z-50 transform ease-in-out"
          [class.sidebar-collapsed]="sidebarCollapsed()"
          [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        >
          <div class="sidebar-brand px-3 h-16 shrink-0 flex items-center justify-between">
            <h1 class="text-lg font-bold text-[#374151] flex items-center gap-2">
              <img src="/logo.svg" alt="VetClinic" class="w-8 h-8 rounded-full" />
              <span class="sidebar-label">VetClinic</span>
            </h1>
            <button
              type="button"
              class="sidebar-toggle hidden lg:flex"
              aria-controls="sidebar-navigation"
              [attr.aria-expanded]="!sidebarCollapsed()"
              [attr.aria-label]="sidebarCollapsed() ? 'Expandir menú' : 'Contraer menú'"
              [title]="sidebarCollapsed() ? 'Expandir menú' : 'Contraer menú'"
              (click)="sidebarCollapsed.set(!sidebarCollapsed())"
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 transition-transform"
                [class.rotate-180]="sidebarCollapsed()"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m14 7-5 5 5 5"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Cerrar menú"
              class="btn btn-ghost btn-sm btn-circle lg:hidden"
              (click)="closeSidebar()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-[#374151]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav
            aria-label="Navegación principal"
            class="sidebar-nav flex-1 min-h-0 px-2 py-3 space-y-1 overflow-y-auto"
          >
            <!-- Dashboard -->
            <a
              [routerLink]="['/dashboard']"
              (click)="closeSidebar()"
              aria-label="Dashboard"
              title="Dashboard"
              class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              [class.nav-link-active]="isActive('/dashboard', true)"
              [class.nav-link-inactive]="!isActive('/dashboard', true)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span class="sidebar-label">Dashboard</span>
            </a>

            <!-- CLIENTE: Mis cosas -->
            @if (auth.hasRole('CLIENTE')) {
              @if (auth.hasModule('MASCOTAS')) {
                <a
                  [routerLink]="['/mis-mascotas']"
                  (click)="closeSidebar()"
                  aria-label="Mis Mascotas"
                  title="Mis Mascotas"
                  class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/mis-mascotas')"
                  [class.nav-link-inactive]="!isActive('/mis-mascotas')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .137 1.217 1.5 2 2.5 2s2-.5 3-.5 1.863.283 3 .5c1-.5 1.363-.783 1.5-2 .113-.994-1.177-6.53-4-7C8.423 2.678 6.5 3.782 6.5 5.172V7"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5.172C14 3.782 12.423 2.679 10.5 3c-2.823.47-4.113 6.006-4 7 .137 1.217 1.5 2 2.5 2s2-.5 3-.5 1.863.283 3 .5c1-.5 1.363-.783 1.5-2 .113-.994-1.177-6.53-4-7C12.423 2.678 10.5 3.782 10.5 5.172V7"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 14c-2.5 0-5 1.5-5 3v1h10v-1c0-1.5-2.5-3-5-3z"
                    />
                  </svg>
                  <span class="sidebar-label">Mis Mascotas</span>
                </a>
              }
              @if (auth.hasModule('CITAS')) {
                <a
                  [routerLink]="['/mis-citas']"
                  (click)="closeSidebar()"
                  aria-label="Mis Citas"
                  title="Mis Citas"
                  class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/mis-citas')"
                  [class.nav-link-inactive]="!isActive('/mis-citas')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span class="sidebar-label">Mis Citas</span>
                </a>
              }
              @if (auth.hasModule('FACTURACION')) {
                <a
                  [routerLink]="['/mis-facturas']"
                  (click)="closeSidebar()"
                  aria-label="Mis Facturas"
                  title="Mis Facturas"
                  class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/mis-facturas')"
                  [class.nav-link-inactive]="!isActive('/mis-facturas')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                    />
                  </svg>
                  <span class="sidebar-label">Mis Facturas</span>
                </a>
              }
            }

            <!-- CLIENTES -->
            @if (auth.hasModule('CLIENTES') && !auth.hasRole('CLIENTE')) {
              <a
                [routerLink]="['/clientes']"
                (click)="closeSidebar()"
                aria-label="Clientes"
                title="Clientes"
                class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/clientes')"
                [class.nav-link-inactive]="!isActive('/clientes')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="sidebar-label">Clientes</span>
              </a>
            }

            <!-- MASCOTAS -->
            @if (auth.hasModule('MASCOTAS') && !auth.hasRole('CLIENTE')) {
              <a
                [routerLink]="['/mascotas']"
                (click)="closeSidebar()"
                aria-label="Mascotas"
                title="Mascotas"
                class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/mascotas')"
                [class.nav-link-inactive]="!isActive('/mascotas')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .137 1.217 1.5 2 2.5 2s2-.5 3-.5 1.863.283 3 .5c1-.5 1.363-.783 1.5-2 .113-.994-1.177-6.53-4-7C8.423 2.678 6.5 3.782 6.5 5.172V7"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5.172C14 3.782 12.423 2.679 10.5 3c-2.823.47-4.113 6.006-4 7 .137 1.217 1.5 2 2.5 2s2-.5 3-.5 1.863.283 3 .5c1-.5 1.363-.783 1.5-2 .113-.994-1.177-6.53-4-7C12.423 2.678 10.5 3.782 10.5 5.172V7"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 14c-2.5 0-5 1.5-5 3v1h10v-1c0-1.5-2.5-3-5-3z"
                  />
                </svg>
                <span class="sidebar-label">Mascotas</span>
              </a>
            }

            <!-- CITAS -->
            @if (auth.hasModule('CITAS') && !auth.hasRole('CLIENTE')) {
              <a
                [routerLink]="['/citas']"
                (click)="closeSidebar()"
                aria-label="Citas"
                title="Citas"
                class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/citas')"
                [class.nav-link-inactive]="!isActive('/citas')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span class="sidebar-label">Citas</span>
              </a>
            }

            <!-- FACTURAS / PAGOS -->
            @if (auth.hasModule('FACTURACION') && !auth.hasRole('CLIENTE')) {
              <a
                [routerLink]="['/facturas']"
                (click)="closeSidebar()"
                aria-label="Facturas"
                title="Facturas"
                class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/facturas')"
                [class.nav-link-inactive]="!isActive('/facturas')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                  />
                </svg>
                <span class="sidebar-label">Facturas</span>
              </a>
              <a
                [routerLink]="['/pagos']"
                (click)="closeSidebar()"
                aria-label="Pagos"
                title="Pagos"
                class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/pagos')"
                [class.nav-link-inactive]="!isActive('/pagos')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span class="sidebar-label">Pagos</span>
              </a>
            }

            <!-- SERVICIOS (TARIFAS) -->
            @if (auth.hasModule('TARIFAS')) {
              <a
                [routerLink]="['/servicios']"
                (click)="closeSidebar()"
                aria-label="Servicios"
                title="Servicios"
                class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/servicios')"
                [class.nav-link-inactive]="!isActive('/servicios')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M11.5 3.5c0-.83-.67-1.5-1.5-1.5S8.5 2.67 8.5 3.5 9.17 5 10 5s1.5-.67 1.5-1.5z"
                  />
                  <path
                    d="M15.5 3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z"
                  />
                  <path
                    d="M7.5 6.5c0-.83-.67-1.5-1.5-1.5S4.5 5.67 4.5 6.5 5.17 8 6 8s1.5-.67 1.5-1.5z"
                  />
                  <path
                    d="M19.5 6.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z"
                  />
                  <path
                    d="M12 22c-3 0-5.5-1.5-5.5-4 0-2 1.5-3.5 3-4.5.7-.5 1.5-.8 2.5-.8s1.8.3 2.5.8c1.5 1 3 2.5 3 4.5 0 2.5-2.5 4-5.5 4z"
                  />
                </svg>
                <span class="sidebar-label">Servicios</span>
              </a>
            }

            <!-- EMPLEADOS (USUARIOS) -->
            @if (auth.hasModule('USUARIOS')) {
              <a
                [routerLink]="['/empleados']"
                (click)="closeSidebar()"
                aria-label="Empleados"
                title="Empleados"
                class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                [class.nav-link-active]="isActive('/empleados')"
                [class.nav-link-inactive]="!isActive('/empleados')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <span class="sidebar-label">Empleados</span>
              </a>
            }

            <!-- ADMIN: Roles y Permisos -->
            @if (auth.hasModule('ROLES')) {
              <div class="pt-2 mt-2 border-t border-gray-200">
                <p
                  class="sidebar-label px-3 py-1 text-xs font-semibold text-[#374151] uppercase tracking-wide"
                >
                  Admin
                </p>
                <a
                  [routerLink]="['/admin/roles']"
                  (click)="closeSidebar()"
                  aria-label="Roles"
                  title="Roles"
                  class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/admin/roles')"
                  [class.nav-link-inactive]="!isActive('/admin/roles')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span class="sidebar-label">Roles</span>
                </a>
                <a
                  [routerLink]="['/admin/permisos']"
                  (click)="closeSidebar()"
                  aria-label="Permisos"
                  title="Permisos"
                  class="nav-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  [class.nav-link-active]="isActive('/admin/permisos')"
                  [class.nav-link-inactive]="!isActive('/admin/permisos')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  <span class="sidebar-label">Permisos</span>
                </a>
              </div>
            }
          </nav>

          <div class="sidebar-account shrink-0 border-t border-gray-200 p-3">
            <details class="account-dropdown relative">
              <summary
                class="account-trigger"
                [attr.aria-label]="'Opciones de ' + auth.nombreCompleto()"
                [title]="auth.nombreCompleto()"
              >
                <span class="account-avatar">{{ inicialUsuario() }}</span>
                <span class="sidebar-label account-name"
                  >{{ auth.nombreCompleto() }}<small>Mi cuenta</small></span
                >
                <svg
                  class="sidebar-label h-4 w-4 shrink-0"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="m7 14 5-5 5 5" />
                </svg>
              </summary>
              <div class="account-menu">
                <p class="account-menu-name">{{ auth.nombreCompleto() }}</p>
                <a
                  routerLink="/mi-perfil"
                  (click)="closeAccount($event); closeSidebar()"
                  class="profile-menu-link"
                  >Mi perfil</a
                >
                <button type="button" (click)="closeAccount($event); handleLogout()">
                  Cerrar sesión
                </button>
              </div>
            </details>
          </div>
        </aside>

        <div class="flex-1 flex flex-col min-w-0">
          <button
            type="button"
            class="hamburger-btn mobile-menu-trigger lg:!hidden"
            aria-label="Abrir menú"
            aria-controls="sidebar-navigation"
            [attr.aria-expanded]="sidebarOpen()"
            (click)="sidebarOpen.set(true)"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <!-- Main content -->
          <main class="workspace-content flex-1 p-4 sm:p-6 overflow-auto">
            <router-outlet />
          </main>
        </div>
      </div>
    </div>
  `,
  styles: `
    .bg-layout {
      background-color: var(--page-background);
      min-height: 100vh;
    }

    .sidebar-glass {
      width: 208px;
      transition:
        width 200ms ease,
        transform 200ms ease;
      background: #ffffff;
      border-right: 1px solid #e5e7eb;
      box-shadow: 3px 0 12px rgba(31, 41, 55, 0.08);
    }

    .mobile-menu-trigger {
      position: fixed;
      top: 12px;
      left: 16px;
      z-index: 30;
      background: white;
      box-shadow: 0 2px 8px #00000012;
    }
    .account-trigger {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 8px;
      border-radius: 12px;
      cursor: pointer;
      list-style: none;
      color: #374151;
    }
    .account-trigger::-webkit-details-marker {
      display: none;
    }
    .account-trigger:hover,
    .account-dropdown[open] .account-trigger {
      background: #f5e6e7;
    }
    .account-trigger:focus-visible {
      outline: 2px solid #9d343c;
      outline-offset: 2px;
    }
    .account-avatar {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border-radius: 50%;
      background: #9d343c;
      color: white;
      font-size: 14px;
      font-weight: 700;
    }
    .account-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
      font-weight: 700;
    }
    .account-name small {
      display: block;
      margin-top: 3px;
      color: #6b7280;
      font-size: 10px;
      font-weight: 400;
    }
    .account-menu {
      position: absolute;
      bottom: calc(100% + 10px);
      left: 0;
      width: 190px;
      padding: 8px;
      border: 1px solid #e5e7eb;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 28px #00000020;
      z-index: 60;
    }
    .account-menu-name {
      padding: 8px;
      overflow-wrap: anywhere;
      color: #6b7280;
      font-size: 12px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 4px;
    }
    .account-menu a,
    .account-menu button {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px;
      font-size: 13px;
      cursor: pointer;
      border-radius: 8px;
    }
    .account-menu button:hover {
      background: #f5e6e7;
      color: #9d343c;
    }
    @media (max-width: 1023px) {
      .workspace-content {
        padding-top: 68px;
      }
    }
    @media (min-width: 1024px) {
      .sidebar-collapsed .sidebar-account {
        padding-inline: 8px;
      }
      .sidebar-collapsed .account-trigger {
        padding: 6px 0;
        justify-content: center;
      }
    }
    .sidebar-label {
      white-space: nowrap;
    }
    .nav-link {
      min-height: 40px;
    }
    .nav-link svg {
      flex-shrink: 0;
    }
    .nav-link:focus-visible,
    .sidebar-toggle:focus-visible {
      outline: 2px solid #9d343c;
      outline-offset: 2px;
    }
    .sidebar-toggle {
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #9d343c;
      cursor: pointer;
    }
    .sidebar-toggle:hover {
      background: #f3f4f6;
    }
    @media (min-width: 1024px) {
      .sidebar-collapsed {
        width: 72px;
      }
      .sidebar-collapsed .sidebar-label {
        display: none;
      }
      .sidebar-collapsed .sidebar-brand {
        height: auto;
        min-height: 104px;
        padding-block: 12px;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }
      .sidebar-collapsed .nav-link {
        justify-content: center;
        padding-inline: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .sidebar-glass {
        transition: none;
      }
    }

    .profile-menu-link {
      border-radius: 8px;
      transition:
        background-color 150ms ease,
        box-shadow 150ms ease;
    }

    .profile-menu-link:hover,
    .profile-menu-link:focus-visible {
      background-color: #e5e7eb;
      box-shadow: inset 0 0 8px rgba(55, 65, 81, 0.08);
      color: #1f2937;
    }

    .hamburger-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(157, 52, 60, 0.2);
      color: #1f2937;
      border: 1px solid rgba(157, 52, 60, 0.3);
      transition: all 0.2s ease;
    }

    .hamburger-btn:hover {
      background: rgba(157, 52, 60, 0.4);
    }

    .nav-link {
      color: #263140;
    }

    .nav-link:hover {
      background: rgba(157, 52, 60, 0.15);
      color: #1f2937;
    }

    .nav-link-active {
      background: rgba(157, 52, 60, 0.2);
      color: #1f2937;
      font-weight: 600;
    }

    .nav-link-inactive {
      color: #263140;
    }
  `,
})
export class DefaultLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);

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

  closeAccount(event: Event): void {
    (event.target as HTMLElement).closest('details')?.removeAttribute('open');
  }

  ngOnInit(): void {
    void this.auth.fetchProfile();
  }

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
