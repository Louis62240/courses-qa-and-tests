import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as xlsx from 'node-xlsx';
import fs from 'fs';
import * as exportService from './export.service.js';
import * as transferRepository from '../../banking/transfer/transfer.repository.js';

// Mock complet du module node-xlsx
vi.mock('node-xlsx', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      build: vi.fn()
    },
    build: vi.fn()
  };
});

// Mock fs.writeFileSync pour ne pas écrire sur le disque
vi.mock('fs', () => ({
  default: {
    writeFileSync: vi.fn()
  }
}));

describe('createExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait envoyer les bonnes données à node-xlsx.build', async () => {
    // Mock des transferts retournés par le repository
    const fakeTransfers = [
      { id: 1, fromaccountid: 10, toaccountid: 20, amount: 100 },
      { id: 2, fromaccountid: 10, toaccountid: 30, amount: 200 }
    ];
    
    vi.spyOn(transferRepository, 'getTransfersFromRepository').mockResolvedValue(fakeTransfers);
    
    // Configuration du mock pour xlsx.build
    const mockBuild = vi.mocked(xlsx.default.build);
    mockBuild.mockReturnValue(Buffer.from('xlsx'));

    // Appel
    await exportService.createExport(123, 'test.xlsx');

    // Vérification des données envoyées à build
    expect(mockBuild).toHaveBeenCalledWith([
      {
        name: 'Transferts',
        data: [
          ["ID", "FromAccountId", "ToAccountId", "Amount"],
          [1, 10, 20, 100],
          [2, 10, 30, 200]
        ]
      }
    ]);
  });
});