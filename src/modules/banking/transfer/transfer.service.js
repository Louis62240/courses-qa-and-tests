import { createTransferInRepository, getTransfersFromRepository } from "./transfer.repository";
import { patchAccountInRepository } from "../account/account.repository";
import { getAccountsFromRepository } from "../account/account.repository";

export async function createTransfer({ fromAccountId, toAccountId, amount }) {
  // Récupérer les comptes source et destination
  const [fromAccount] = await getAccountsFromRepository(undefined);
  const [toAccount] = await getAccountsFromRepository(undefined);

  // Vérifier que les comptes existent et que le solde est suffisant
  if (!fromAccount || !toAccount) throw new Error("Compte introuvable");
  if (fromAccount.amount < amount) throw new Error("Solde insuffisant");

  // Mettre à jour les montants
  await patchAccountInRepository({ accountId: fromAccountId, amount: fromAccount.amount - amount });
  await patchAccountInRepository({ accountId: toAccountId, amount: toAccount.amount + amount });

  // Créer le virement
  return await createTransferInRepository({ fromAccountId, toAccountId, amount });
}

export async function getTransfers(userId) {
  return await getTransfersFromRepository(userId);
}
