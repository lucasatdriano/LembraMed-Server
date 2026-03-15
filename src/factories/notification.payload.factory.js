export class NotificationPayloadFactory {
    static create({ title, message, tag, data }) {
        return JSON.stringify({
            title,
            body: message,
            tag,
            ...data,
        });
    }
}
