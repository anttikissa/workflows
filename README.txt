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

Access a workflow:
GET /workflows/:id

Returns {
    id: 123,
    name: 'my-workflow',
    steps: [ ... ]
}

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
    workflowId: 123,
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
    workflowId: 123,
    status: 'done', // TODO figure out statuses as we go
    // and other state that executions could have:
    // variables? error states? result?
}

If we need a list of executions, maybe:

GET /executions

Returns [
    {
        id: 234,
        workflowId: 123,
        status: 'pending'
    },
    {
        id: 235,
        workflowId: 123,
        status: 'done'
    }
]

Cancel an execution (set status to 'cancelled'; maybe not that important
for PoC):
POST /executions/:id/cancel
