"use server";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import createTeacherRaw from "./actions.create"
import editTeacherRaw from "./actions.edit";
import getTeachersRaw from "./actions.list"
import deleteTeacherRaw from "./actions.delete"
import switchStatusRaw from "./actions.switch"



export const getTeachers = combineMiddlewares(withTenantAuth)(getTeachersRaw);

export const createTeacher = combineMiddlewares(withTenantAuth)(createTeacherRaw);

export const editTeacher = combineMiddlewares(withTenantAuth)(editTeacherRaw)

export const switchStatus = combineMiddlewares(withTenantAuth)(switchStatusRaw)

export const deleteTeacher = combineMiddlewares(withTenantAuth)(deleteTeacherRaw)