import { Router } from "express";
import { SavedTheory } from "../services/saved.js";
import { Success, ErrorResponses } from "../error/error.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

type SavedParams = {
  type: string;
};

type SavedByIdParams = {
  type: string;
  id: string;
}

const isSavedType = (type: string): type is "chord" | "scale" | "progression" => {
     return ["chord", "scale", "progression"].includes(type);
}

router.get<SavedParams>("/:type", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      throw ErrorResponses.UNAUTHORISED;
    }

    const { type } = req.params;

    if (typeof type !== "string" || !isSavedType(type)) {
      throw ErrorResponses.INVALID_FORMAT;
    }

    const saved = await SavedTheory.getAllSaved({
      userId: req.user.id,
      savedType: type,
    });

    return Success(res, { saved });
  } catch (err) {
    next(err);
  }
});
router.get<SavedByIdParams>("/:type/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      throw ErrorResponses.UNAUTHORISED;
    }

    const { type, id } = req.params;


    if (typeof type !== "string" || !isSavedType(type)) {
      throw ErrorResponses.INVALID_FORMAT;
    }

    const saved = await SavedTheory.getSavedTheory({
      id,
      userId: req.user.id,
      savedType: type,
    });

    return Success(res, { saved });
  } catch (err) {
    next(err);
  }
});

router.post(
    "/:type", authMiddleware,
    async(req,res,next) => {
        try{
            if (!req.user) throw ErrorResponses.UNAUTHORISED

            const { type } = req.params;

            if (typeof type !== "string" || !isSavedType(type)) throw ErrorResponses.INVALID_FORMAT

            const { name, key, mode, notes, chord, voicingIndex } = req.body;

            if (!name) throw ErrorResponses.MISSING_FIELDS

            const saved = await SavedTheory.create({
                userId: req.user.id,
                savedType: type,
                name,
                key,
                mode,
                notes,
                chord,
                voicingIndex
            });

            Success(res, { saved });
        } catch (err) {
            next(err);
        }
    }
)

router.delete<SavedByIdParams>(
  "/:type/:id", authMiddleware,
  async (req,res,next) => {
    try{
      if (!req.user) throw ErrorResponses.UNAUTHORISED;

      const {type,id} = req.params;

      if (!isSavedType(type)) throw ErrorResponses.INVALID_FORMAT;

      const saved = await SavedTheory.deleteSaved({
        id,
        userId: req.user.id,
        savedType: type,
      });
      
      Success(res, {saved})
    } catch(err){
      next(err)
    }
  }
)

router.patch<SavedByIdParams>(
  "/:type/:id", authMiddleware,
  async (req,res,next) => {
    try{
      if (!req.user) throw ErrorResponses.UNAUTHORISED;
      
      const {type,id} = req.params;
      const { name } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw ErrorResponses.MISSING_FIELDS;
      }
      if (!isSavedType(type)) throw ErrorResponses.INVALID_FORMAT;

      const saved = await SavedTheory.updateSavedName({
        id,
        userId: req.user.id,
        savedType: type,
        newSaveName: name.trim()
      })

      Success(res, {saved});
    } catch (err) {
      next(err)
    }
  }
)

export default router