import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'El email no tiene un formato válido.' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    password: string;
}

export class RegisterDto {
    @IsString()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
    full_name: string;    // nombre completo, sin apellido separado

    @IsEmail({}, { message: 'El email no tiene un formato válido.' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    @Matches(/[A-Z]/, { message: 'La contraseña debe tener al menos una mayúscula.' })
    password: string;

    @IsString()
    @MinLength(7, { message: 'El documento debe tener al menos 7 caracteres.' })
    document: string;

    @IsString()
    @MinLength(8, { message: 'El teléfono debe tener al menos 8 caracteres.' })
    phone: string;

    @IsString()
    province: string;

    @IsString()
    locality: string;
}

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'El email no tiene un formato válido.' })
    email: string;
}