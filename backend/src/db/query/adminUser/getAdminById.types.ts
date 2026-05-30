/** Types generated for queries found in "src/db/query/adminUser/getAdminById.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetAdminById' parameters type */
export interface IGetAdminByIdParams {
  adminId: string;
}

/** 'GetAdminById' return type */
export interface IGetAdminByIdResult {
  email: string;
  full_name: string;
  id: string;
  is_active: boolean;
}

/** 'GetAdminById' query type */
export interface IGetAdminByIdQuery {
  params: IGetAdminByIdParams;
  result: IGetAdminByIdResult;
}

const getAdminByIdIR: any = {"usedParamSet":{"adminId":true},"params":[{"name":"adminId","required":true,"transform":{"type":"scalar"},"locs":[{"a":67,"b":75}]}],"statement":"SELECT id, email, full_name, is_active\nFROM admin_users\nWHERE id = :adminId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, email, full_name, is_active
 * FROM admin_users
 * WHERE id = :adminId!
 * LIMIT 1
 * ```
 */
export const getAdminById = new PreparedQuery<IGetAdminByIdParams,IGetAdminByIdResult>(getAdminByIdIR);


