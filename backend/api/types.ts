/** Contratos de ServeRest usados por la suite (los campos están en portugués, como la API). */

export interface UserPayload {
  nome: string;
  email: string;
  password: string;
  /** La API lo recibe como texto, no como booleano */
  administrador: 'true' | 'false';
}

export interface User extends UserPayload {
  _id: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface ProductPayload {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

export interface Product extends ProductPayload {
  _id: string;
}

export interface MessageResponse {
  message: string;
}

export interface CreatedResponse extends MessageResponse {
  _id: string;
}

export interface LoginResponse extends MessageResponse {
  authorization: string;
}

export interface UserListResponse {
  quantidade: number;
  usuarios: User[];
}

export interface ProductListResponse {
  quantidade: number;
  produtos: Product[];
}
