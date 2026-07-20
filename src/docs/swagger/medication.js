/**
 * @swagger
 * tags:
 *   name: Medications
 *   description: Gerenciamento de medicamentos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Medication:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         hourfirstdose:
 *           type: string
 *         hournextdose:
 *           type: string
 *         periodstart:
 *           type: string
 *           format: date
 *         periodend:
 *           type: string
 *           format: date
 *         status:
 *           type: boolean
 *         pendingconfirmation:
 *           type: boolean
 *         pendinguntil:
 *           type: number
 *           nullable: true
 *         lasttakentime:
 *           type: string
 *           nullable: true
 *         createdat:
 *           type: string
 *           format: date-time
 *         doseinterval:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *             intervalinhours:
 *               type: number
 *
 *     MedicationHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do registro
 *         medicationid:
 *           type: string
 *           format: uuid
 *           description: ID do medicamento
 *         taken:
 *           type: boolean
 *           description: Indica se a dose foi tomada (true) ou perdida (false)
 *         takendate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data/hora real em que o usuário tomou a medicação
 *         scheduleddate:
 *           type: string
 *           format: date-time
 *           description: Data/hora programada para a dose ser tomada
 *         createdat:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro
 *
 *
 *     MedicationHistoryListResponse:
 *       type: object
 *       properties:
 *         history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MedicationHistory'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalRecords:
 *               type: integer
 *
 *     CreateMedicationRequest:
 *       type: object
 *       required:
 *         - name
 *         - hourfirstdose
 *         - periodstart
 *         - periodend
 *         - intervalinhours
 *       properties:
 *         name:
 *           type: string
 *         hourfirstdose:
 *           type: string
 *         periodstart:
 *           type: string
 *           format: date
 *         periodend:
 *           type: string
 *           format: date
 *         intervalinhours:
 *           type: number
 *
 *     UpdateMedicationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         hournextdose:
 *           type: string
 *         periodstart:
 *           type: string
 *           format: date
 *         periodend:
 *           type: string
 *           format: date
 *         intervalinhours:
 *           type: number
 *
 *     MedicationListResponse:
 *       type: object
 *       properties:
 *         medications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medication'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalRecords:
 *               type: integer
 */

/**
 * @swagger
 * /medications/search:
 *   get:
 *     summary: Busca medicamentos
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de medicamentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationListResponse'
 *       404:
 *         description: Nenhum medicamento encontrado
 */

/**
 * @swagger
 * /medications/{medicationid}:
 *   get:
 *     summary: Busca medicamento por ID
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Medicamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       404:
 *         description: Medicamento não encontrado
 */

/**
 * @swagger
 * /medications/{medicationid}/history:
 *   get:
 *     summary: Histórico do medicamento
 *     description: |
 *       Retorna o histórico de doses do medicamento.
 *       - **takendate**: Horário REAL que o usuário tomou (preenchido automaticamente)
 *       - **scheduleddate**: Horário PROGRAMADO para a dose
 *       - **delayMinutes**: Atraso em minutos (calculado)
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtrar (filtra por scheduleddate)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtrar (filtra por scheduleddate)
 *       - in: query
 *         name: doseStatus
 *         schema:
 *           type: string
 *           enum: [taken, missed, all]
 *         description: Filtra por status da dose (taken=tomou, missed=perdeu)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Histórico retornado com dados de horário programado e real
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationHistoryListResponse'
 *       404:
 *         description: Medicamento não encontrado
 */

/**
 * @swagger
 * /medications:
 *   post:
 *     summary: Cria medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicationRequest'
 *     responses:
 *       201:
 *         description: Medicamento criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 */

/**
 * @swagger
 * /medications/{medicationid}/pending:
 *   post:
 *     summary: Inicia confirmação de dose
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dose pendente criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pendingUntil:
 *                   type: number
 *                 pendingUntilFormatted:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       400:
 *         description: Fora da janela de confirmação
 *       404:
 *         description: Medicamento não encontrado
 */

/**
 * @swagger
 * /medications/{medicationid}/cancel:
 *   post:
 *     summary: Cancela confirmação de dose
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cancelado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Confirmação cancelada"
 */

/**
 * @swagger
 * /medications/{medicationid}:
 *   put:
 *     summary: Atualiza medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMedicationRequest'
 *     responses:
 *       200:
 *         description: Medicamento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       404:
 *         description: Medicamento não encontrado
 */

/**
 * @swagger
 * /medications/{medicationid}:
 *   delete:
 *     summary: Remove medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Medicamento removido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
