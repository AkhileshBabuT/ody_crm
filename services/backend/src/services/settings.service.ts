import type { Database } from "../db";
import { AppError } from "../lib/errors";
import * as settingsRepo from "../repositories/settings.repository";

// ─── Get All Settings ───

export async function getAllSettings(db: Database) {
  return settingsRepo.getAllSettings(db);
}

// ─── Get Setting By Key ───

export async function getSettingByKey(db: Database, key: string) {
  const setting = await settingsRepo.getSettingByKey(db, key);
  if (!setting) {
    throw new AppError("NOT_FOUND", "Setting not found");
  }
  return setting;
}

// ─── Upsert Setting ───

export async function upsertSetting(db: Database, key: string, value: string) {
  return settingsRepo.upsertSetting(db, key, value);
}
