export interface Pago {
  idPago: number;
  idFactura: number;
  idMetodoPago: number;
  nombreMetodoPago: string;
  fechaPago: string;
  monto: number;
  referenciaPago: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CrearPagoRequest {
  idFactura: number;
  idMetodoPago: number;
  monto: number;
  referenciaPago?: string;
}
