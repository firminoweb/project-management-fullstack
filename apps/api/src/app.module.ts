import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { ProjectOrmEntity } from './projects/persistence/project.orm-entity';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Conexão SQLite via TypeORM. `synchronize` cria/atualiza o schema a partir
    // das entidades — adequado para o escopo do desafio (sem migrations).
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DATABASE_PATH') ?? 'data/app.sqlite',
        entities: [ProjectOrmEntity],
        synchronize: true,
      }),
    }),
    ProjectsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
