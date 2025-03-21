import { Database } from 'node_modules/sqlite3/lib/sqlite3';

export const connectToDatabase = async (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    const db = new Database('src/db/fantasy/fantasy.sqlite', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};
