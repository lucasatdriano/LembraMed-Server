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
 *           description: ID do medicamento.
 *         name:
 *           type: string
 *           description: Nome do medicamento.
 *         hourfirstdose:
 *           type: string
 *           format: time
 *           description: Hora da primeira dose do medicamento.
 *         hournextdose:
 *           type: string
 *           format: time
 *           description: Hora da próxima dose do medicamento.
 *         periodstart:
 *           type: string
 *           format: date
 *           description: Data de início do período de uso do medicamento.
 *         periodend:
 *           type: string
 *           format: date
 *           description: Data de término do período de uso do medicamento.
 *         status:
 *           type: boolean
 *           description: Status para saber se o remédio foi tomado
 *         createdat:
 *           type: string
 *           format: date-time
 *           description: Data de criação do medicamento.
 *         userid:
 *           type: string
 *           description: ID do usuário ao qual o medicamento pertence.
 *         doseintervalid:
 *           type: number
 *           description: ID do intervalo de dose associado ao medicamento.
 *         intervalinhours:
 *           type: number
 *           description: Intervalo de horas entre as doses.
 *       example:
 *         id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *         name: "Paracetamol"
 *         hourfirstdose: "08:00"
 *         hournextdose: "16:00"
 *         periodstart: "2025-10-01"
 *         periodend: "2025-10-10"
 *         status: false
 *         createdat: "2025-10-01T10:00:00.000Z"
 *         userid: "f45bb13c-55cc-4219-a457-0e12b2c3d477"
 *         doseintervalid: 1
 *         intervalinhours: 8
 *
 *     CreateMedicationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         hourfirstdose:
 *           type: string
 *           format: time
 *         periodstart:
 *           type: string
 *           format: date
 *         periodend:
 *           type: string
 *           format: date
 *         intervalinhours:
 *           type: number
 *       required:
 *         - name
 *         - hourfirstdose
 *         - periodstart
 *         - periodend
 *         - intervalinhours
 *
 *     UpdateMedicationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         hournextdose:
 *           type: string
 *           format: time
 *         periodstart:
 *           type: string
 *           format: date
 *         periodend:
 *           type: string
 *           format: date
 *         intervalinhours:
 *           type: number
 *         status:
 *           type: boolean
 *
 *     MedicationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         medication:
 *           $ref: '#/components/schemas/Medication'
 *
 *     MedicationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         medications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medication'
 */

/**
 * @swagger
 * /medications/{userid}/search:
 *   get:
 *     summary: Busca medicamentos de um usuário por nome ou intervalo
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Nome do medicamento ou intervalo de horas para filtrar
 *     responses:
 *       200:
 *         description: Medicamentos encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationsResponse'
 *       403:
 *         description: Acesso não autorizado a esta conta
 *       404:
 *         description: Nenhum medicamento encontrado
 *       500:
 *         description: Erro ao buscar medicamentos
 */

/**
 * @swagger
 * /medications/{userid}/{medicationid}:
 *   get:
 *     summary: Obtém um medicamento específico pelo ID
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Medicamento encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationResponse'
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao buscar medicamento
 */

/**
 * @swagger
 * /medications/{userid}/{medicationid}/history:
 *   get:
 *     summary: Obtém o histórico de doses de um medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       medicationid:
 *                         type: string
 *                       action:
 *                         type: string
 *                       details:
 *                         type: string
 *                       takendate:
 *                         type: string
 *                         format: date-time
 *                       taken:
 *                         type: boolean
 *                       createdat:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao buscar histórico
 */

/**
 * @swagger
 * /medications/{userid}/create:
 *   post:
 *     summary: Cria um novo medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicationRequest'
 *     responses:
 *       201:
 *         description: Medicamento criado com sucesso
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
 *                   example: "Medicamento criado com sucesso"
 *                 medication:
 *                   $ref: '#/components/schemas/Medication'
 *       403:
 *         description: Acesso não autorizado
 *       500:
 *         description: Erro ao criar medicamento
 */

/**
 * @swagger
 * /medications/{userid}/{medicationid}/taken:
 *   post:
 *     summary: Marca um medicamento como tomado
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Medicamento marcado como tomado com sucesso
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
 *                   example: "Medicamento marcado como tomado"
 *                 medication:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     status:
 *                       type: boolean
 *                     hournextdose:
 *                       type: string
 *                     nextDose:
 *                       type: string
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao marcar como tomado
 */

/**
 * @swagger
 * /medications/{userid}/{medicationid}/missed:
 *   post:
 *     summary: Registra uma dose não tomada
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Dose não tomada registrada com sucesso
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
 *                   example: "Dose não tomada registrada no histórico"
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao registrar dose não tomada
 */

/**
 * @swagger
 * /medications/{userid}/{medicationid}/advance:
 *   post:
 *     summary: Força o avanço da dose do medicamento
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
 *         description: ID do medicamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - userid
 *     responses:
 *       200:
 *         description: Dose avançada com sucesso
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
 *                   example: "Dose avançada com sucesso"
 *                 medication:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     status:
 *                       type: boolean
 *                     hournextdose:
 *                       type: string
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao forçar avanço de dose
 */

/**
 * @swagger
 * /medications/{userid}/{medicationid}:
 *   put:
 *     summary: Atualiza um medicamento existente
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMedicationRequest'
 *     responses:
 *       200:
 *         description: Medicamento atualizado com sucesso
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
 *                   example: "Medicamento atualizado com sucesso"
 *                 medication:
 *                   $ref: '#/components/schemas/Medication'
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao atualizar medicamento
 */

/**
 * @swagger
 * /medications/{userid}/{medicationid}:
 *   delete:
 *     summary: Deleta um medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Medicamento deletado com sucesso
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
 *                   example: "Medicamento Paracetamol deletado com sucesso."
 *       403:
 *         description: Acesso não autorizado
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao deletar medicamento
 */
