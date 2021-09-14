# API

Workflows:

POST /workflows - create new workflow
GET /workflows - list them
GET /workflows/:id - access one
PUT /workflows/:id - edit workflow (needed?)
DELETE /workflows/:id - delete workflow (postpone)

Executions:

POST /executions - execute a workflow
GET /executions/:id - get status of an execution
POST /executions/:id/cancel - cancel an execution (postpone)
