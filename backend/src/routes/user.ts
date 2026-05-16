import { Router } from "express";
import { UserService } from "../services/user.js";
import { Success, ErrorResponses } from "../error/error.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

//remove later
router.get(
  "/", 
  async (_req, res, next) => {
    try {
      const users = await UserService.fetchAllUsers();
      return Success(res, { users });
    } catch (err) {
      next(err);
    }
});

router.get(
  "/me", 
  authMiddleware, 
  async (req, res, next) => {
    try {
      if (!req.user) {
        throw ErrorResponses.UNAUTHORISED;
      }

      const user = await UserService.fetchUserById(req.user.id);

      if (!user) {
        throw ErrorResponses.USER_NOT_FOUND;
      }

      Success(res, { user });
    } catch (err) {
      next(err);
    }
});

//login
router.post(
    "/login",
    async (req, res, next) => {
        try{
            const {username, password} = req.body;

            if (!username || !password){
                throw ErrorResponses.MISSING_FIELDS
            }
            const result = await UserService.login(username, password);

            return Success(res,result)

        } catch (err){
            next(err)
        }
    }
)

//signup
router.post(
  "/signup",
  async (req,res,next) => {
    try{
      const {username, email, password, name} = req.body;

      if (!username || !email || !password) throw ErrorResponses.MISSING_FIELDS;

      const result = await UserService.create({
        username,
        email,
        password,
        name
      });

      Success(res, result)
    } catch(err){
      next(err)
    }
  }
)

router.patch(
  "/me", authMiddleware,
  async (req,res,next) => {
    try{
      if (!req.user) throw ErrorResponses.UNAUTHORISED;
    
      const {username, email, name} = req.body

      if (!username && !email && !name) throw ErrorResponses.MISSING_FIELDS;

      const updatedUser = await UserService.editUser(req.user.id, {
        username,
        email,
        name
      })

      Success(res, {user: updatedUser})
    } catch (err) {
      next(err);
    }
  }
)

export default router;
