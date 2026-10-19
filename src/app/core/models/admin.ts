export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Modulo {
  idModulo: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

export interface RolModulo {
  idRolModulo: number;
  idRol: number;
  idModulo: number;
  nombreModulo: string;
  estado: boolean;
}

export interface CrearRolRequest {
  nombre: string;
  descripcion: string;
}

export interface AsignarPermisoRequest {
  idRol: number;
  idModulo: number;
}

export interface AsignarRolUsuarioRequest {
  idUsuario: number;
  idRol: number;
}

export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  correo: string | null;
  nombreCompleto: string;
  tipoCuenta: 'EMPLEADO' | 'CLIENTE';
  idCliente: number | null;
  idEmpleado: number | null;
  cargo: string | null;
  roles: string[];
  estado: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
