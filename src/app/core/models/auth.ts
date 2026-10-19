export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  idUsuario: number;
  nombreUsuario: string;
  correo: string;
  roles: string[];
  modulos: string[];
}

export interface RegisterRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono?: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  passwordActual: string;
  nuevaPassword: string;
}

export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  correo: string;
  roles: string[];
  modulos: string[];
  nombreCompleto?: string;
}
