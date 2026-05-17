import crypto from "crypto";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { StringValue } from 'ms';



const secretAccessToken=process.env.SECRET_ACCESS_TOKEN!;
const expiresInAccessToken=process.env.JWT_ACCESS_EXPIRES! as StringValue;
const secretRefreshToken= process.env.SECRET_REFRESH_TOKEN!;
  const expiresInRefreshToken=process.env.JWT_REFRESH_EXPIRES! as StringValue;


export const generateToken = (userId:string) => {
  
  const options: jwt.SignOptions = {expiresIn: expiresInAccessToken };
  const jti = crypto.randomUUID();
  return jwt.sign({ sub: userId,jti }, secretAccessToken, options);
};
export const generateRefreshToken = (userId:string) => {
  const options: jwt.SignOptions = { expiresIn:expiresInRefreshToken };
   const jti = crypto.randomUUID();
  return {refresh:jwt.sign({ sub: userId,jti }, secretRefreshToken, options),jti};
};
export const verifyRefresh=(refresh:string)=>{

  return jwt.verify(refresh,secretRefreshToken);
}

export const verifyToken=(token:string)=>{

  return jwt.verify(token,secretAccessToken) as JwtPayload;
}

export const getPayload=(refresh:string)=>{
  return jwt.decode(refresh) as  JwtPayload;
}