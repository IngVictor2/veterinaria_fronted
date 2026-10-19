export interface Factura {
  idFactura: number;
  idCliente: number;
  nombreCliente: string;
  fechaFactura: string;
  subtotal: number;
  descuento: number;
  total: number;
  estadoFactura: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
  items: FacturaDetalle[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface FacturaDetalle {
  idDetalle: number;
  idServicio: number;
  nombreServicio: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface CrearFacturaRequest {
  idCliente: number;
  descuento?: number;
  items: {
    idCita: number;
    idServicio: number;
    cantidad: number;
    precio: number;
  }[];
}

export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'ANULADA';
