import bcrypt from "bcrypt";
import { prisma } from "../libs/prisma.js";
import { signToken } from "../libs/jwt.js";
import { ErrorResponses } from "../error/error.js";

interface SignUpInput{
  username: string
  email: string
  password: string
  name: string
}

interface EditInput{
  username: string
  email: string
  name: string 
}

export class UserService {
  static async fetchAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  static async fetchUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  static async login(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw ErrorResponses.INVALID_CREDENTIALS;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw ErrorResponses.INVALID_CREDENTIALS;
    }

    const token = signToken({
      id: user.id,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    };
  }
  
  static async create(input: SignUpInput) {
    const {username, email, password, name} = input

    //check existing Usernames/Emails
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) throw ErrorResponses.USERNAME_TAKEN

    const existingEmail = await prisma.user.findUnique({
      where: {email}
    });
  
    if (existingEmail) throw ErrorResponses.EMAIL_TAKEN

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        name,
      },
    })

    const token =  signToken({
      id: user.id,
      username: user.username
    })

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    };
  }
  static async editUser(id:string, input: EditInput){
    const { username, email, name } = input;

    if (username) { 
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      });
      if (existingUsername && existingUsername.id !== id) throw ErrorResponses.USERNAME_TAKEN
    }
    if (email) { 
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });
      if (existingEmail && existingEmail.id !== id) throw ErrorResponses.EMAIL_TAKEN
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        name,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }
}
