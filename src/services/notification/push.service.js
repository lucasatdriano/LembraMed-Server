import webpush from 'web-push';

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

export class PushService {
    static async send(subscription, payload) {
        try {
            await webpush.sendNotification(subscription, payload);
            return { success: true };
        } catch (error) {
            if (error.statusCode === 404 || error.statusCode === 410) {
                return { success: false, expired: true };
            }

            return { success: false };
        }
    }
}
