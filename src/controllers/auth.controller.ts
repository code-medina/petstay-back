import ms from 'ms';
import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { logger } from '../lib/logger.js';
import type { AuthService } from '../services/auth.service.js';
import {
  LoginUserDto,
  ParamRoleDto,
  RegisterUserDto,
  type ParamRoleDtoType,
} from '../dto/user.dto.js';
import { AppError } from '../errors/app.error.js';
import { getZodError } from '../lib/zod.js';

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
      throw new AppError(
        `JWT_${type.toUpperCase()}_EXPIRES is not defined`,
        500,
      );
    }

    const cookieOption: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', //true for HTTPS,
      maxAge: ms(accessExpires as ms.StringValue),
      signed: true,
      sameSite: 'lax',
    };
    return cookieOption;
  };
  // private addRole = (
  //   url: string,
  //   user: RegisterUserDtoType,
  // ): CreateUserDtoType => {
  //   let role: 'tenant' | 'landlord' = 'tenant';

  //   logger.info(url.includes('landlord'));
  //   if (url.includes('landlord')) {
  //     role = 'landlord';
  //   }
  //   return { ...user, role };
  // };

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const dto = RegisterUserDto.safeParse(req.body);

    try {
      if (!dto.success) {
        const message = getZodError(dto.error);
        throw new AppError(` Bad Request Register :${message}`, 400);
      }
      const roleParam = ParamRoleDto.safeDecode(req.params as ParamRoleDtoType);
      let role: 'tenant' | 'landlord' = 'tenant';
      if (roleParam.success) role = roleParam.data.role;

      //const user = this.addRole(req.originalUrl, dto.data);
      const user = { ...dto.data, role };

      const data = await this.service.registerUser(user);
      return res
        .status(201)
        .json({ ok: true, message: 'successfull register', data });
    } catch (error) {
      next(error);
    }
  };

  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(req.body);
      const dto = LoginUserDto.safeParse(req.body);
      if (!dto.success) {
        const message = getZodError(dto.error);
        throw new AppError(` Bad Request Login :${message}`, 400);
      }

      const { user, accessToken, refreshToken } = await this.service.loginUser(
        dto.data,
      );

      const cookieOptionAccess = this.getCookieOptions('access');
      const cookieOptionRefresh = this.getCookieOptions('refresh'); // save in db
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
  logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('logout');
    const refresh = req.signedCookies['refresh_token'];

    try {
      if (refresh && refresh.trim().length > 0) {
        await this.service.logoutUser(refresh);
      }
      //same option to clear
      const { maxAge, ...options } = this.getCookieOptions('refresh');
      logger.info({ message: 'delete maxAge', maxAge });
      res.clearCookie('refresh_token', options);
      res.clearCookie('access_token', options);
      logger.info(req.signedCookies);
      return res.status(200).json({ ok: true, message: 'Successful logout' });
    } catch (error) {
      next(error);
    }
  };
}
