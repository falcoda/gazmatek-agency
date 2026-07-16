import {
  EmailLocale,
  EmailTemplate,
} from "@src/services/mailer/emailConstants";
import { BRAND_NAME } from "@src/services/mailer/templates/layout";

/** Wording of one email, in one locale. Facts and links come from the payload. */
export interface TemplateCopy {
  subject: string;
  title: string;
  paragraphs: string[];
  /** Button label. Templates without a link leave it out. */
  cta?: string;
  /** Paragraphs shown after the button. */
  outro?: string[];
}

export type LocalizedCopy = Record<EmailLocale, TemplateCopy>;

export const HELLO: Record<EmailLocale, string> = {
  fr: "Bonjour",
  nl: "Hallo",
  en: "Hello",
};

/** Fact labels shared across templates — translate once, reuse everywhere. */
export const LABELS = {
  artist: { fr: "Artiste", nl: "Artiest", en: "Artist" },
  stageName: { fr: "Nom de scène", nl: "Artiestennaam", en: "Stage name" },
  eventDate: {
    fr: "Date de l'événement",
    nl: "Datum van het evenement",
    en: "Event date",
  },
  total: { fr: "Montant total", nl: "Totaalbedrag", en: "Total amount" },
  deposit: { fr: "Acompte", nl: "Voorschot", en: "Deposit" },
  expiresAt: { fr: "Valable jusqu'au", nl: "Geldig tot", en: "Valid until" },
  reason: { fr: "Motif", nl: "Reden", en: "Reason" },
  bookingRef: {
    fr: "Référence réservation",
    nl: "Reserveringsreferentie",
    en: "Booking reference",
  },
  contractRef: {
    fr: "Référence contrat",
    nl: "Contractreferentie",
    en: "Contract reference",
  },
  name: { fr: "Nom", nl: "Naam", en: "Name" },
  email: { fr: "Email", nl: "E-mail", en: "Email" },
  message: { fr: "Message", nl: "Bericht", en: "Message" },
} as const satisfies Record<string, Record<EmailLocale, string>>;

const OPEN_ACCOUNT: Record<EmailLocale, string> = {
  fr: "Ouvrir mon espace client",
  nl: "Mijn klantruimte openen",
  en: "Open my client area",
};

