import { sql } from "../../../infrastructure/db";

export async function createTransferInRepository({ fromAccountId, toAccountId, amount }) {
  const transfers = await sql`
    INSERT INTO transfers (fromAccountId, toAccountId, amount)
    VALUES (${fromAccountId}, ${toAccountId}, ${amount})
    RETURNING *
  `;
  return transfers[0];
}

export async function getTransfersFromRepository(userId) {
  // On récupère les transferts où l'utilisateur est soit l'émetteur soit le destinataire
  return await sql`
    SELECT t.* FROM transfers t
    JOIN accounts a1 ON t.fromAccountId = a1.id
    JOIN accounts a2 ON t.toAccountId = a2.id
    WHERE a1.userId = ${userId} OR a2.userId = ${userId}
  `;
}
