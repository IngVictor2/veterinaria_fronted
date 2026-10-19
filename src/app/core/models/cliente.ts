export interface Cliente {
  idCliente: number;
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  estado: boolean;
  nombreUsuario: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearClienteRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono: string;
  correo?: string;
  direccion?: string;
}

export interface ActualizarClienteRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono: string;
  correo?: string;
  direccion?: string;
}
