import { Reflector } from "@nestjs/core";

export const AllowUnauthenticated = Reflector.createDecorator<boolean>();
