import clsx, { type ClassValue } from "clsx";

/** Joins class names, dropping falsy values. */
export function cn(...values: ClassValue[]) {
	return clsx(values);
}
