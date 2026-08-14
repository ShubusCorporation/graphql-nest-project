import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Делает модуль глобальным, чтобы не импортировать его вручную в каждый модуль
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Позволяет другим модулям использовать PrismaService
})
export class PrismaModule {}
