/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gerenciamento de notificações push
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PushSubscription:
 *       type: object
 *       properties:
 *         endpoint:
 *           type: string
 *           example: "https://fcm.googleapis.com/fcm/send/abc123"
 *         deviceId:
 *           type: string
 *           example: "device-xyz"
 *         keys:
 *           type: object
 *           properties:
 *             p256dh:
 *               type: string
 *               example: "BNcRdre..."
 *             auth:
 *               type: string
 *               example: "abc123"
 *       required:
 *         - endpoint
 *         - keys
 *
 *     SendNotificationRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Hora do Medicamento"
 *         message:
 *           type: string
 *           example: "Está na hora de tomar seu remédio"
 *         tag:
 *           type: string
 *           example: "medication-reminder"
 *       required:
 *         - title
 *
 *     SendNotificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         notificationId:
 *           type: string
 *           format: uuid
 *         message:
 *           type: string
 *           example: "Notificação enviada para 2 dispositivos"
 *
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userid:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         message:
 *           type: string
 *           nullable: true
 *         sentat:
 *           type: string
 *           format: date-time
 *         readat:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     NotificationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 */

/**
 * @swagger
 * /notifications/vapid-public-key:
 *   get:
 *     summary: Retorna a chave pública VAPID
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Chave retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicKey:
 *                   type: string
 *       500:
 *         description: VAPID não configurado
 */

/**
 * @swagger
 * /notifications/subscribe:
 *   post:
 *     summary: Registra uma subscription de push
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PushSubscription'
 *     responses:
 *       200:
 *         description: Subscription registrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Subscription realizado com sucesso"
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /notifications/unsubscribe:
 *   post:
 *     summary: Remove uma subscription
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *                 example: "https://fcm.googleapis.com/fcm/send/abc123"
 *             required:
 *               - endpoint
 *     responses:
 *       200:
 *         description: Subscription removida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Subscription removido com sucesso"
 *       400:
 *         description: Endpoint não informado
 */

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Envia notificação push
 *     description: Envia para todos dispositivos do usuário autenticado
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendNotificationRequest'
 *     responses:
 *       200:
 *         description: Notificação enviada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendNotificationResponse'
 *       400:
 *         description: Título obrigatório
 *       500:
 *         description: Erro interno
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Lista notificações do usuário
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationsResponse'
 */

/**
 * @swagger
 * /notifications/{notificationid}/read:
 *   patch:
 *     summary: Marca notificação como lida
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Marcado como lido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notificação marcada como lida"
 *       404:
 *         description: Notificação não encontrada
 */
