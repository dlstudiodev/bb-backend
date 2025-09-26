import { Resend } from 'resend';

/**
 * Creates a configured Resend client instance.
 * Uses API key from environment variables.
 *
 * @returns Configured Resend client
 * @throws Error if environment variables are missing
 */
const createResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Missing required RESEND_API_KEY environment variable');
  }

  return new Resend(apiKey);
};

/**
 * Sends an inactivity reminder email to a user.
 *
 * @param userEmail - Recipient email address
 * @param userName - User's name (optional)
 * @param daysSinceLastActivity - Number of days since last activity
 * @param hasWorkoutHistory - Whether user has previous workout history
 * @returns Resend API response
 * @throws Error if email sending fails
 */
export const sendInactivityEmail = async (
  userEmail: string,
  userName: string = "",
  daysSinceLastActivity: number = 0,
  hasWorkoutHistory: boolean = false
) => {
  const resend = createResendClient();

  const subject = "Time to get back in the game";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Time to get back in the game</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #ffffff; padding: 40px 30px; text-align: center; }
            .logo { max-width: 120px; height: auto; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 24px; font-weight: 600; color: #2c2c2c; margin-bottom: 20px; }
            .message { font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 30px; }
            .stats { background-color: #f8f8f8; padding: 20px; border-left: 4px solid #2c2c2c; margin: 30px 0; }
            .stats-label { font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; }
            .stats-value { font-size: 18px; font-weight: 600; color: #2c2c2c; margin-top: 5px; }
            .cta-container { text-align: center; margin: 40px 0; }
            .cta-button {
                display: inline-block;
                background-color: #2c2c2c;
                color: #ffffff;
                padding: 16px 32px;
                text-decoration: none;
                font-weight: 600;
                letter-spacing: 0.5px;
                transition: background-color 0.3s ease;
            }
            .cta-button:hover { background-color: #1a1a1a; }
            .footer { background-color: #f8f8f8; padding: 30px; text-align: center; }
            .footer-text { font-size: 14px; color: #888888; margin-bottom: 10px; }
            .unsubscribe { font-size: 12px; color: #aaaaaa; }
            .unsubscribe a { color: #888888; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://vmyrjwtqubjxgvenhxmt.supabase.co/storage/v1/object/public/marketing/logomail.png" alt="Barbar Coach" class="logo">
            </div>

            <div class="content">
                <div class="greeting">Hey${userName ? ` ${userName}` : ''}</div>

                <div class="message">
                    We noticed you haven't trained in a while. Your next workout is waiting for you.
                </div>

                <div class="stats">
                    <div class="stats-label">Last Activity</div>
                    <div class="stats-value">${daysSinceLastActivity} day${daysSinceLastActivity > 1 ? 's' : ''} ago</div>
                </div>

                <div class="message">
                    The best time to start is now. Consistency is everything.
                </div>

                <div class="cta-container">
                    <a href="https://barbar.coach/workout" class="cta-button">START TRAINING</a>
                </div>
            </div>

            <div class="footer">
                <div class="footer-text">Barbar Coach</div>
                <div class="unsubscribe">
                    <a href="https://barbar.coach/unsubscribe">Unsubscribe</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'no-reply@barbar.coach',
      to: userEmail,
      subject,
      html
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    throw new Error(`Failed to send inactivity email to ${userEmail}: ${error}`);
  }
};

/**
 * Email service for external notifications.
 */
export const emailService = {
  sendInactivityEmail,
};