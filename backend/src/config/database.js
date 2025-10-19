import mysql from "mysql2";

export const dbPool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
  })
  .promise();

export const testDbConnection = async () => {
  try {
    await dbPool.query("SELECT 1");
    console.log("Database connection was successful");
  } catch (error) {
    console.error("Database connection has failed:", error.message);
    process.exit(1); // Stop the server
  }
};
