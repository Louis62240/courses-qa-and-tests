import { z } from "zod";
import { createAccountInRepository, getAccountsFromRepository, deleteAccountFromRepository } from "./account.repository";

const AccountSchema = z.object({
  userId: z.number().int().positive(),
  amount: z.number(),
});

export async function createAccount(data) {
  const result = AccountSchema.safeParse(data);
  if (!result.success) throw new Error("Invalid account data");
  return createAccountInRepository(result.data);
}

export async function getAccounts(userId) {
  if (!userId || typeof userId !== "number") throw new Error("Invalid userId");
  return getAccountsFromRepository(userId);
}

export async function deleteAccount(userId, accountId) {
  if (!userId || !accountId) throw new Error("Invalid arguments");
  return deleteAccountFromRepository(userId, accountId);
}
