import { createTransfer, getTransfers } from "./transfer.service";
import * as transferRepository from "./transfer.repository";
import * as accountRepository from "../account/account.repository";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Transfer Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTransfer", () => {
    it("réussi", async () => {
      vi.spyOn(accountRepository, 'getAccountsFromRepository')
        .mockResolvedValueOnce([{ id: 1, amount: 100 }])
        .mockResolvedValueOnce([{ id: 2, amount: 50 }]);
      vi.spyOn(accountRepository, 'patchAccountInRepository').mockResolvedValue({});
      vi.spyOn(transferRepository, 'createTransferInRepository').mockResolvedValue({ id: 1, fromAccountId: 1, toAccountId: 2, amount: 30 });

      const result = await createTransfer({ fromAccountId: 1, toAccountId: 2, amount: 30 });
      expect(result).toEqual({ id: 1, fromAccountId: 1, toAccountId: 2, amount: 30 });
      expect(accountRepository.patchAccountInRepository).toHaveBeenCalledTimes(2);
      expect(transferRepository.createTransferInRepository).toHaveBeenCalled();
    });

    it("échoue avec de mauvais paramètres", async () => {
      // Mock pour simuler qu'aucun compte n'est trouvé pour fromAccountId
      vi.spyOn(accountRepository, 'getAccountsFromRepository')
        .mockResolvedValueOnce([]) // Premier appel pour fromAccountId
        .mockResolvedValueOnce([{ id: 2, amount: 50 }]); // Deuxième appel pour toAccountId
      
      await expect(createTransfer({ fromAccountId: 1, toAccountId: 2, amount: 30 }))
        .rejects.toThrow("Compte introuvable");
    });

    it("échoue avec un mauvais montant", async () => {
      vi.spyOn(accountRepository, 'getAccountsFromRepository')
        .mockResolvedValueOnce([{ id: 1, amount: 10 }])
        .mockResolvedValueOnce([{ id: 2, amount: 50 }]);
      await expect(createTransfer({ fromAccountId: 1, toAccountId: 2, amount: 30 }))
        .rejects.toThrow("Solde insuffisant");
    });

    it("échoue avec une valeur négative", async () => {
      // Ne pas mocker les repositories pour ce test si la validation se fait avant
      await expect(createTransfer({ fromAccountId: 1, toAccountId: 2, amount: -10 }))
        .rejects.toThrow();
    });
  });

  describe("getTransfers", () => {
    it("réussi en vérifiant chaque élément de la liste", async () => {
      const mockTransfers = [
        { id: 1, fromAccountId: 1, toAccountId: 2, amount: 10 },
        { id: 2, fromAccountId: 2, toAccountId: 1, amount: 5 }
      ];
      vi.spyOn(transferRepository, 'getTransfersFromRepository').mockResolvedValue(mockTransfers);
      const result = await getTransfers(1);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      result.forEach((t, i) => {
        expect(t).toEqual(mockTransfers[i]);
      });
    });
  });
});