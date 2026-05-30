import pool from "@src/db/dbConnect";
import { getAgencySettings } from "@src/db/query/agencySettings/getAgencySettings.types";
import { updateAgencyInfo } from "@src/db/query/agencySettings/updateAgencyInfo.types";

export interface AgencyInfo {
  name: string | null;
  representative: string | null;
  address: string | null;
  city: string | null;
  companyNumber: string | null;
  vatNumber: string | null;
  email: string | null;
  iban: string | null;
}

const trimOrNull = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const getAgencyInfo = async (): Promise<AgencyInfo> => {
  const [row] = await getAgencySettings.run(undefined, pool);
  return {
    name: row?.name ?? null,
    representative: row?.representative ?? null,
    address: row?.address ?? null,
    city: row?.city ?? null,
    companyNumber: row?.company_number ?? null,
    vatNumber: row?.vat_number ?? null,
    email: row?.email ?? null,
    iban: row?.iban ?? null,
  };
};

export const saveAgencyInfo = async (
  input: AgencyInfo,
): Promise<AgencyInfo> => {
  const [row] = await updateAgencyInfo.run(
    {
      name: trimOrNull(input.name),
      representative: trimOrNull(input.representative),
      address: trimOrNull(input.address),
      city: trimOrNull(input.city),
      companyNumber: trimOrNull(input.companyNumber),
      vatNumber: trimOrNull(input.vatNumber),
      email: trimOrNull(input.email),
      iban: trimOrNull(input.iban),
    },
    pool,
  );
  return {
    name: row?.name ?? null,
    representative: row?.representative ?? null,
    address: row?.address ?? null,
    city: row?.city ?? null,
    companyNumber: row?.company_number ?? null,
    vatNumber: row?.vat_number ?? null,
    email: row?.email ?? null,
    iban: row?.iban ?? null,
  };
};
