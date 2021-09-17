let express = require('express')

let Execution = require('./model/Execution')
let Workflow = require('./model/Workflow')
let { error, log } = require('./util')

let app = express()
let port = 3000

app.use(express.json())

app.get('/', (req, res) => {
	res.send('hello')
})

require('./routes/workflows')(app)

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
