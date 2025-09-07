import 'express';


export interface JwtPayload {
  user_id: string;
  role: string;
  email: string;
  display_name: string;
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: | JwtPayload;
	}
}
