import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { UsuariosRepository } from './usuarios.repository';

// SupabaseModule es @Global(), no hace falta importarlo acá
@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuariosRepository],
  exports: [UsuariosRepository],
})
export class UsuariosModule { }