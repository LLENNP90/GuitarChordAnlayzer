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
    voicingIndex?: number | null
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
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
        const fingerprint = JSON.stringify({
            key: input.key,
            mode: input.mode,
            notes: [...(input.notes ?? [])].sort(),
            chord: input.chord ?? [],
            voicingIndex: input.voicingIndex ?? null,
        });
        try{
            return prisma.saved.create({
                data: {
                    userId: input.userId,
                    name: input.name,
                    key: input.key,
                    mode: input.mode,
                    notes: input.notes ?? [],
                    chord: input.chord ?? [],
                    savedType: input.savedType,
                    voicingIndex: input.voicingIndex ?? null,
                    fingerprint
                },
            })
        } catch(err){
            if (isUniqueConstraintError(err)) throw ErrorResponses.SAVED_ALREADY_EXISTS

            throw err
        }

    }
    static async deleteSaved(input:{
        id: string,
        userId: string,
        savedType: SavedType;
    }){
        const saved = await prisma.saved.findFirst({
            where:{
                id: input.id,
                userId: input.userId,
                savedType: input.savedType,
            },
        });

        if (!saved) throw ErrorResponses.SAVED_NOT_FOUND

        await prisma.saved.delete({
            where: {id:saved.id}
        })

        return saved;
    }

    static async updateSavedName(input: {
        id: string,
        userId: string,
        savedType: SavedType,
        newSaveName: string
    }){
        const saved = await prisma.saved.findFirst({
            where:{
                id: input.id,
                userId: input.userId,
                savedType: input.savedType,
            },
        });

        if (!saved) throw ErrorResponses.SAVED_NOT_FOUND

        await prisma.saved.update({
            where: {id: saved.id},
            data: {name: input.newSaveName}
        })
    }
}