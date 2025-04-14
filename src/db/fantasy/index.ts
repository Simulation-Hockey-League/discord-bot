import sqlite3, { Database } from 'sqlite3';

export const connectToDatabase = async (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('src/db/fantasy/fantasy.sqlite', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};