export const COPY: Record<EmailTemplate, LocalizedCopy> = {
  [EmailTemplate.BOOKING_CONFIRMATION]: {
    fr: {
      subject: `${BRAND_NAME} — Confirmez votre demande`,
      title: "Nous avons bien reçu votre demande",
      paragraphs: [
        "Votre demande de réservation nous est bien parvenue. Notre équipe l'examine et revient vers vous rapidement.",
      ],
      outro: [
        "Les montants ci-dessus sont une estimation basée sur les informations que vous avez transmises. Ils seront confirmés lors de la validation de la demande.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Bevestig uw aanvraag`,
      title: "We hebben uw aanvraag goed ontvangen",
      paragraphs: [
        "Uw reserveringsaanvraag is goed aangekomen. Ons team bekijkt ze en komt snel bij u terug.",
      ],
      outro: [
        "De bovenstaande bedragen zijn een raming op basis van de door u doorgegeven gegevens. Ze worden bevestigd zodra de aanvraag is goedgekeurd.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Confirm your request`,
      title: "We have received your request",
      paragraphs: [
        "Your booking request has reached us. Our team is reviewing it and will get back to you shortly.",
      ],
      outro: [
        "The amounts above are an estimate based on the details you provided. They will be confirmed when the request is approved.",
      ],
    },
  },

  [EmailTemplate.BOOKING_APPROVED]: {
    fr: {
      subject: `${BRAND_NAME} — Votre demande est validée`,
      title: "Votre demande est validée",
      paragraphs: [
        "Bonne nouvelle : votre demande de réservation a été validée par notre équipe.",
      ],
      outro: ["Le contrat à signer vous parviendra dans un prochain email."],
    },
    nl: {
      subject: `${BRAND_NAME} — Uw aanvraag is goedgekeurd`,
      title: "Uw aanvraag is goedgekeurd",
      paragraphs: [
        "Goed nieuws: uw reserveringsaanvraag is door ons team goedgekeurd.",
      ],
      outro: [
        "Het te ondertekenen contract ontvangt u in een volgende e-mail.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Your request is approved`,
      title: "Your request is approved",
      paragraphs: [
        "Good news: your booking request has been approved by our team.",
      ],
      outro: ["The contract to sign will follow in a separate email."],
    },
  },

  [EmailTemplate.BOOKING_REJECTED]: {
    fr: {
      subject: `${BRAND_NAME} — Votre demande n'a pas pu être traitée`,
      title: "Votre demande n'a pas pu être traitée",
      paragraphs: [
        "Nous ne sommes malheureusement pas en mesure de donner suite à votre demande de réservation.",
      ],
      outro: [
        "N'hésitez pas à nous recontacter pour une autre date ou un autre artiste.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Uw aanvraag kon niet worden verwerkt`,
      title: "Uw aanvraag kon niet worden verwerkt",
      paragraphs: ["We kunnen helaas niet ingaan op uw reserveringsaanvraag."],
      outro: [
        "Neem gerust opnieuw contact op voor een andere datum of een andere artiest.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Your request could not be processed`,
      title: "Your request could not be processed",
      paragraphs: [
        "Unfortunately we are not able to move forward with your booking request.",
      ],
      outro: [
        "Feel free to reach out again for another date or another artist.",
      ],
    },
  },

  [EmailTemplate.BOOKING_CONFIRMED]: {
    fr: {
      subject: `${BRAND_NAME} — Réservation confirmée`,
      title: "Votre réservation est confirmée",
      paragraphs: ["Tout est en ordre : votre réservation est confirmée."],
      cta: OPEN_ACCOUNT.fr,
      outro: [
        "Le détail de la réservation reste disponible dans votre espace client.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Reservering bevestigd`,
      title: "Uw reservering is bevestigd",
      paragraphs: ["Alles is in orde: uw reservering is bevestigd."],
      cta: OPEN_ACCOUNT.nl,
      outro: [
        "De details van de reservering blijven beschikbaar in uw klantruimte.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Booking confirmed`,
      title: "Your booking is confirmed",
      paragraphs: ["Everything is set: your booking is confirmed."],
      cta: OPEN_ACCOUNT.en,
      outro: ["The booking details remain available in your client area."],
    },
  },

  [EmailTemplate.BOOKING_CANCELLED]: {
    fr: {
      subject: `${BRAND_NAME} — Réservation annulée`,
      title: "Votre réservation a été annulée",
      paragraphs: ["Votre réservation a été annulée."],
      outro: [
        "Si cette annulation vous semble être une erreur, contactez-nous et nous vérifierons.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Reservering geannuleerd`,
      title: "Uw reservering is geannuleerd",
      paragraphs: ["Uw reservering is geannuleerd."],
      outro: [
        "Lijkt deze annulering een vergissing? Neem contact met ons op en we kijken het na.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Booking cancelled`,
      title: "Your booking has been cancelled",
      paragraphs: ["Your booking has been cancelled."],
      outro: [
        "If this cancellation looks like a mistake, contact us and we will check.",
      ],
    },
  },

  [EmailTemplate.CONTRACT_READY]: {
    fr: {
      subject: `${BRAND_NAME} — Un contrat est à signer`,
      title: "Votre contrat est prêt à être signé",
      paragraphs: [
        "Le contrat de votre réservation est disponible dans votre espace client. Merci de le relire et de le signer pour finaliser la réservation.",
      ],
      cta: OPEN_ACCOUNT.fr,
    },
    nl: {
      subject: `${BRAND_NAME} — Een contract is klaar om te ondertekenen`,
      title: "Uw contract is klaar om te ondertekenen",
      paragraphs: [
        "Het contract voor uw reservering staat klaar in uw klantruimte. Lees het na en onderteken het om de reservering af te ronden.",
      ],
      cta: OPEN_ACCOUNT.nl,
    },
    en: {
      subject: `${BRAND_NAME} — A contract is ready to sign`,
      title: "Your contract is ready to sign",
      paragraphs: [
        "The contract for your booking is available in your client area. Please review and sign it to finalise the booking.",
      ],
      cta: OPEN_ACCOUNT.en,
    },
  },

  [EmailTemplate.CONTRACT_SIGNED]: {
    fr: {
      subject: `${BRAND_NAME} — Contrat signé`,
      title: "Le contrat a bien été signé",
      paragraphs: [
        "Le contrat a bien été signé. Une copie reste disponible dans votre espace client.",
      ],
      cta: OPEN_ACCOUNT.fr,
    },
    nl: {
      subject: `${BRAND_NAME} — Contract ondertekend`,
      title: "Het contract is ondertekend",
      paragraphs: [
        "Het contract is ondertekend. Een kopie blijft beschikbaar in uw klantruimte.",
      ],
      cta: OPEN_ACCOUNT.nl,
    },
    en: {
      subject: `${BRAND_NAME} — Contract signed`,
      title: "The contract has been signed",
      paragraphs: [
        "The contract has been signed. A copy remains available in your client area.",
      ],
      cta: OPEN_ACCOUNT.en,
    },
  },

  [EmailTemplate.CONTRACT_REMINDER]: {
    fr: {
      subject: `${BRAND_NAME} — Rappel signature contrat`,
      title: "Votre contrat attend toujours votre signature",
      paragraphs: [
        "Votre contrat n'a pas encore été signé. Merci de le finaliser pour confirmer définitivement la réservation.",
      ],
      cta: OPEN_ACCOUNT.fr,
    },
    nl: {
      subject: `${BRAND_NAME} — Herinnering contract ondertekenen`,
      title: "Uw contract wacht nog op uw handtekening",
      paragraphs: [
        "Uw contract is nog niet ondertekend. Rond het af om de reservering definitief te bevestigen.",
      ],
      cta: OPEN_ACCOUNT.nl,
    },
    en: {
      subject: `${BRAND_NAME} — Contract signature reminder`,
      title: "Your contract is still waiting for your signature",
      paragraphs: [
        "Your contract has not been signed yet. Please complete it to confirm the booking for good.",
      ],
      cta: OPEN_ACCOUNT.en,
    },
  },

  [EmailTemplate.PASSWORD_RESET]: {
    fr: {
      subject: `${BRAND_NAME} — Réinitialisation du mot de passe`,
      title: "Réinitialisation de votre mot de passe",
      paragraphs: [
        "Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le bouton ci-dessous pour en choisir un nouveau.",
      ],
      cta: "Choisir un nouveau mot de passe",
      outro: [
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe reste inchangé.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Wachtwoord opnieuw instellen`,
      title: "Uw wachtwoord opnieuw instellen",
      paragraphs: [
        "U hebt gevraagd om uw wachtwoord opnieuw in te stellen. Kies een nieuw wachtwoord via de knop hieronder.",
      ],
      cta: "Een nieuw wachtwoord kiezen",
      outro: [
        "Hebt u dit niet aangevraagd? Negeer deze e-mail: uw wachtwoord blijft ongewijzigd.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Password reset`,
      title: "Reset your password",
      paragraphs: [
        "You asked to reset your password. Use the button below to choose a new one.",
      ],
      cta: "Choose a new password",
      outro: [
        "If you did not make this request, ignore this email: your password stays unchanged.",
      ],
    },
  },

  [EmailTemplate.CONTACT_MESSAGE]: {
    fr: {
      subject: `${BRAND_NAME} — Nouveau message de contact`,
      title: "Nouveau message de contact",
      paragraphs: [
        "Un nouveau message vient d'être envoyé via le formulaire de contact.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Nieuw contactbericht`,
      title: "Nieuw contactbericht",
      paragraphs: [
        "Er is een nieuw bericht verzonden via het contactformulier.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — New contact message`,
      title: "New contact message",
      paragraphs: [
        "A new message has just been sent through the contact form.",
      ],
    },
  },

  [EmailTemplate.CONTACT_ACK]: {
    fr: {
      subject: `${BRAND_NAME} — Confirmation de votre message`,
      title: "Nous avons bien reçu votre message",
      paragraphs: [
        "Merci de nous avoir contactés. Nous revenons vers vous dès que possible.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Bevestiging van uw bericht`,
      title: "We hebben uw bericht goed ontvangen",
      paragraphs: [
        "Bedankt voor uw bericht. We komen zo snel mogelijk bij u terug.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Confirmation of your message`,
      title: "We have received your message",
      paragraphs: [
        "Thank you for reaching out. We will get back to you as soon as possible.",
      ],
    },
  },

  [EmailTemplate.CLIENT_INVITATION]: {
    fr: {
      subject: `${BRAND_NAME} — Activez votre espace client`,
      title: "Activez votre espace client",
      paragraphs: [
        `Un espace client ${BRAND_NAME} a été créé pour vous. Activez-le pour suivre vos réservations et vos contrats au même endroit.`,
      ],
      cta: "Activer mon espace client",
      outro: [
        "Si vous n'attendiez pas cette invitation, vous pouvez simplement ignorer cet email.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Activeer je klantruimte`,
      title: "Activeer uw klantruimte",
      paragraphs: [
        `Er is een ${BRAND_NAME}-klantruimte voor u aangemaakt. Activeer ze om uw reserveringen en contracten op één plek op te volgen.`,
      ],
      cta: "Mijn klantruimte activeren",
      outro: [
        "Verwachtte u deze uitnodiging niet? Dan mag u deze e-mail gewoon negeren.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Activate your client account`,
      title: "Activate your client area",
      paragraphs: [
        `A ${BRAND_NAME} client area has been created for you. Activate it to follow your bookings and contracts in one place.`,
      ],
      cta: "Activate my client area",
      outro: [
        "If you were not expecting this invitation, you can simply ignore this email.",
      ],
    },
  },

  [EmailTemplate.ARTIST_INVITATION]: {
    fr: {
      subject: `${BRAND_NAME} — Rejoignez notre roster d'artistes`,
      title: `Rejoignez le roster ${BRAND_NAME}`,
      paragraphs: [
        `Vous êtes invité·e à rejoindre le roster d'artistes ${BRAND_NAME}. Créez votre compte pour compléter votre profil et recevoir des demandes de booking.`,
      ],
      cta: "Rejoindre le roster",
      outro: [
        "Si cette invitation ne vous est pas destinée, vous pouvez ignorer cet email.",
      ],
    },
    nl: {
      subject: `${BRAND_NAME} — Sluit je aan bij ons artiestenroster`,
      title: `Sluit je aan bij het ${BRAND_NAME}-roster`,
      paragraphs: [
        `Je bent uitgenodigd om je aan te sluiten bij het artiestenroster van ${BRAND_NAME}. Maak je account aan om je profiel te vervolledigen en bookingaanvragen te ontvangen.`,
      ],
      cta: "Bij het roster aansluiten",
      outro: [
        "Is deze uitnodiging niet voor jou bedoeld? Dan mag je deze e-mail negeren.",
      ],
    },
    en: {
      subject: `${BRAND_NAME} — Join our artist roster`,
      title: `Join the ${BRAND_NAME} roster`,
      paragraphs: [
        `You are invited to join the ${BRAND_NAME} artist roster. Create your account to complete your profile and start receiving booking requests.`,
      ],
      cta: "Join the roster",
      outro: [
        "If this invitation was not meant for you, you can ignore this email.",
      ],
    },
  },
};
