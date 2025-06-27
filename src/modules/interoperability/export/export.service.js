import xlsx from "node-xlsx";
import fs from "fs";
import { getTransfersFromRepository } from "../../banking/transfer/transfer.repository";

export async function createExport(userId, filePath) {
  // Récupérer les transferts de l'utilisateur
  const transfers = await getTransfersFromRepository(userId);

  // Préparer les données pour xlsx
  const data = [
    ["ID", "FromAccountId", "ToAccountId", "Amount"],
    ...transfers.map(t => [t.id, t.fromaccountid, t.toaccountid, t.amount])
  ];

  // Générer le buffer xlsx
  const buffer = xlsx.build([{ name: "Transferts", data }]);

  // Écrire le fichier
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
