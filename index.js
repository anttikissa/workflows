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

app.post('/workflows', (req, res) => {
	log('POST /workflows', req.body)
	let workflow = req.body

	if (typeof workflow.name !== 'string') {
		error('workflow name missing')
	}

	if (typeof workflow.steps !== 'object') {
		// yes, you can trick this with null
		error('workflow steps missing')
	}

	let id = workflowsNextId++
	workflows.push({
		id,
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

	let workflow = workflows.find(w => w.id === id)
	res.send(workflow || error('workflow not found'))
})

app.patch('/workflows/:id', (req, res) => {
	let id = Number(req.params.id)
	log(`PATCH /workflows/${id}`)

	let workflow = workflows.find(w => w.id === id)
	if (!workflow) {
		error('workflow not found')
	}

	let data = req.body
	Object.assign(workflow, data)

	res.send('ok')
})

app.listen(port, () => {
	log(`Listening at http://localhost:${port}`)
})
