# How to run

    # run server at localhost:3000; recent node.js required
    npm install
    ./start

    # similar to 'gcloud workflows deploy'
    ./workflow-deploy test --source=test.yaml

    # similar to 'gcloud workflows run'
    ./workflow-run test

# Scope & supported features

- Workflow yaml/json structure similar to Google Cloud Workflows
- http.get
- assign
- return

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

# What's missing?

- Endpoints return errors in HTML, not JSON
- Error handling and validation could be more robust (more well-defined
  separation between expected and unexpected errors)
- Things are evaluated not so securely
- Most of gcloud workflows functionality (just http.get, assign and return 
  for now)
- Web UI (command line will have to do for now)
