import { IsString, IsDateString } from 'class-validator';

export class PartidoDto {
    @IsString()
    equipo_a: string;

    @IsString()
    equipo_b: string;

    @IsDateString()
    fecha: string;
}