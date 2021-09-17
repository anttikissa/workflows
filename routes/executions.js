let Execution = require('../model/Execution')
let Workflow = require('../model/Workflow')
let { error, log } = require('../util')

module.exports = (app) => {
	app.post('/executions', async (req, res, next) => {
		try {
			log('POST /executions', req.body)

			let name = req.body.name

			if (!name) {
				error('name is required')
			}

			let workflow = Workflow.findByName(name)
			if (!workflow) {
				error('workflow not found')
			}

			let result = await Execution.create(workflow)

			res.send(result)
			// res.send('ok')
		} catch (e) {
			return next(e)
		}
	})

	app.get('/executions/:id', (req, res) => {
		let id = Number(req.params.id)
		log(`GET /executions/${id}`)

		let execution = Execution.findById(id)
		res.send(execution || error('workflow not found'))
	})

	app.get('/executions', (req, res) => {
		log('GET /executions')

		let execution = Execution.getAll()
		res.send(execution)
	})
}
