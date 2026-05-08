import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { logger } from '../lib/logger.js';
import type { AuthService } from '../services/auth.service.js';
import {
  LoginUserDto,
  RegisterUserDto,
  type CreateUserDtoType,
  type RegisterUserDtoType,
} from '../dto/user.dto.js';
import ms from 'ms';

export class AuthController {
  private service: AuthService;
  constructor(authService: AuthService) {
    this.service = authService;
  }

  private getCookieOptions = (type: 'access' | 'refresh'): CookieOptions => {
    const accessExpires =
      type === 'access'
        ? process.env.JWT_ACCESS_EXPIRES
        : process.env.JWT_REFRESH_EXPIRES;
    if (!accessExpires) {
      throw new Error('ENV EXPIRES is not defined');
    }

    const cookieOption: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', //true for HTTPS,
      maxAge: ms(accessExpires as ms.StringValue),
      signed: true,
    };
    return cookieOption;
  };
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

    try {
      if (dto.success) {
        const user = this.addRole(req.originalUrl, dto.data);
        const data = await this.service.registerUser(user);
        return res
          .status(201)
          .json({ ok: true, message: 'successfull register', data });
      } else {
        throw new Error(dto.error.issues.map((m) => m.message).join('-'));
      }
    } catch (error) {
      next(error);
    }
  };

  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(req.body);
      const dto = LoginUserDto.safeParse(req.body);
      if (!dto.success)
        throw new Error(dto.error.issues.map((m) => m.message).join(' - '));

      const { user, accessToken, refreshToken } = await this.service.loginUser(
        dto.data,
      );

      const cookieOptionAccess = this.getCookieOptions('access');
      const cookieOptionRefresh = this.getCookieOptions('refresh');
      res.cookie('access_token', accessToken, cookieOptionAccess);
      res.cookie('refresh_token', refreshToken, cookieOptionRefresh);

      //todo  set cookie
      return res.json({
        ok: true,
        message: 'successfull login',
        user: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
