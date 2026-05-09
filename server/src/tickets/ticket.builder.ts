import { Ticket } from './tickets';

export class TicketBuilder {
    private pedidoId: string = '';
    private partidoId: number = 0;
    private sectorId: string = '';
    private vendido: boolean = false;
    private id?: string;

    public setPedidoId(pedidoId: string): TicketBuilder {
        this.pedidoId = pedidoId;
        return this;
    }

    public setPartidoId(partidoId: number): TicketBuilder {
        this.partidoId = partidoId;
        return this;
    }

    public setSectorId(sectorId: string): TicketBuilder {
        this.sectorId = sectorId;
        return this;
    }

    public setVendido(vendido: boolean): TicketBuilder {
        this.vendido = vendido;
        return this;
    }

    public setId(id: string): TicketBuilder {
        this.id = id;
        return this;
    }

    public build(): Ticket {
        if (!this.pedidoId || !this.partidoId || !this.sectorId) {
            throw new Error('Faltan datos obligatorios para construir el Ticket (pedidoId, partidoId, sectorId)');
        }

        const ticket = new Ticket(this.pedidoId, this.partidoId, this.sectorId);
        ticket.vendido = this.vendido;
        if (this.id) {
            ticket.id = this.id;
        }
        
        return ticket;
    }
}
