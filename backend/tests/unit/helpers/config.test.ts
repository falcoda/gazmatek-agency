/**
 * Configuration Validation Tests
 *
 * These tests verify that environment variable validation works correctly,
 * especially ensuring required variables cause startup failures.
 */

describe("Configuration Validation", () => {
  const originalEnv = process.env;
  const originalExit = process.exit;

  beforeEach(() => {
    // Mock process.exit to prevent actual exit during tests
    process.exit = jest.fn((code?: number) => {
      throw new Error(`process.exit called with code ${code}`);
    }) as any;

    // Set up required env vars for all tests
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      DATABASE_HOST: "localhost",
      DATABASE: "testdb",
      DATABASE_USERNAME: "testuser",
      DATABASE_PASSWORD: "testpass",
      JWT_KEY: "test-jwt-key-32-bytes-minimum-required",
      AUTH_STRATEGIES: "jwt",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    jest.resetModules();
  });

  describe("Required Database Variables", () => {
    it("should load config when all required DB vars are present", () => {
      // This test passes if no error is thrown
      expect(() => {
        // Config loading happens synchronously
        require("@src/helpers/config/config");
      }).not.toThrow();
    });

    it("should fail when DATABASE_HOST is missing", () => {
      delete process.env.DATABASE_HOST;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).toThrow();
    });

    it("should fail when DATABASE is missing", () => {
      delete process.env.DATABASE;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).toThrow();
    });

    it("should fail when DATABASE_USERNAME is missing", () => {
      delete process.env.DATABASE_USERNAME;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).toThrow();
    });

    it("should fail when DATABASE_PASSWORD is missing", () => {
      delete process.env.DATABASE_PASSWORD;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).toThrow();
    });
  });

  describe("JWT Configuration", () => {
    it("should require JWT_KEY when AUTH_STRATEGIES includes jwt", () => {
      process.env.AUTH_STRATEGIES = "jwt";
      delete process.env.JWT_KEY;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).toThrow();
    });

    it("should load config when jwt strategy is NOT enabled", () => {
      process.env.AUTH_STRATEGIES = "api-key";
      delete process.env.JWT_KEY;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).not.toThrow();
    });

    it("should load config when multiple strategies are enabled and JWT_KEY is present", () => {
      process.env.AUTH_STRATEGIES = "jwt,api-key";
      process.env.JWT_KEY = "valid-jwt-key-32-bytes-minimum";
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).not.toThrow();
    });
  });

  describe("Optional Features", () => {
    it("should load with Telegram notifications disabled (default)", () => {
      process.env.FEATURE_NOTIFICATIONS = "false";
      delete process.env.TELEGRAM_BOT_TOKEN;
      delete process.env.TELEGRAM_CHAT_ID;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).not.toThrow();
    });

    it("should require Telegram credentials when driver is telegram", () => {
      process.env.NOTIFICATION_DRIVER = "telegram";
      delete process.env.TELEGRAM_BOT_TOKEN;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).toThrow();
    });

    it("should load with SMTP mailer disabled (default)", () => {
      process.env.FEATURE_MAILER = "false";
      delete process.env.MAILER_SMTP_HOST;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).not.toThrow();
    });

    it("should require SMTP credentials when mailer driver is smtp", () => {
      process.env.FEATURE_MAILER = "true";
      process.env.MAILER_DRIVER = "smtp";
      delete process.env.MAILER_SMTP_HOST;
      jest.resetModules();

      expect(() => {
        require("@src/helpers/config/config");
      }).toThrow();
    });
  });

  describe("Port Configuration", () => {
    it("should use default port 4001 when PORT is not set", () => {
      delete process.env.PORT;
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.server.port).toBe(4001);
    });

    it("should use custom port when PORT is set", () => {
      process.env.PORT = "8080";
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.server.port).toBe(8080);
    });
  });

  describe("Rate Limiting Configuration", () => {
    it("should use default rate limit values when not set", () => {
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX_API;
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.rateLimit.windowMs).toBe(60000);
      expect(config.rateLimit.maxApi).toBe(300);
    });

    it("should use custom rate limit values when set", () => {
      process.env.RATE_LIMIT_WINDOW_MS = "120000";
      process.env.RATE_LIMIT_MAX_API = "500";
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.rateLimit.windowMs).toBe(120000);
      expect(config.rateLimit.maxApi).toBe(500);
    });
  });

  describe("Boolean Env Var Parsing", () => {
    it("should parse 'true' as boolean true", () => {
      process.env.FEATURE_SWAGGER = "true";
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.featureFlags.swagger).toBe(true);
    });

    it("should parse '1' as boolean true", () => {
      process.env.FEATURE_SWAGGER = "1";
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.featureFlags.swagger).toBe(true);
    });

    it("should parse 'false' as boolean false", () => {
      process.env.FEATURE_METRICS = "false";
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.featureFlags.metrics).toBe(false);
    });

    it("should parse '0' as boolean false", () => {
      process.env.FEATURE_METRICS = "0";
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.featureFlags.metrics).toBe(false);
    });
  });

  describe("List Env Var Parsing", () => {
    it("should parse comma-separated auth strategies", () => {
      process.env.AUTH_STRATEGIES = "jwt,api-key";
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.auth.strategies).toContain("jwt");
      expect(config.auth.strategies).toContain("api-key");
    });

    it("should parse single auth strategy", () => {
      process.env.AUTH_STRATEGIES = "jwt";
      jest.resetModules();

      const config = require("@src/helpers/config/config").config;
      expect(config.auth.strategies).toEqual(["jwt"]);
    });
  });
});
