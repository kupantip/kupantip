import * as models from '../models/init.models';
import { Request, Response, NextFunction } from 'express';

const init = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const data = await models.init();
		// console.log(data);
		console.log(data.recordset[0].One);
		res.status(200).json({
			message: `Hi init`,
			data: data,
		});
	} catch (error) {
		next(error);
	}
};

export { init };
