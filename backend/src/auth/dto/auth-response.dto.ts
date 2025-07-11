// src/auth/dto/auth-response.dto.ts
export class AuthResponseDto {
  access_token: string;
  shopkeeper: {
    id: string;
    email: string;
    name: string;
    shopName: string;
    phone?: string | null;  // allow null
    address: string;
  };
}
