import { HttpBadRequest, HttpForbidden } from "@httpx/exception";
import { z } from "zod";
import { createUserInRepository } from "./user.repository";
import { calculateAge } from "../../../shared/utils";

export const MAX_USER_AGE = 18;

const UserSchema = z.object({
  name: z.string().min(2),
  birthday: z.date(),
});

export async function createUser(data) {
  const result = UserSchema.safeParse(data); // ✅ Validation des données

  if (result.success) {
    const age = calculateAge(result.data.birthday); // ✅ Calcul de l'âge

    if (age < MAX_USER_AGE) {
      throw new HttpForbidden("User is too young."); // ❌ Interdit si trop jeune
    }

    return createUserInRepository(result.data); // ✅ OK → insertion simulée
  } else {
    throw new HttpBadRequest(result.error); // ❌ Mauvaise requête si validation échoue
  }
}
