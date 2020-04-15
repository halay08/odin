import { SEND_CONFIRMATION_EMAIL_REQUEST } from './constants';

export interface SendgridEmailEntity {
  to: any,
  cc?: any,
  bcc?: any,
  from?: any,
  subject?: string,
  body?: any,
  attachments?: any,
  links?: { [key: string]: string },
  signature?: string,
  // Sendgrid template id
  templateId?: string,
  // odin template label
  templateLabel: string,
  // Sendgrid dynamic template data
  dynamicTemplateData: { [key: string]: any },
}

export function sendConfirmationEmail(path: string, body?: SendgridEmailEntity) {
  return {
    type: SEND_CONFIRMATION_EMAIL_REQUEST,
    path,
    body,
  }
}

export function sendEmail() {
  return null;
}

