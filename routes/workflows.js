let Workflow = require('../model/Workflow')
let { error, log } = require('../util')

module.exports = (app) => {
	app.post('/workflows', (req, res) => {
		// This probably works differently than Google Cloud in that you can
		// create multiple workflows with the same name. This allows us to keep
		// the API and deploy script as simple as possible for now.
		log('POST /workflows', req.body)
		let workflow = req.body

		if (typeof workflow.name !== 'string') {
			error('workflow name missing')
		}

		if (typeof workflow.steps !== 'object') {
			// yes, you can trick this with null
			error('workflow steps missing')
		}

		let id = Workflow.create({
			name: workflow.name,
			steps: workflow.steps
		})

		res.send({ id })
	})

	app.get('/workflows/:id', (req, res) => {
		let id = Number(req.params.id)
		log(`GET /workflows/${id}`)

		let workflow = Workflow.findById(id)
		res.send(workflow || error('workflow not found'))
	})

	app.get('/workflows', (req, res) => {
		log('GET /workflows')

		let workflows = Workflow.getAll()
		res.send(workflows)
	})

	app.patch('/workflows/:id', (req, res) => {
		let id = Number(req.params.id)
		log(`PATCH /workflows/${id}`)

		let workflow = Workflow.modify(id, req.body)

		res.send(workflow)
	})

}
