import { sql } from "../../../infrastructure/db";

export async function createAccountInRepository({ userId, amount }) {
  const accounts = await sql`
    INSERT INTO accounts (userId, amount)
    VALUES (${userId}, ${amount})
    RETURNING *
  `;
  return accounts[0];
}

export async function getAccountsFromRepository(userId) {
  return await sql`
    SELECT * FROM accounts WHERE userId = ${userId}
  `;
}

export async function deleteAccountFromRepository(userId, accountId) {
  const result = await sql`
    DELETE FROM accounts WHERE id = ${accountId} AND userId = ${userId}
    RETURNING *
  `;
  return result.length > 0;
}

export async function patchAccountInRepository({ accountId, amount }) {
  const result = await sql`
    UPDATE accounts SET amount = ${amount} WHERE id = ${accountId}
    RETURNING *
  `;
  return result[0];
}
