import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

// SupabaseModule es @Global(), no hace falta importarlo acá
@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule { }