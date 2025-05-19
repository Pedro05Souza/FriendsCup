import { Injectable } from "@nestjs/common";
import { ChampionshipRepository } from "../../domain/interfaces/championship.interface";
import { PrismaClientService } from "src/application/services/prisma-client";



@Injectable()
export class ChampionshipRepositoryImpl implements ChampionshipRepository {
    constructor(private readonly _prismaService: PrismaClientService) {}
    
    async create(title: string): Promise<void> {
        await this._prismaService.prisma.championship.create({
            data: {
                title,
            },
        });
    }
}