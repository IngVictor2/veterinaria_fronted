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

export interface WompiCheckoutRequest {
  idFactura: number;
}

export interface WompiCheckoutResponse {
  idTransaccion: number;
  referencia: string;
  montoCentavos: number;
  moneda: string;
  llavePublica: string;
  firmaIntegridad: string;
  correoCliente: string;
  nombreCliente: string;
}

export interface WompiVerificarRequest {
  referencia: string;
  idTransaccionWompi?: string;
}

export type EstadoTransaccionWompi = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ANULADA' | 'ERROR';

export interface WompiVerificacionResponse {
  referencia: string;
  estado: EstadoTransaccionWompi;
  estadoFactura: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
  mensaje: string;
  idTransaccionWompi: string | null;
  montoCentavos: number;
}

export interface WompiWidgetConfig {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  signature: { integrity: string };
  customerData: { email: string; fullName?: string };
  redirectUrl?: string;
}

export interface WompiWidgetResult {
  transaction?: {
    id?: string;
    status?: string;
    reference?: string;
  };
}
