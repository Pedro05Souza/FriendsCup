export interface ChampionshipRepository {
    create(title: string): Promise<void>;
}

export const championshipRepositoryToken = Symbol('ChampionshipRepository');