import { Response } from 'express';

export const err = (message: string): Error => {
  return new Error(message);
};
export const resError = (response: Response, error: any): void => {
  response.status(500).json({ error: error.message });
};
