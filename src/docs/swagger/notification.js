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
 *         message:
 *           type: string
 *           example: "Notificação enviada para 2 dispositivos"
 *         details:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 3
 *             successful:
 *               type: number
 *               example: 2
 *             failed:
 *               type: number
 *               example: 1
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
 * /notifications/send:
 *   post:
 *     summary: Envia notificação push para o usuário autenticado
 *     description: Envia notificação para todos os dispositivos registrados do usuário autenticado
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
 *         description: Notificação enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendNotificationResponse'
 *       400:
 *         description: Title é obrigatório
 *       404:
 *         description: Nenhuma subscription encontrada para este usuário
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtém notificações do usuário autenticado
 *     description: Retorna a lista de notificações do usuário autenticado
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Número máximo de notificações a retornar
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Número de notificações a pular (para paginação)
 *     responses:
 *       200:
 *         description: Notificações retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationsResponse'
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /notifications/{notificationid}/read:
 *   patch:
 *     summary: Marca uma notificação como lida
 *     description: Atualiza a data de leitura de uma notificação específica do usuário autenticado
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação marcada como lida com sucesso
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
 *       500:
 *         description: Erro interno do servidor
 */
