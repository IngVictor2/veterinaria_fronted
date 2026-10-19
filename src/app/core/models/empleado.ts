export interface Empleado {
  idEmpleado: number;
  idUsuario: number | null;
  idCargo: number;
  nombreCargo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  fechaIngreso: string;
  nombreUsuario: string | null;
  roles: string[];
  estado: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CrearEmpleadoRequest {
  idCargo: number;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono: string;
  correo?: string;
  direccion?: string;
  fechaIngreso: string;
  password?: string;
}
