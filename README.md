# API

## Workflows:

Create new workflow:
POST /workflows {
    name: 'my-workflow',
    steps: [
        ...
    ]
}

Returns {
    id: 123
}

Access a workflow:
GET /workflows/:id

Returns {
    id: 123,
    name: 'my-workflow',
	steps: [ ... ]
}

List workflows:
GET /workflows

Returns [
    {
        id: 123,
        name: 'my-workflow',
        steps: [ ... ]
    },
    ...
]

Edit a workflow:
PATCH /workflows/:id {
    name: 'new-name',
    steps: [
        ...
    ]
}

Delete a workflow:
DELETE /workflows/:id


## Executions:

Execute a workflow:
POST /executions {
    workflowName: 'my-workflow',
    // args: { ... }
    // maybe if I learn how args are supposed to work
}

Returns {
       id: 234
}

Get status of an execution:
GET /executions/:id

Returns {
    id: 234,
    workflow: {
    	// ..
    },
    status: 'running', // or 'succeeded' or 'error'
    result: ['result'] // if succeeded
    message: 'reason' // if error
    step: 1, // current step index
    context: // execution variables go here
}

List executions:
GET /executions

Returns [
    {
        id: 234,
        workflow: {
        	// ...
        },
        status: 'succeeded',
        result: 'something',
        // ...
    },
    {
        id: 235,
        workflow: {
        	// ...
        },
        status: 'error',
        message: 'Something failed'
        // ...
    }
]

Cancel an execution (set status to 'cancelled'; maybe not that important
for PoC):
POST /executions/:id/cancel


# Command line tool

./workflow-deploy workflow_name --source=workflow

./workflow-run workflow_name


# What's missing

- Endpoints return errors in HTML, not JSON
- Error handling and validation could be more robust (more well-defined
  separation between expected and unexpected errors)
- Things are evaluated not so securely
