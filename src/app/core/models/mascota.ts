export interface Mascota {
  idMascota: number;
  idCliente: number;
  nombreCliente: string;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: string;
  fechaNacimiento: string | null;
  peso: number | null;
  observaciones: string | null;
  estado: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CrearMascotaRequest {
  idCliente: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo: string;
  fechaNacimiento?: string;
  peso?: number;
  observaciones?: string;
}
