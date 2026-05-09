import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto, RegisterDto, ForgotPasswordDto } from './dto/usuario.dto';

@Injectable()
export class UsuariosService {

    constructor(private readonly supabaseService: SupabaseService) { }

    async login(dto: LoginDto) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });

        if (error) {
            throw new UnauthorizedException('Email o contraseña incorrectos.');
        }

        return {
            session: data.session,
            user: data.user
        };
    }

    async register(dto: RegisterDto) {
        const supabase = this.supabaseService.getClient();

        // 1. Crear el usuario en Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: dto.email,
            password: dto.password,
            options: {
                data: {
                    full_name: dto.full_name,
                    document: dto.document,
                    phone: dto.phone,
                    province: dto.province,
                    locality: dto.locality
                }
            },
        });

        if (error) throw new BadRequestException(error.message);

        // 2. Guardar los datos extra en la tabla Usuario
        if (data.user) {
            await supabase
                .from('Usuario')
                .update({
                    Nombre: dto.full_name,
                    Documento: dto.document,
                    Telefono: dto.phone,
                    Provincia: dto.province,
                    Localidad: dto.locality,
                })
                .eq('id', data.user.id);
        }

        return {
            message: 'Cuenta creada con éxito. Por favor, verificá tu correo electrónico.'
        };
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase.auth.resetPasswordForEmail(dto.email, {
            redirectTo: 'http://localhost:3000/login/actualizar-contraseña',
        });

        if (error) throw new BadRequestException(error.message);

        return { message: 'Se ha enviado un correo para restablecer tu contraseña.' };
    }
}