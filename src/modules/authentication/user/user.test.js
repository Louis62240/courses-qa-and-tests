import { describe, it, expect, vi, afterEach, assert } from "vitest";
import { HttpBadRequest, HttpForbidden } from "@httpx/exception";

// 🔧 Mock partiel du repository
vi.mock("./user.repository", async (importOriginal) => ({
  ...(await importOriginal()),
  createUserInRepository: vi.fn((data) => ({
    id: 4,
    name: data.name,
    birthday: data.birthday,
  })),
}));

import { createUser } from "./user.service.js";
import { createUserInRepository } from "./user.repository.js";

// 🧼 Nettoyage des mocks
afterEach(() => {
  vi.restoreAllMocks();
});

describe("User Service", () => {
  it("should create a user", async () => {
    const birthday = new Date(1997, 8, 13); // 13 septembre 1997
    const input = {
      name: "Valentin R",
      birthday,
    };

    const user = await createUser(input);

    // ✅ Vérifications de l'objet retourné
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.id).toBeTypeOf("number");

    expect(user).toHaveProperty("name", "Valentin R");
    expect(user.birthday).toBeDefined();
    expect(user.birthday).toBeInstanceOf(Date);
    expect(user.birthday.getFullYear()).toBe(1997);
    expect(user.birthday.getMonth()).toBe(8); // Mois = septembre

    // ✅ Vérification du mock
    expect(createUserInRepository).toBeCalledTimes(1);
    expect(createUserInRepository).toBeCalledWith({
      name: "Valentin R",
      birthday,
    });
  });

  it("should throw HttpForbidden for users under 18", async () => {
    const underage = {
      name: "Too Young",
      birthday: new Date(new Date().getFullYear() - 10, 0, 1), // 10 ans
    };

    await expect(() => createUser(underage)).rejects.toThrow(HttpForbidden);
  });

  it("should throw HttpBadRequest if data is invalid", async () => {
    const invalid = {
      name: "", // trop court
      birthday: "not-a-date", // invalide
    };

    await expect(() => createUser(invalid)).rejects.toThrow(HttpBadRequest);
  });

  it("should trigger a bad request error when user creation", async () => {
    try {
      await createUser({
        name: "Valentin R", // 🟥 birthday manquant
      });

      assert.fail("createUser should trigger an error.");
    } catch (e) {
      expect(e.name).toBe("HttpBadRequest");
      expect(e.statusCode).toBe(400);
    }
  });
});

import { MAX_USER_AGE } from "./user.service.js";

describe("Exercice 1 - User trop jeune", () => {
  it("should throw HttpForbidden if user is under the minimum age", async () => {
    const today = new Date();
    const tooYoung = {
      name: "Petit Jean",
      birthday: new Date(
        today.getFullYear() - (MAX_USER_AGE - 1), // 1 an trop jeune
        today.getMonth(),
        today.getDate()
      ),
    };

    await expect(() => createUser(tooYoung)).rejects.toThrow(HttpForbidden);
  });
});
