import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SectorRepository } from './sector.repository';

@Controller('sectores')
export class SectorController {
    constructor(private readonly sectorRepo: SectorRepository) {}

    @Get(':partidoId')
    async obtenerPorPartido(@Param('partidoId', ParseIntPipe) partidoId: number) {
        return await this.sectorRepo.obtenerPorPartido(partidoId);
    }
}
