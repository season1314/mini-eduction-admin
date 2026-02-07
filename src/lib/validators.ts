/**
 * @file src/lib/validator.ts
 * @description A lightweight, chainable validation utility for handling form inputs and data integrity.
 * @module Validator
 */


export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A utility class for fluid, chainable data validation.
 * @example
 * const result = new Validator("test@test.com",'Email').required().email().isValid();
 */

class Validator {
    private value: any;
    private errors: string[] = [];
    private field: string

    constructor(value: any, field: any) { this.value = value, this.field = field }

    required(message = `${this.field} is required`) {
        if (!this.value || String(this.value).trim() === "") { this.errors.push(message); }
        return this;
    }

    email(message = "Invalid email format") {
        if (this.value && !emailRegex.test(this.value)) { this.errors.push(message) }
        return this;
    }

    length(min: number = 0, max: number = 0) {
        if (min && this.value.length < min) { this.errors.push(`${this.field} can last than ${min} characters`); return this }
        if (max && this.value.length > max) { this.errors.push(`${this.field} can more than ${max} characters`); return this }
        return this
    }

    isValid() { return this.errors.length === 0; }

    getErrors() { return this.errors }

}

export const valid = (value: any, field?: string) => new Validator(value, field);