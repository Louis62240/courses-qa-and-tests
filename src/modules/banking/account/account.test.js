import { describe, it, expect, vi, afterEach } from "vitest";

// Mock du repository
vi.mock("./account.repository", async (importOriginal) => ({
  ...(await importOriginal()),
  createAccountInRepository: vi.fn((data) => ({
    id: 1,
    userId: data.userId,
    amount: data.amount,
  })),
  getAccountsFromRepository: vi.fn((userId) => [
    { id: 1, userId, amount: 100 },
    { id: 2, userId, amount: 200 },
  ]),
  deleteAccountFromRepository: vi.fn((userId, accountId) => true),
}));

import {
  createAccount,
  getAccounts,
  deleteAccount,
} from "./account.service.js";
import {
  createAccountInRepository,
  getAccountsFromRepository,
  deleteAccountFromRepository,
} from "./account.repository.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Account Service", () => {
  it("should create an account", async () => {
    const input = { userId: 1, amount: 100 };
    const account = await createAccount(input);
    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.userId).toBe(1);
    expect(account.amount).toBe(100);
  });

  it("should get accounts for a user", async () => {
    const accounts = await getAccounts(1);
    expect(accounts).toBeInstanceOf(Array);
    expect(accounts.length).toBeGreaterThan(0);
    accounts.forEach((acc) => expect(acc.userId).toBe(1));
  });

  it("should delete an account for a user", async () => {
    const result = await deleteAccount(1, 1);
    expect(result).toBe(true);
  });

  // 🔴 TESTS DE GESTION D'ERREUR

  it("should throw error if createAccountInRepository fails", async () => {
    createAccountInRepository.mockImplementationOnce(() => {
      throw new Error("DB error during account creation");
    });

    await expect(createAccount({ userId: 1, amount: 100 })).rejects.toThrow(
      "DB error during account creation"
    );
  });

  it("should throw error if getAccountsFromRepository fails", async () => {
    getAccountsFromRepository.mockImplementationOnce(() => {
      throw new Error("Failed to fetch accounts");
    });

    await expect(getAccounts(1)).rejects.toThrow("Failed to fetch accounts");
  });

  it("should throw error if deleteAccountFromRepository fails", async () => {
    deleteAccountFromRepository.mockImplementationOnce(() => {
      throw new Error("Deletion failed");
    });

    await expect(deleteAccount(1, 1)).rejects.toThrow("Deletion failed");
  });
});
