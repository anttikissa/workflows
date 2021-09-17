let express = require('express')

let Execution = require('./model/Execution')
let Workflow = require('./model/Workflow')

let { error } = require('./util')

let app = express()
let port = 3000
let log = console.log

app.use(express.json())

app.get('/', (req, res) => {
	res.send('hello')
})

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

// Simulate the endpoint used by gcloud example (which doesn't work right
// out of the box for reasons unknown, probably authentication)
app.get('/datetime', (req, res) => {
	let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
		'Thursday', 'Friday', 'Saturday']

	res.send({
		dayOfTheWeek: days[new Date().getDay()]
	})
})

app.listen(port, () => {
	log(`Listening at http://localhost:${port}`)
})
