import ms from 'ms';
import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { logger } from '../lib/logger.js';
import type { AuthService } from '../services/auth.service.js';
import {
  LoginUserDto,
  ParamRoleDto,
  RegisterUserDto,
  type ParamRoleDtoType,
} from '../dtos/user.dto.js';
import { AppError } from '../errors/app.error.js';
import { getZodError } from '../lib/zod.js';

import { verifyRefresh } from '../lib/jwt.js';
import type { JwtPayload } from 'jsonwebtoken';

export class AuthController {
  private service: AuthService;
  constructor(authService: AuthService) {
    this.service = authService;
  }
  private addCookiesToResponse = (
    res: Response,
    access: string,
    refresh: string,
  ) => {
    const cookieOptionAccess = this.getCookieOptions('access');
    const cookieOptionRefresh = this.getCookieOptions('refresh'); // save in db
    res.cookie('access_token', access, cookieOptionAccess);
    res.cookie('refresh_token', refresh, cookieOptionRefresh);
  };

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

      /*     const cookieOptionAccess = this.getCookieOptions('access');
      const cookieOptionRefresh = this.getCookieOptions('refresh'); // save in db
      res.cookie('access_token', accessToken, cookieOptionAccess);
      res.cookie('refresh_token', refreshToken, cookieOptionRefresh);
 */

      //todo  set cookie
      this.addCookiesToResponse(res, accessToken, refreshToken);

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
      res.locals.user = null;
      logger.info(req.signedCookies);
      return res.status(200).json({ ok: true, message: 'Successful logout' });
    } catch (error) {
      next(error);
    }
  };
  refreshUser = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('refresh endpoint');
    const refreshToken = req.signedCookies['refresh_token'];
    let payload: JwtPayload | string;
    try {
      payload = verifyRefresh(refreshToken);
    } catch (error) {
      logger.info(error);
      throw new AppError('invalid or expired Refresh');
    }

    if (typeof payload == 'string' || (!payload.sub && !payload.jti))
      throw new AppError('invalid refresh');
    try {
      const { refresh, access } = await this.service.refreshToken(
        payload.sub!,
        payload.jti!,
        refreshToken,
      );
      // set cookies
      this.addCookiesToResponse(res, access, refresh);
      return res
        .status(200)
        .json({ ok: true, message: 'successful refresh token' });
    } catch (error) {
      logger.info(error);
      next(error);
    }
  };
}
