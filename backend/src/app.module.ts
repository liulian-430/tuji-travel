import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsModule } from './trips/trips.module';
import { PoisModule } from './pois/pois.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DB_TYPE') || 'sqlite';

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: parseInt(configService.get('DB_PORT')),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'better-sqlite3',
          database: configService.get('DB_DATABASE') || ':memory:',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    TripsModule,
    PoisModule,
    UsersModule,
    AuthModule,
    AiModule,
  ],
})
export class AppModule {}
