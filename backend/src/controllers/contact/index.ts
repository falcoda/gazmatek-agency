import ContactService from "@src/services/contact/contactService";

import ContactHandler from "./contactHandler";

class ContactController {
  send: ContactHandler["send"];

  constructor() {
    const service = new ContactService();
    const handler = new ContactHandler(service);
    this.send = handler.send;
  }
}

export default ContactController;
