export type TemplateNotificationType =
  | "invitation"
  | "invitation_reminder"
  | "invitation_expiry"
  | "course_assigned"
  | "assigned_not_started"
  | "due_soon"
  | "course_overdue"
  | "inactive_in_progress"
  | "quiz_retry"
  | "course_completed"
  | "pathway_continuation"
  | "manager_overdue_summary"
  | "admin_engagement_summary";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderEmailTemplate(
  type: TemplateNotificationType,
  data: Record<string, any>
): RenderedEmail {
  const companyName = escapeHtml(data.companyName || "Elevio Corporate");
  const recipientName = escapeHtml(data.recipientName || "Team Member");
  const courseTitle = escapeHtml(data.courseTitle || "Sustainability Course");
  const courseCode = escapeHtml(data.courseCode || "");
  const dueDate = data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const actionUrl = escapeHtml(data.actionUrl || data.invitationLink || data.link || process.env.PUBLIC_APP_URL || process.env.RENDER_EXTERNAL_URL || "https://elearn-hub.onrender.com");

  let subject = "Elevio Notification";
  let bodyContentHtml = "";
  let bodyContentText = "";
  let ctaText = "Go to Workspace";

  switch (type) {
    case "invitation":
    case "invitation_reminder": {
      subject = `Invitation: Activate Your ${companyName} Sustainability Learning Account`;
      ctaText = "Accept Invitation & Join";
      const accessCode = escapeHtml(data.accessCode || "");
      const expiryFormatted = data.expiresAt
        ? new Date(data.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "7 days from receipt";

      bodyContentHtml = `
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>Your organisation, <strong>${companyName}</strong>, has invited you to join its corporate sustainability learning workspace on <strong>ELEVIO Skills</strong>.</p>
        <p>ELEVIO delivers practical, accredited workplace modules designed to help your team understand ESG priorities, build sustainable workplace habits, and achieve real impact.</p>
        
        ${accessCode ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Single-Use Access Code</p>
          <p style="margin: 0; font-family: monospace; font-size: 22px; font-weight: 700; color: #047857; letter-spacing: 2px;">${accessCode}</p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #15803d;">Valid until: <strong>${expiryFormatted}</strong></p>
        </div>
        ` : ""}

        <div style="background: #f8fafc; border-left: 4px solid #0f766e; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #475569;">
          <p style="margin: 0 0 4px 0;"><strong>Important Security Notes:</strong></p>
          <ul style="margin: 0; padding-left: 18px;">
            <li>Please ensure you authenticate using the exact email address where you received this message.</li>
            <li>This invitation and access code are individual, single-use, and must not be shared.</li>
          </ul>
        </div>
        <p style="font-size: 13px; color: #64748b;">If you need assistance activating your account, please reach out to your company administrator or contact <a href="mailto:support@elevio.mu" style="color: #0f766e;">support@elevio.mu</a>.</p>
      `;

      bodyContentText = `Hello ${recipientName},\n\nYour organisation, ${companyName}, has invited you to join its corporate sustainability learning space on ELEVIO Skills.\n\n${accessCode ? `Access Code: ${accessCode}\nValid until: ${expiryFormatted}\n\n` : ""}Direct activation link: ${actionUrl}\n\nImportant: Please sign in with the exact email address where you received this message. This invitation is personal and must not be shared.\n\nNeed help? Contact support@elevio.mu`;
      break;
    }

    case "invitation_expiry":
      subject = `Action Required: Invitation to ${companyName} Workspace Expiring`;
      ctaText = "Activate Access";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>Your invitation to join <strong>${companyName}</strong> on Elevio will expire shortly.</p>
        <p>Please activate your account to access assigned training courses.</p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nYour invitation to join ${companyName} on Elevio will expire shortly.\n\nActivate access: ${actionUrl}`;
      break;

    case "course_assigned":
    case "assigned_not_started":
      subject = `Assigned Training: ${courseTitle} (${courseCode})`;
      ctaText = "Start Course";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>A new training course has been assigned to you by <strong>${companyName}</strong>:</p>
        <div style="background: #f4f6f8; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1e293b;">${courseTitle}</h3>
          ${dueDate ? `<p style="margin: 0; color: #475569;">Due Date: <strong>${dueDate}</strong></p>` : ""}
        </div>
      `;
      bodyContentText = `Hello ${recipientName},\n\nA new training course has been assigned to you by ${companyName}: ${courseTitle}.\n${dueDate ? `Due Date: ${dueDate}\n` : ""}Start course: ${actionUrl}`;
      break;

    case "due_soon":
      subject = `Reminder: ${courseTitle} Due Soon (${dueDate})`;
      ctaText = "Continue Course";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>This is a reminder that your assigned course <strong>${courseTitle}</strong> is due on <strong>${dueDate}</strong>.</p>
        <p>You can pick up right where you left off at any time.</p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nReminder: Your assigned course ${courseTitle} is due on ${dueDate}.\n\nContinue course: ${actionUrl}`;
      break;

    case "course_overdue":
      subject = `Compliance Notice: ${courseTitle} Past Due Date`;
      ctaText = "Resume Training";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>Your assigned course <strong>${courseTitle}</strong> was due on <strong>${dueDate}</strong> and is currently incomplete.</p>
        <p>Please sign in to complete your remaining lessons at your earliest convenience.</p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nYour assigned course ${courseTitle} was due on ${dueDate}.\n\nResume training: ${actionUrl}`;
      break;

    case "inactive_in_progress":
      subject = `Pick Up Where You Left Off: ${courseTitle}`;
      ctaText = "Resume Module";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>You have saved progress in <strong>${courseTitle}</strong>.</p>
        <p>Your lesson progress is safely preserved. Click below to continue learning.</p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nYou have saved progress in ${courseTitle}.\n\nResume module: ${actionUrl}`;
      break;

    case "quiz_retry":
      subject = `Assessment Review: ${courseTitle}`;
      ctaText = "Review & Retry Quiz";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>You can review your lesson content and retry the end-of-course quiz for <strong>${courseTitle}</strong>.</p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nYou can review your lesson content and retry the end-of-course quiz for ${courseTitle}.\n\nReview & retry: ${actionUrl}`;
      break;

    case "course_completed":
      subject = `Congratulations! You Completed ${courseTitle}`;
      ctaText = "View Certificate";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>Great job! You have successfully completed <strong>${courseTitle}</strong>.</p>
        <p>Your official accredited certificate of completion is now available in your profile.</p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nCongratulations! You have successfully completed ${courseTitle}.\n\nView certificate: ${actionUrl}`;
      break;

    case "pathway_continuation":
      subject = `Pathway Progress: Continue Your Learning Journey`;
      ctaText = "Continue Pathway";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>You are making progress on your learning pathway for <strong>${companyName}</strong>.</p>
        <p>Click below to start your next recommended course in the series.</p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nYou are making progress on your learning pathway for ${companyName}.\n\nContinue pathway: ${actionUrl}`;
      break;

    case "manager_overdue_summary":
      subject = `Manager Digest: Department Sustainability Training Health`;
      ctaText = "Open Manager Dashboard";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>Here is your department training summary for <strong>${companyName}</strong>.</p>
        <p>Overdue Assignments: <strong>${data.overdueCount ?? 0}</strong> | In Progress: <strong>${data.inProgressCount ?? 0}</strong></p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nDepartment summary for ${companyName}:\nOverdue: ${data.overdueCount ?? 0}\nIn Progress: ${data.inProgressCount ?? 0}\n\nDashboard: ${actionUrl}`;
      break;

    case "admin_engagement_summary":
      subject = `Administrator Overview: Company Learning Metrics`;
      ctaText = "Open Workspace Dashboard";
      bodyContentHtml = `
        <p>Hello ${recipientName},</p>
        <p>Here is the corporate engagement overview for <strong>${companyName}</strong>.</p>
        <p>Activation Rate: <strong>${data.activationRatePct ?? 0}%</strong> | Total Completions: <strong>${data.completedCount ?? 0}</strong></p>
      `;
      bodyContentText = `Hello ${recipientName},\n\nEngagement overview for ${companyName}:\nActivation Rate: ${data.activationRatePct ?? 0}%\nTotal Completions: ${data.completedCount ?? 0}\n\nDashboard: ${actionUrl}`;
      break;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: #0f766e; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">Elevio</h1>
              <p style="color: #e6fffa; margin: 4px 0 0 0; font-size: 13px;">Learn. Apply. Improve.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #334155;">
              ${bodyContentHtml}
              <div style="margin-top: 24px; text-align: center;">
                <a href="${actionUrl}" style="background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">${ctaText}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0;">Sent by Elevio on behalf of ${companyName}</p>
              <p style="margin: 4px 0 0 0;">Elevio is operated by Recyclean Ltd.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return {
    subject,
    html,
    text: bodyContentText,
  };
}
