import {
  CONTACT_MESSAGES,
  ContactHandler,
} from "@src/controllers/contact/contactHandler";
import type ContactService from "@src/services/contact/contactService";

interface MockedContactService {
  sendMessage: jest.Mock;
}

const createMockService = (): MockedContactService => ({
  sendMessage: jest.fn(),
});

const buildReq = (body: Record<string, unknown>) =>
  ({
    body,
    ip: "127.0.0.1",
  }) as unknown as Parameters<ContactHandler["send"]>[0];

const buildRes = () => {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn();
  return {
    res: { status, json } as unknown as Parameters<ContactHandler["send"]>[1],
    status,
    json,
  };
};

describe("ContactHandler", () => {
  it("silently drops requests when the honeypot is filled", async () => {
    const service = createMockService();
    const handler = new ContactHandler(service as unknown as ContactService);
    const req = buildReq({
      name: "Bot",
      email: "bot@example.com",
      subject: "Spam",
      message: "Hello, this is spam content very long enough.",
      website: "http://malicious.example",
    });
    const { res, status, json } = buildRes();
    const next = jest.fn();

    await handler.send(req, res, next);

    expect(service.sendMessage).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      message: CONTACT_MESSAGES.SILENT_DROP,
      delivered: false,
    });
  });

  it("delegates valid submissions to the service", async () => {
    const service = createMockService();
    service.sendMessage.mockResolvedValue({ delivered: true });
    const handler = new ContactHandler(service as unknown as ContactService);
    const req = buildReq({
      name: "Alice",
      email: "alice@example.com",
      subject: "Booking",
      message: "Hello, I would like to book one of your artists.",
      locale: "nl",
      website: "",
    });
    const { res, status, json } = buildRes();
    const next = jest.fn();

    await handler.send(req, res, next);

    expect(service.sendMessage).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@example.com",
      subject: "Booking",
      message: "Hello, I would like to book one of your artists.",
      locale: "nl",
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      message: CONTACT_MESSAGES.SENT,
      delivered: true,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
