import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import type { AuthService } from '../services/auth.service.js';
import {
  RegisterUserDto,
  type CreateUserDtoType,
  type RegisterUserDtoType,
} from '../dto/user.dto.js';

export class AuthController {
  private service: AuthService;
  constructor(authService: AuthService) {
    this.service = authService;
  }

  private addRole = (
    url: string,
    user: RegisterUserDtoType,
  ): CreateUserDtoType => {
    let role: 'tenant' | 'landlord' = 'tenant';
   
    logger.info(url.includes('landlord'));
    if (url.includes('landlord')) {
      role = 'landlord';
    }
    return { ...user, role };
  };
  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const dto = RegisterUserDto.safeParse(req.body);
    if (dto.success) {
      const user = this.addRole(req.originalUrl, dto.data);
      try {
        const data = await this.service.registerUser(user);
        return res
          .status(201)
          .json({ ok: true, message: 'successfull register', data });
      } catch (error) {
        next(error);
      }
    }
    next(new Error(dto.error?.issues.map((m) => m.message).join('-')));
  };
  
}
