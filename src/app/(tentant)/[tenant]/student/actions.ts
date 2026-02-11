"use server";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import createStudentRaw from "./actions.create"
import editRaw from "./actions.edit";
import getStudentRaw from "./actions.list"
// import deleteTeacherRaw from "./actions.delete"
import switchStatusRaw from "./actions.switch"



export const getStudent = combineMiddlewares(withTenantAuth)(getStudentRaw);

export const createStudent = combineMiddlewares(withTenantAuth)(createStudentRaw);

export const editStudent = combineMiddlewares(withTenantAuth)(editRaw)

export const switchStatus = combineMiddlewares(withTenantAuth)(switchStatusRaw)

// export const deleteTeacher = combineMiddlewares(withTenantAuth)(deleteTeacherRaw)