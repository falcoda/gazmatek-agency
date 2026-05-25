import {
  AppError,
  ConflictError,
  DatabaseError,
  ExpiredTokenError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@src/helpers/error/errors";

describe("AppError hierarchy", () => {
  it("stores statusCode, message and details", () => {
    const err = new AppError(422, "unprocessable", { field: "x" });

    expect(err.statusCode).toBe(422);
    expect(err.message).toBe("unprocessable");
    expect(err.details).toEqual({ field: "x" });
    expect(err).toBeInstanceOf(Error);
  });

  it.each([
    ["ValidationError", ValidationError, 400, "Validation error"],
    ["NotFoundError", NotFoundError, 404, "Resource not found"],
    ["UnauthorizedError", UnauthorizedError, 401, "Unauthorized"],
    ["ForbiddenError", ForbiddenError, 403, "Forbidden"],
    ["ConflictError", ConflictError, 409, "Conflict"],
    ["DatabaseError", DatabaseError, 500, "Database error"],
    ["InternalError", InternalError, 500, "Internal server error"],
  ] as const)(
    "%s has the correct default statusCode and message",
    (_name, Cls, status, msg) => {
      const err = new Cls();

      expect(err.statusCode).toBe(status);
      expect(err.message).toBe(msg);
      expect(err).toBeInstanceOf(AppError);
    },
  );

  it("ExpiredTokenError sets resetToken: true in details", () => {
    const err = new ExpiredTokenError();

    expect(err.statusCode).toBe(401);
    expect(err.details).toEqual({ resetToken: true });
  });

  it("error classes accept custom message and details", () => {
    const detail = [{ path: "name", message: "required" }];
    const err = new ValidationError("custom msg", detail);

    expect(err.message).toBe("custom msg");
    expect(err.details).toEqual(detail);
  });

  it("error name matches the class constructor name", () => {
    expect(new ValidationError().name).toBe("ValidationError");
    expect(new NotFoundError().name).toBe("NotFoundError");
    expect(new UnauthorizedError().name).toBe("UnauthorizedError");
  });
});
