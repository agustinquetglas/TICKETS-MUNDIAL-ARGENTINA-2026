import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PedidosRepository } from './pedidos.repository';
import { TicketsRepository } from './tickets.repository';
import { PartidosModule } from '../partidos/partidos.module';
import { SectorModule } from '../sector/sector.module';

@Module({
    imports: [PartidosModule, SectorModule],
    controllers: [TicketsController],
    providers: [TicketsService, PedidosRepository, TicketsRepository]
})
export class TicketsModule { }