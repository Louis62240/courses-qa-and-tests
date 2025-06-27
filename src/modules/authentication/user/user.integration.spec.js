import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Client } from 'pg';

// On importe la fonction service
import { createUser } from './user.service.js';

// Et on importe la fonction repository qu'on va espionner
import * as userRepository from './user.repository.js';

const testUser = {
    name: 'integration_test_user',
    birthday: new Date('2000-01-01'),
};

let client;

describe('User Repository Integration Test', () => {
    beforeAll(async () => {
        client = new Client({
            host: 'localhost',
            port: 5432,
            user: 'user',
            password: 'password',
            database: 'mydb',
        });
        await client.connect();
    });

    afterAll(async () => {
        await client.query('DELETE FROM users WHERE name = $1', [testUser.name]);
        await client.end();
    });

    beforeEach(() => {
        // Spy sur createUserInRepository avant chaque test
        vi.spyOn(userRepository, 'createUserInRepository');
    });

    it('should insert and return the new user via service layer and verify repository call and DB insertion', async () => {
        const user = await createUser(testUser);

        // Vérifications basiques
        expect(user).toBeDefined();
        expect(user.name).toBe(testUser.name);
        const formattedBirthday = user.birthday.toLocaleDateString('en-CA');
        expect(formattedBirthday).toBe('2000-01-01');

        // Vérifier que createUserInRepository a été appelé une fois avec les bonnes données
        expect(userRepository.createUserInRepository).toHaveBeenCalledOnce();
        expect(userRepository.createUserInRepository).toHaveBeenCalledWith(expect.objectContaining({
            name: testUser.name,
            birthday: testUser.birthday,
        }));

        // Vérifier que l'utilisateur est bien dans la base
        const res = await client.query('SELECT name, birthday FROM users WHERE name = $1', [testUser.name]);
        expect(res.rows.length).toBe(1);
        expect(res.rows[0].name).toBe(testUser.name);

        // Attention au formatage de la date renvoyée par PostgreSQL : c'est une string ou un Date selon config
        const dbBirthday = new Date(res.rows[0].birthday);
        const dbBirthdayFormatted = dbBirthday.toLocaleDateString('en-CA');
        expect(dbBirthdayFormatted).toBe('2000-01-01');
    });
});
