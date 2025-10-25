/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Gerenciamento de dispositivos e contas multi-conta
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceAccount:
 *       type: object
 *       properties:
 *         userid:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         lastused:
 *           type: string
 *           format: date-time
 *         createdat:
 *           type: string
 *           format: date-time
 *
 *     PushSubscriptionRequest:
 *       type: object
 *       properties:
 *         userid:
 *           type: string
 *           format: uuid
 *         deviceid:
 *           type: string
 *           format: uuid
 *         subscription:
 *           type: object
 *           properties:
 *             endpoint:
 *               type: string
 *             keys:
 *               type: object
 *               properties:
 *                 p256dh:
 *                   type: string
 *                 auth:
 *                   type: string
 *       required:
 *         - userid
 *         - deviceid
 *         - subscription
 *
 *     PushSubscriptionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Subscription registrada com sucesso"
 *         subscriptionId:
 *           type: string
 *           format: uuid
 *
 *     DeviceAccountsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         accounts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DeviceAccount'
 */

/**
 * @swagger
 * /devices/{deviceId}/accounts:
 *   get:
 *     summary: Obtém todas as contas associadas a um dispositivo
 *     description: Retorna a lista de todas as contas de usuário logadas no dispositivo específico
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do dispositivo
 *     responses:
 *       200:
 *         description: Lista de contas do dispositivo retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceAccountsResponse'
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /devices/push-subscription:
 *   post:
 *     summary: Registra uma subscription para notificações push
 *     description: Associa uma subscription de notificação push a um usuário e dispositivo específicos
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PushSubscriptionRequest'
 *     responses:
 *       200:
 *         description: Subscription registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PushSubscriptionResponse'
 *       400:
 *         description: UserID, deviceId e subscription são obrigatórios
 *       404:
 *         description: Conta não encontrada neste dispositivo
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /devices/{deviceId}:
 *   delete:
 *     summary: Remove um dispositivo e todas as suas associações
 *     description: Remove completamente um dispositivo, revogando todos os tokens e removendo todas as contas associadas
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do dispositivo a ser removido
 *     responses:
 *       200:
 *         description: Dispositivo removido com sucesso
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
 *                   example: "Dispositivo removido"
 *       500:
 *         description: Erro interno do servidor
 */
