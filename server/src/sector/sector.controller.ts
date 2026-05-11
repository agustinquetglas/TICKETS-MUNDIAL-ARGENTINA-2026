import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SectorRepository } from './sector.repository';

@Controller('sectores')
export class SectorController {
    constructor(private readonly sectorRepo: SectorRepository) {}

    @Get(':partidoId')
    async obtenerPorPartido(@Param('partidoId') partidoIdStr: string) {
        console.log('RECEIVED PARTIDO ID:', partidoIdStr, 'TYPE:', typeof partidoIdStr);
        const partidoId = parseInt(partidoIdStr, 10);
        if (isNaN(partidoId)) {
            console.log('IT IS NAN!');
            throw new Error('Invalid numeric string: ' + partidoIdStr);
        }
        return await this.sectorRepo.obtenerPorPartido(partidoId);
    }
}