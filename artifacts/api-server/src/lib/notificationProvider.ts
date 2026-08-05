import { logger } from "./logger";

export interface ProviderEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
  fromEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderDeliveryResult {
  success: boolean;
  providerName: string;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  timestamp: string;
}

export interface NotificationProvider {
  sendEmail(input: ProviderEmailInput): Promise<ProviderDeliveryResult>;
}

export class DevLogProvider implements NotificationProvider {
  async sendEmail(input: ProviderEmailInput): Promise<ProviderDeliveryResult> {
    const messageId = `dev_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info(
      {
        to: input.to,
        subject: input.subject,
        messageId,
      },
      `[DevLogProvider] Dispatch simulated successfully to ${input.to}`
    );

    return {
      success: true,
      providerName: "DevLogProvider",
      providerMessageId: messageId,
      timestamp: new Date().toISOString(),
    };
  }
}

export class ResendProvider implements NotificationProvider {
  constructor(private apiKey: string) {}

  async sendEmail(input: ProviderEmailInput): Promise<ProviderDeliveryResult> {
    try {
      const from = input.fromEmail ? `${input.fromName || "Elevio"} <${input.fromEmail}>` : "Elevio <no-reply@elevio.mu>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as Record<string, any>;
        return {
          success: false,
          providerName: "ResendProvider",
          errorCode: `HTTP_${res.status}`,
          errorMessage: errData.message || res.statusText || "Resend API dispatch failed",
          timestamp: new Date().toISOString(),
        };
      }

      const data = (await res.json()) as Record<string, any>;
      return {
        success: true,
        providerName: "ResendProvider",
        providerMessageId: data.id || `resend_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        providerName: "ResendProvider",
        errorCode: "NETWORK_ERROR",
        errorMessage: err.message || "Failed to communicate with Resend API",
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export function getActiveNotificationProvider(): NotificationProvider {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    return new ResendProvider(resendApiKey);
  }
  return new DevLogProvider();
}
