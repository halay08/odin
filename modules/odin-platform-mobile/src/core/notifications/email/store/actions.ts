import { SEND_CONFIRMATION_EMAIL_REQUEST } from "./constants";

export function sendConfirmationEmail(path: string) {
  return {
    type: SEND_CONFIRMATION_EMAIL_REQUEST,
    path,
  }
}

export function sendEmail() {
  return null;
}

