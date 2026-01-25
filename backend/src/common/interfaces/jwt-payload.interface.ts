export interface JwtPayload {
  sub: string;
  email: string;
  role: 'CUSTOMER' | 'DELIVERY_PERSON' | 'CSR';
}
