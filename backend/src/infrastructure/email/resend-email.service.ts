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
 * @param userName - User's name (optional, defaults to "Champion")
 * @param daysSinceLastActivity - Number of days since last activity
 * @param hasWorkoutHistory - Whether user has previous workout history
 * @returns Resend API response
 * @throws Error if email sending fails
 */
export const sendInactivityEmail = async (
  userEmail: string,
  userName: string = "Champion",
  daysSinceLastActivity: number = 0,
  hasWorkoutHistory: boolean = false
) => {
  const resend = createResendClient();

  const subject = hasWorkoutHistory
    ? `${userName}, on te manque ! Reviens t'entraîner 💪`
    : `${userName}, c'est le moment de commencer ! 🚀`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reviens t'entraîner !</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { padding: 30px 20px; }
            .stats { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Hey ${userName} ! 👋</h1>
            <p>On remarque que tu n'es pas venu depuis un petit moment...</p>
        </div>

        <div class="content">
            <div class="stats">
                <h3>📊 Tes stats :</h3>
                <p><strong>Dernière activité :</strong> Il y a ${daysSinceLastActivity} jour${daysSinceLastActivity > 1 ? 's' : ''}</p>
                <p><strong>Historique :</strong> ${hasWorkoutHistory ? '✅ Tu as déjà fait des séances' : '🆕 Prêt à commencer ton parcours'}</p>
            </div>

            ${hasWorkoutHistory ?
              `<p>Tu étais sur une super lancée ! 🔥 Tes muscles t'attendent pour continuer sur cette voie.</p>
               <p>Reprends là où tu t'étais arrêté et continue à progresser !</p>` :
              `<p>C'est le moment parfait pour débuter ton parcours fitness ! 🌟</p>
               <p>Commence par une séance simple et découvre tout ce qu'on a préparé pour toi.</p>`
            }

            <div style="text-align: center;">
                <a href="https://barbar.coach/workout" class="cta-button">
                    ${hasWorkoutHistory ? 'Reprendre l\'entraînement' : 'Commencer maintenant'} 💪
                </a>
            </div>

            <p style="margin-top: 30px;">
                <small>Tu ne veux plus recevoir ces rappels ? <a href="https://barbar.coach/unsubscribe">Se désabonner</a></small>
            </p>
        </div>

        <div class="footer">
            <p>L'équipe Barbar Coach 🏋️‍♂️</p>
            <p>Garde le rythme, on croit en toi !</p>
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