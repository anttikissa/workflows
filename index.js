let express = require('express')
let app = express()
let port = 3000
let log = console.log

function error(message) {
	throw new Error(message)
}

app.use(express.json())

app.get('/', (req, res) => {
	res.send('hello')
})

let workflows = []
let workflowsNextId = 1

let Workflow = {
	create: ({ name, steps }) => {
		let id = workflowsNextId++
		workflows.push({
			id,
			name,
			steps
		})
		return id
	},

	findById: (id) => {
		return workflows.find(w => w.id === id)
	},

	findByName: (name) => {
		// Find the most recent workflow with the given name
		return [...workflows].reverse().find(w => w.name === name)
	}
}

//
// Workflows
//

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

app.get('/workflows', (req, res) => {
	log('GET /workflows')

	res.send(workflows)
})

app.get('/workflows/:id', (req, res) => {
	let id = Number(req.params.id)
	log(`GET /workflows/${id}`)

	let workflow = Workflow.findById(id)
	res.send(workflow || error('workflow not found'))
})

app.patch('/workflows/:id', (req, res) => {
	let id = Number(req.params.id)
	log(`PATCH /workflows/${id}`)

	let workflow = Workflow.findById(id)
	if (!workflow) {
		error('workflow not found')
	}

	// TODO maybe should validate
	Object.assign(workflow, req.body)

	res.send(workflow)
})

app.listen(port, () => {
	log(`Listening at http://localhost:${port}`)
})
