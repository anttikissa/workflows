let workflows = []
let workflowsNextId = 1
let { error } = require('../util')

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
	},

	modify: (id, changes) => {
		let workflow = Workflow.findById(id)
		if (!workflow) {
			error('workflow not found')
		}

		// TODO maybe should validate
		Object.assign(workflow, changes)

		return workflow
	},

	getAll: () => {
		return workflows
	}
}

module.exports = Workflow
