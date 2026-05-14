import { prisma } from "../libs/prisma.js";
import { ErrorResponses } from "../error/error.js";
import type { TUser } from "../types.js";

type SavedType = "chord" | "scale" | "progression";

interface SavedTheoryProp{
    id: string
    userId: string
    savedType: SavedType
}

interface AddSaveInput{
    userId: string
    name: string
    key: string
    mode: string
    notes?: string[]
    chord?: string[]
    savedType: SavedType
    
}

export class SavedTheory{
    static async getSavedTheory(input: SavedTheoryProp) {
        const saved = await prisma.saved.findFirst({
            where: {id: input.id, userId: input.userId, savedType: input.savedType},
        }); 
        
        if (!saved) throw ErrorResponses.SAVED_NOT_FOUND;

        return saved
    }

    static async getAllSaved(input: {
        userId: string;
        savedType: SavedType
    }) {
        return prisma.saved.findMany({
            where: {
                userId: input.userId,
                savedType: input.savedType,
            },
            orderBy:{
                createdAt: "desc",
            }
        })
    }

    static async create(input: AddSaveInput){
        return prisma.saved.create({
            data: {
                userId: input.userId,
                name: input.name,
                key: input.name,
                mode: input.mode,
                notes: input.notes ?? [],
                chord: input.chord ?? [],
                savedType: input.savedType
            },
        })
    }
}