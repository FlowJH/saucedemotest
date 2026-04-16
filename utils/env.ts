import * as dotenv from 'dotenv';

dotenv.config();

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[ENV ERROR] ${key}가 설정되지 않았습니다.`);
  }
  return value;
}

export const ENV = {
  BASE_URL: 'https://www.saucedemo.com/',
  INVENTORY_URL: 'https://www.saucedemo.com/inventory.html',

  PASSWORD: getEnv('SAUCE_PW'),

  USERS: {
    STANDARD: getEnv('STANDARD_USER'),
    LOCKED: getEnv('LOCKED_USER'),
    PROBLEM: getEnv('PROBLEM_USER'),
    PERFORMANCE: getEnv('PERFORMANCE_USER'),
    ERROR: getEnv('ERROR_USER'),
    VISUAL: getEnv('VISUAL_USER'),
  },
};