"use server";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import createAdminRaw from "./actions.create"
import editAdminRaw from "./actions.edit";
import getAdminsRaw from "./actions.list"
import deleteAdminRaw from "./actions.delete"
import switchStatusRaw from "./actions.switch"



export const getAdmins = combineMiddlewares(withTenantAuth)(getAdminsRaw);

export const createAdmin = combineMiddlewares(withTenantAuth)(createAdminRaw);

export const editAdmin = combineMiddlewares(withTenantAuth)(editAdminRaw)

export const switchStatus = combineMiddlewares(withTenantAuth)(switchStatusRaw)

export const deleteAdmin = combineMiddlewares(withTenantAuth)(deleteAdminRaw)