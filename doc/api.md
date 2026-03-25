# Runrun.it API Documentation

## Overview

The Runrun.it API provides programmatic access to project management, task tracking, time logging, and team collaboration features.

**Base URL:** `https://runrun.it/api/v1.0`

**Authentication:** All requests require two HTTP headers:
- `App-Key`: Your company's API application key
- `User-Token`: The authenticated user's API token

**Rate Limit:** 100 requests per minute

---

## Table of Contents

1. [Activities](#activities)
2. [Board Stages](#board-stages)
3. [Checklist Items](#checklist-items)
4. [Checklists](#checklists)
5. [Clients](#clients)
6. [Comments](#comments)
7. [Demanders](#demanders)
8. [Descendants](#descendants)
9. [Task Description](#task-description)
10. [Documents](#documents)
11. [Enterprises](#enterprises)
12. [Estimates](#estimates)
13. [Event Notifications](#event-notifications)
14. [Saved Filters](#saved-filters)
15. [Justifications](#justifications)
16. [Manual Work Periods](#manual-work-periods)
17. [Off Days](#off-days)
18. [Partners](#partners)
19. [Prerequisites](#prerequisites)
20. [Project Description](#project-description)
21. [Project Groups](#project-groups)
22. [Project Sub Groups](#project-sub-groups)
23. [Project Templates](#project-templates)
24. [Projects](#projects)
25. [Tags](#tags)
26. [Task Types](#task-types)
27. [Tasks](#tasks)
28. [Task Evaluations](#task-evaluations)
29. [Task Followers](#task-followers)
30. [Task Assignments](#task-assignments)
31. [Task Sharing](#task-sharing)
32. [Task Workflows](#task-workflows)
33. [Teams](#teams)
34. [Users](#users)
35. [Workflows](#workflows)

---

## Activities

### GET /api/v1.0/activities
**Get activities**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |

---

## Board Stages

### GET /api/v1.0/boards/:board_id/stages
**List all board stages**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |
| search_term | string | Filter by term |
| stage_group | string | Filter by stage group ('opened' or 'closed') |
| id | integer | Board stage id |
| name | string | Board stage name |
| description | string | Board stage description |
| stage_group | enum | Board stage group ('opened' or 'closed') |
| board_id | integer | Board id |
| position | integer | Board stage position in group |
| last_editor_name | string | Name of last editor |
| is_following | boolean | Returns 'true' if user follows the Board stage |

### GET /api/v1.0/boards/:board_id/stages/:id
**Show a board stage**

| Name | Type | Description |
|------|------|-------------|
| id | integer | Board stage id |
| name | string | Board stage name |
| description | string | Board stage description |
| stage_group | enum | Board stage group ('opened' or 'closed') |
| board_id | integer | Board id |
| position | integer | Board stage position in group |
| last_editor_name | string | Name of last editor |
| is_following | boolean | Returns 'true' if user follows the Board stage |

### POST /api/v1.0/boards/:board_id/stages
**Create a board stage**

| Name | Type | Description |
|------|------|-------------|
| board_stage[name]* | string | Board stage name |
| board_stage[description] | string | Board stage description |
| board_stage[stage_group] | enum | Board stage group ('opened' or 'closed') |

### PUT /api/v1.0/boards/:board_id/stages/:id
**Update a board stage**

| Name | Type | Description |
|------|------|-------------|
| board_stage[name] | string | Board stage name |
| board_stage[description] | string | Board stage description |
| board_stage[stage_group] | enum | Board stage group ('opened' or 'closed') |

### DELETE /api/v1.0/boards/:board_id/stages/:id
**Destroy a board stage**

### POST /api/v1.0/boards/:board_id/stages/:id/move
**Move a board stage to another group position**

| Name | Type | Description |
|------|------|-------------|
| board_stage[stage_group]* | enum | Board stage group ('opened' or 'closed') |
| board_stage[position]* | integer | Board stage position in group |

### POST /api/v1.0/boards/:board_id/stages/:id/update_use_latency_time
**Update to use (or not) latency time**

| Name | Type | Description |
|------|------|-------------|
| board_stage[use_latency_time]* | boolean | Whether to use latency time |

### POST /api/v1.0/boards/:board_id/stages/:id/update_use_scrum_points
**Update to use (or not) scrum points**

| Name | Type | Description |
|------|------|-------------|
| board_stage[use_scrum_points]* | boolean | Whether to use scrum points |

---

## Checklist Items

### GET /api/v1.0/checklists/:checklist_id/items
**List checklist items**

### GET /api/v1.0/checklists/:checklist_id/items/:id
**Show a checklist item**

### POST /api/v1.0/checklists/:checklist_id/items
**Create a checklist item**

| Name | Type | Description |
|------|------|-------------|
| checklist_item[title]* | string | Title of the checklist item |

### PUT /api/v1.0/checklists/:checklist_id/items/:id
**Update a checklist item**

| Name | Type | Description |
|------|------|-------------|
| checklist_item[title] | string | Title of the checklist item |
| checklist_item[done] | boolean | Done status of the checklist item |

### PUT /api/v1.0/checklists/:checklist_id/items/:id/move
**Move a checklist item**

| Name | Type | Description |
|------|------|-------------|
| checklist_item[position]* | integer | Position of the checklist item |
| checklist_item[checklist_id] | integer | Checklist ID to move item to |

### DELETE /api/v1.0/checklists/:checklist_id/items/:id
**Destroy a checklist item**

---

## Checklists

### GET /api/v1.0/tasks/:task_id/checklists
**List checklists**

### GET /api/v1.0/tasks/:task_id/checklists/:id
**Show a checklist**

### POST /api/v1.0/tasks/:task_id/checklists
**Create a checklist**

| Name | Type | Description |
|------|------|-------------|
| checklist[title]* | string | Title of the checklist |

### PUT /api/v1.0/tasks/:task_id/checklists/:id
**Update a checklist**

| Name | Type | Description |
|------|------|-------------|
| checklist[title] | string | Title of the checklist |

### PUT /api/v1.0/tasks/:task_id/checklists/:id/move
**Move a checklist**

| Name | Type | Description |
|------|------|-------------|
| checklist[position]* | integer | Position of the checklist |

### DELETE /api/v1.0/tasks/:task_id/checklists/:id
**Destroy a checklist**

---

## Clients

### GET /api/v1.0/clients
**List all clients**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |
| id | integer | Client id |
| name | string | Client name |
| is_visible | boolean | Client visibility |
| created_at | datetime | Client creation date |
| updated_at | datetime | Client update date |

### GET /api/v1.0/clients/:id
**Show a client**

| Name | Type | Description |
|------|------|-------------|
| id | integer | Client id |
| name | string | Client name |
| is_visible | boolean | Client visibility |
| created_at | datetime | Client creation date |
| updated_at | datetime | Client update date |

### POST /api/v1.0/clients
**Create a client**

| Name | Type | Description |
|------|------|-------------|
| client[name]* | string | Client name |
| client[is_visible] | boolean | Client visibility |

### PUT /api/v1.0/clients/:id
**Update a client**

| Name | Type | Description |
|------|------|-------------|
| client[name] | string | Client name |
| client[is_visible] | boolean | Client visibility |

### DELETE /api/v1.0/clients/:id
**Destroy a client**

---

## Comments

### GET /api/v1.0/comments
**List all comments**

### GET /api/v1.0/comments/:id
**Show a specific comment**

### POST /api/v1.0/comments
**Create a new comment**

### PUT /api/v1.0/comments/:id
**Update a comment**

### DELETE /api/v1.0/comments/:id
**Destroy a comment**

### POST /api/v1.0/comments/:id/reaction
**Reaction to a comment**

---

## Demanders

### GET /api/v1.0/users/:user_id/demanders
**List all demanders of user**

| Name | Type | Description |
|------|------|-------------|
| user_id* | string | User's ID |
| id | string | User's ID |
| name | string | User's full name |
| email | string | User's email |
| avatar_url | url | User's chosen profile photo |
| avatar_large_url | url | User's chosen profile photo |
| cost_hour | decimal | Current user cost per hour |
| is_master | boolean | User is an administrator |

### POST /api/v1.0/users/:user_id/demanders
**Adds a demander to a user**

| Name | Type | Description |
|------|------|-------------|
| user_id* | string | User's ID |
| demander[id]* | string | Demander's ID |

### POST /api/v1.0/users/:user_id/demanders/replace
**Replace a user demanders list**

| Name | Type | Description |
|------|------|-------------|
| user_id* | string | User's ID |
| demander_ids* | array | List of demanders IDs |

### DELETE /api/v1.0/users/:user_id/demanders/:id
**Destroy a demander of a user**

| Name | Type | Description |
|------|------|-------------|
| user_id* | string | User's ID |
| id* | string | Demander's ID |

---

## Descendants

### GET /api/v1.0/tasks/:task_id/descendants
**Show task descendants**

| Name | Type | Description |
|------|------|-------------|
| task_id* | integer | Task ID |

---

## Task Description

### GET /api/v1.0/tasks/:task_id/description
**Show a description**

| Name | Type | Description |
|------|------|-------------|
| task_id* | integer | Task ID |
| body | string | Task description body |
| user | json | Current user editing the description |
| editor | string | Current user editing the description id |
| editing_since | datetime | Date the current user started editing the description |
| updated_at | datetime | Datetime the description has been changed |
| edited_at | datetime | Datetime the description has been edited |
| locked_at | datetime | Datetime the description has been locked by the current editor |

### PUT /api/v1.0/tasks/:task_id/description
**Update a description**

| Name | Type | Description |
|------|------|-------------|
| task_id* | integer | Task ID |
| description[body]* | string | Task description body |

---

## Documents

### GET /api/v1.0/tasks/:task_id/documents
**List all documents of a task**

### GET /api/v1.0/projects/:project_id/documents
**List all documents of a project**

### GET /api/v1.0/documents/:id
**Show a document**

### POST /api/v1.0/tasks/:task_id/documents
**Upload a document to task**

### POST /api/v1.0/projects/:project_id/documents
**Upload a document to project**

### DELETE /api/v1.0/documents/:id
**Delete a document**

---

## Enterprises

### GET /api/v1.0/enterprises
**Show the enterprise**

| Name | Type | Description |
|------|------|-------------|
| id | string | Enterprise id |
| name | string | Enterprise name |
| corporate_name | string | Enterprise corporate name |
| billing_company_name | string | Enterprise billing company name |
| cnpj | string | Enterprise CNPJ |
| street | string | Enterprise street address |
| complement | string | Enterprise complement address |
| neighborhood | string | Enterprise neighborhood |
| cep | string | Enterprise zip code |
| city | string | Enterprise city |
| state | string | Enterprise state |
| country | string | Enterprise country |
| desired_start_date_enabled | boolean | Enable desired start date on tasks |
| estimation_enabled | boolean | Enable estimation on tasks |
| scrum_points_enabled | boolean | Enable scrum points on board stages |
| board_stage_latency_time_enabled | boolean | Enable latency time on board stages |
| type_id_enabled | boolean | Enable task types |

---

## Estimates

### GET /api/v1.0/tasks/:task_id/estimates
**List all estimates**

### POST /api/v1.0/tasks/:task_id/estimates
**Create an estimate**

| Name | Type | Description |
|------|------|-------------|
| estimate[user_id]* | string | User ID |
| estimate[seconds]* | integer | Estimated time in seconds |

### PUT /api/v1.0/tasks/:task_id/estimates/:id
**Update an estimate**

| Name | Type | Description |
|------|------|-------------|
| estimate[seconds]* | integer | Estimated time in seconds |

### DELETE /api/v1.0/tasks/:task_id/estimates/:id
**Destroy an estimate**

---

## Event Notifications

### GET /api/v1.0/events
**List events**

### PUT /api/v1.0/events/:id
**Update an event**

---

## Saved Filters

### GET /api/v1.0/saved_filters
**List all Saved Filters**

### GET /api/v1.0/saved_filters/:id
**Show a Saved Filter**

### POST /api/v1.0/saved_filters
**Create a Saved Filter**

### PUT /api/v1.0/saved_filters/:id
**Update a Saved Filter**

### DELETE /api/v1.0/saved_filters/:id
**Destroy a Saved Filter**

---

## Justifications

### GET /api/v1.0/justifications
**List all Justifications**

### GET /api/v1.0/justifications/:id
**Show a Justification**

### POST /api/v1.0/justifications
**Create a Justification**

| Name | Type | Description |
|------|------|-------------|
| justification[name]* | string | Justification name |
| justification[description] | string | Justification description |

### PUT /api/v1.0/justifications/:id
**Update a Justification**

| Name | Type | Description |
|------|------|-------------|
| justification[name] | string | Justification name |
| justification[description] | string | Justification description |

### DELETE /api/v1.0/justifications/:id
**Destroy a Justification**

---

## Manual Work Periods

### GET /api/v1.0/manual_work_periods
**List all manual work periods**

| Name | Type | Description |
|------|------|-------------|
| manual_work_period[task_id] | integer | ID of related task |
| manual_work_period[from] | date_time | Manual work period from |
| manual_work_period[before] | date_time | Manual work period before |

### GET /api/v1.0/manual_work_periods/:id
**Show a Manual Work Period**

| Name | Type | Description |
|------|------|-------------|
| id | integer | ID |
| task_id | integer | ID of related task |
| seconds | integer | Time added in seconds |
| date_to_apply | date | Date time was worked |
| worker_name | string | Name of user who did the work |
| user_id | string | ID of user who did the work |
| team_id | integer | ID of team associated to user who did the work |
| team_name | string | Name of the team associated to the manual work period |
| board_stage_id | integer | ID of board stage associated to the manual work period |
| board_stage_name | string | Name of the board stage associated to the manual work period |
| task_state_id | integer | [Deprecated] Use board_stage_id |
| task_state_name | string | [Deprecated] Use board_stage_name |

### POST /api/v1.0/manual_work_periods
**Create a Manual Work Period**

| Name | Type | Description |
|------|------|-------------|
| manual_work_period[task_id]* | integer | ID of related task |
| manual_work_period[seconds]* | integer | Time added in seconds |
| manual_work_period[date_to_apply]* | date | Date time was worked |
| manual_work_period[user_id] | string | ID of the user that worked |
| manual_work_period[board_stage_id] | integer | ID of board stage to use on the manual work period |

### DELETE /api/v1.0/manual_work_periods/:id
**Destroy a Manual Work Period**

---

## Off Days

### GET /api/v1.0/off_days
**List all off days**

### GET /api/v1.0/off_days/:id
**Show an off day**

### POST /api/v1.0/off_days
**Create an off day**

### PUT /api/v1.0/off_days/:id
**Update an off day**

### DELETE /api/v1.0/off_days/:id
**Destroy an off day**

---

## Partners

### GET /api/v1.0/users/:user_id/partners
**List all partners of user**

### POST /api/v1.0/users/:user_id/partners
**Adds a partner to a user**

### POST /api/v1.0/users/:user_id/partners/replace
**Replace a user partners list**

### DELETE /api/v1.0/users/:user_id/partners/:id
**Destroy a partner of a user**

---

## Prerequisites

### GET /api/v1.0/tasks/:task_id/prerequisites
**List all task prerequisites from a task**

### POST /api/v1.0/tasks/:task_id/prerequisites
**Add a task prerequisite to a task**

### DELETE /api/v1.0/tasks/:task_id/prerequisites/:id
**Destroy a task prerequisite from a task**

---

## Project Description

### GET /api/v1.0/projects/:project_id/description
**Show a project description**

| Name | Type | Description |
|------|------|-------------|
| project_id* | integer | Project ID |
| body | string | Project description body |
| user | json | Current user editing the description |
| editor | string | Current user editing the description id |
| editing_since | datetime | Date the current user started editing the description |
| updated_at | datetime | Datetime the description has been changed |
| edited_at | datetime | Datetime the description has been edited |
| locked_at | datetime | Datetime the description has been locked by the current editor |

### PUT /api/v1.0/projects/:project_id/description
**Update a project description**

| Name | Type | Description |
|------|------|-------------|
| project_id* | integer | Project ID |
| description[body]* | string | Project description body |

---

## Project Groups

### GET /api/v1.0/project_groups
**List all project groups**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |
| id | integer | Project Group id |
| name | string | Project Group name |
| is_visible | boolean | Project Group visibility |
| created_at | datetime | Project Group creation date |

### GET /api/v1.0/project_groups/:id
**Show a project group**

| Name | Type | Description |
|------|------|-------------|
| id | integer | Project Group id |
| name | string | Project Group name |
| is_visible | boolean | Project Group visibility |
| created_at | datetime | Project Group creation date |

### POST /api/v1.0/project_groups
**Create a project group**

| Name | Type | Description |
|------|------|-------------|
| project_group[name]* | string | Project Group name |
| project_group[is_visible] | boolean | Project Group visibility |

### PUT /api/v1.0/project_groups/:id
**Update a project group**

| Name | Type | Description |
|------|------|-------------|
| project_group[name] | string | Project Group name |
| project_group[is_visible] | boolean | Project Group visibility |

### DELETE /api/v1.0/project_groups/:id
**Destroy a project group**

---

## Project Sub Groups

### GET /api/v1.0/project_sub_groups
**List all project sub groups**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |
| project_group_id | integer | Filter by Project Group |
| id | integer | Project Sub Group id |
| name | string | Project Sub Group name |
| project_group_id | integer | Project Group id |
| is_visible | boolean | Project Sub Group visibility |
| created_at | datetime | Project Sub Group creation date |

### GET /api/v1.0/project_sub_groups/:id
**Show a project sub group**

| Name | Type | Description |
|------|------|-------------|
| id | integer | Project Sub Group id |
| name | string | Project Sub Group name |
| project_group_id | integer | Project Group id |
| is_visible | boolean | Project Sub Group visibility |
| created_at | datetime | Project Sub Group creation date |

### POST /api/v1.0/project_sub_groups
**Create a project sub group**

| Name | Type | Description |
|------|------|-------------|
| project_sub_group[name]* | string | Project Sub Group name |
| project_sub_group[project_group_id]* | integer | Project Group id |
| project_sub_group[is_visible] | boolean | Project Sub Group visibility |

### PUT /api/v1.0/project_sub_groups/:id
**Update a project sub group**

| Name | Type | Description |
|------|------|-------------|
| project_sub_group[name] | string | Project Sub Group name |
| project_sub_group[project_group_id] | integer | Project Group id |
| project_sub_group[is_visible] | boolean | Project Sub Group visibility |

### DELETE /api/v1.0/project_sub_groups/:id
**Destroy a project sub group**

---

## Project Templates

### GET /api/v1.0/project_templates
**List all project templates**

### GET /api/v1.0/project_templates/:id
**Show a project template**

### POST /api/v1.0/project_templates/:id/apply
**Apply a project template**

---

## Projects

### GET /api/v1.0/projects
**List all projects**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |
| is_closed | boolean | Filter by open or closed state |
| board_id | integer | Board id (Required) |
| name | string | Project name |
| id | integer | Project id |
| client_id | integer | Client id |
| project_group_id | integer | Project group id |
| project_sub_group_id | integer | Project sub group id |
| type_id | integer | Project type id |
| board_id | integer | Board id |
| is_closed | boolean | Project is closed |
| total_tasks | integer | Total tasks |
| total_closed_tasks | integer | Total closed tasks |
| desired_date | datetime | Desired date |
| desired_start_date | datetime | Desired start date |
| tags_data | array | List of project tags |
| custom_fields | object | Project custom fields |
| time_worked | integer | Total time worked in seconds |
| estimated_time | integer | Total estimated time in seconds |
| created_at | datetime | Project creation date |
| updated_at | datetime | Project update date |
| closed_at | datetime | Project closed date |

### GET /api/v1.0/projects/:id
**Show a project**

| Name | Type | Description |
|------|------|-------------|
| name | string | Project name |
| id | integer | Project id |
| client_id | integer | Client id |
| project_group_id | integer | Project group id |
| project_sub_group_id | integer | Project sub group id |
| type_id | integer | Project type id |
| board_id | integer | Board id |
| is_closed | boolean | Project is closed |
| total_tasks | integer | Total tasks |
| total_closed_tasks | integer | Total closed tasks |
| desired_date | datetime | Desired date |
| desired_start_date | datetime | Desired start date |
| tags_data | array | List of project tags |
| custom_fields | object | Project custom fields |
| time_worked | integer | Total time worked in seconds |
| estimated_time | integer | Total estimated time in seconds |
| created_at | datetime | Project creation date |
| updated_at | datetime | Project update date |
| closed_at | datetime | Project closed date |

### POST /api/v1.0/projects
**Create a project**

| Name | Type | Description |
|------|------|-------------|
| project[name]* | string | Project name |
| project[board_id]* | integer | Board id |
| project[client_id] | integer | Client id |
| project[project_group_id] | integer | Project group id |
| project[project_sub_group_id] | integer | Project sub group id |
| project[type_id] | integer | Project type id |
| project[desired_date] | datetime | Desired date |
| project[desired_start_date] | datetime | Desired start date |
| project[tags_data] | array | List of project tags |
| project[custom_fields] | object | Project custom fields |

### PUT /api/v1.0/projects/:id
**Update a project**

| Name | Type | Description |
|------|------|-------------|
| project[name] | string | Project name |
| project[client_id] | integer | Client id |
| project[project_group_id] | integer | Project group id |
| project[project_sub_group_id] | integer | Project sub group id |
| project[type_id] | integer | Project type id |
| project[desired_date] | datetime | Desired date |
| project[desired_start_date] | datetime | Desired start date |
| project[tags_data] | array | List of project tags |
| project[custom_fields] | object | Project custom fields |

### PUT /api/v1.0/projects/:id/close
**Close a project**

### PUT /api/v1.0/projects/:id/reopen
**Reopen a project**

### DELETE /api/v1.0/projects/:id
**Destroy a project**

---

## Tags

### GET /api/v1.0/tags
**List all task tags**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |

### GET /api/v1.0/project_tags
**List all project tags**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |

### GET /api/v1.0/tasks/:task_id/tags
**List task tags**

### GET /api/v1.0/tasks/:task_id/project_tags
**List project tags by task**

### GET /api/v1.0/projects/:project_id/tags
**List project tags**

### POST /api/v1.0/tasks/:task_id/tags
**Add a tag to a task**

### POST /api/v1.0/tasks/:task_id/tags/replace
**Replace a task's tags**

### POST /api/v1.0/projects/:project_id/tags
**Add a tag to a project**

### POST /api/v1.0/projects/:project_id/tags/replace
**Replace a project's tags**

### DELETE /api/v1.0/tasks/:task_id/tags/:name
**Destroy a tag from a task**

### DELETE /api/v1.0/projects/:project_id/tags/:name
**Destroy a tag from a project**

---

## Task Types

### GET /api/v1.0/task_types
**List all task types**

### GET /api/v1.0/task_types/:id
**Show a task type**

### POST /api/v1.0/task_types
**Create a task type**

### PUT /api/v1.0/task_types/:id
**Update a task type**

---

## Tasks

### GET /api/v1.0/tasks
**Query tasks**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |
| responsible_id | string | Filter by responsible user ID (slug) |
| project_id | integer | Filter by project id |
| team_id | integer | Filter by team id |
| is_closed | boolean | Filter by open or closed state |
| board_stage_id | integer | Filter by board stage id |
| since | datetime | Filter by creation date. Tasks created after this date will be returned |
| type_id | integer | Filter by task type id |
| search_term | string | Filter by search term |
| parent_task_id | integer | Filter by parent task id |
| evaluation_status | string | Filter by evaluation status |
| overdue | boolean | Filter by overdue |
| completed_since | datetime | Tasks completed since this datetime |
| completed_before | datetime | Tasks completed before this datetime |

### GET /api/v1.0/tasks/:id
**Show a Task**

| Name | Type | Description |
|------|------|-------------|
| id | integer | Task id |
| title | string | Task title |
| is_working_on | boolean | True if user is working on this task |
| responsible_id | string | ID of the main responsible user |
| user_id | string | ID of the user who created the task |
| board_id | integer | Board id |
| board_stage_id | integer | Board stage id |
| project_id | integer | Project id |
| team_id | integer | Team id |
| type_id | integer | Task type id |
| client_id | integer | Client id |
| is_closed | boolean | Task is closed |
| desired_date | datetime | Desired date |
| desired_start_date | datetime | Desired start date |
| close_date | datetime | Close date |
| on_going | boolean | Task is on going |
| time_worked | integer | Total time worked in seconds |
| current_estimate_seconds | integer | Current estimate in seconds |
| tags_data | array | List of task tags |
| is_urgent | boolean | Task is urgent |
| priority | integer | Priority position among tasks |
| parent_task_id | integer | Parent task id |
| subtask_ids | array | IDs of subtasks |
| queue_position | integer | Queue position |
| time_pending | integer | Total time pending in seconds |
| time_progress | float | Time progress in percentage |
| overdue | boolean | Task is overdue |
| all_subtasks_time_total | integer | Sum of total time (in seconds) spent in all the subtasks from this task |
| all_subtasks_time_progress | float | Progress of time worked on all the subtasks from this task |
| current_level | integer | Depth level of this task on your tree |
| evaluator_ids | array | IDs from evaluators |
| pending_evaluator_ids | array | IDs from pending evaluators |
| approved_evaluator_ids | array | IDs from approved evaluators |
| rejected_evaluator_ids | array | IDs from rejected evaluators |
| custom_fields | object | Task custom fields |
| form_id | integer | ID of the form whom task was created from |
| board_stage_data | object | Data about the task board stage |
| board_stage_elapsed_time | integer | Time spent in seconds in the board stage |
| board_stage_elapsed_time_updated_at | datetime | Datetime of the last update of the attribute board_stage_elapsed_time |
| guest_ids | array | IDs of the guests that have access to this task |
| evaluation_status | string | Current evaluation status of the task |
| created_at | datetime | Task creation date |
| updated_at | datetime | Task update date |

### POST /api/v1.0/tasks
**Create a Task**

| Name | Type | Description |
|------|------|-------------|
| task[title]* | string | Task title |
| task[project_id]* | integer | Project id |
| task[board_stage_id] | integer | Board stage id |
| task[type_id] | integer | Task type id |
| task[desired_date] | datetime | Desired date |
| task[desired_start_date] | datetime | Desired start date |
| task[responsible_id] | string | ID of the main responsible user |
| task[on_going] | boolean | Whether the task is on-going |
| task[current_estimate_seconds] | integer | Current estimate in seconds |
| task[parent_task_id] | integer | Parent task id |
| task[tags_data] | array | List of task tags |
| task[custom_fields] | object | Task custom fields |
| task[assignment_ids] | array | IDs of assigned users |
| task[is_urgent] | boolean | Task is urgent |

### PUT /api/v1.0/tasks/:id
**Update task title**

| Name | Type | Description |
|------|------|-------------|
| task[title] | string | Task title |

### PUT /api/v1.0/tasks/:id
**Update task desired start date**

| Name | Type | Description |
|------|------|-------------|
| task[desired_start_date] | datetime | Desired start date |

### PUT /api/v1.0/tasks/:id
**Update task desired date**

| Name | Type | Description |
|------|------|-------------|
| task[desired_date] | datetime | Desired date |

### PUT /api/v1.0/tasks/:id
**Add task tags, without setting the color**

| Name | Type | Description |
|------|------|-------------|
| task[tags_data] | array | List of task tags |

### PUT /api/v1.0/tasks/:id
**Update task points**

| Name | Type | Description |
|------|------|-------------|
| task[points] | integer | Scrum points |

### PUT /api/v1.0/tasks/:id
**Update task custom fields**

| Name | Type | Description |
|------|------|-------------|
| task[custom_fields] | object | Task custom fields |

### DELETE /api/v1.0/tasks/:id
**Destroy a task**

### GET /api/v1.0/tasks/:id/subtasks
**Show task subtasks**

### POST /api/v1.0/tasks/:id/complete_workflow_step
**Complete a workflow step**

| Name | Type | Description |
|------|------|-------------|
| id* | integer | Task ID |

### POST /api/v1.0/tasks/:id/undo_workflow_step
**Undo a workflow step**

| Name | Type | Description |
|------|------|-------------|
| id* | integer | Task ID |

### POST /api/v1.0/tasks/:id/mark_as_urgent
**Mark a task as urgent**

| Name | Type | Description |
|------|------|-------------|
| id* | integer | Task ID |

### POST /api/v1.0/tasks/:id/unmark_as_urgent
**Unmark a task as urgent**

| Name | Type | Description |
|------|------|-------------|
| id* | integer | Task ID |

### POST /api/v1.0/tasks/:id/move_board_stage
**Move a task to a board stage**

| Name | Type | Description |
|------|------|-------------|
| id* | integer | Task ID |
| board_stage_id* | integer | Board stage ID |

---

## Task Evaluations

### POST /api/v1.0/tasks/:task_id/evaluations
**Updates the task evaluations**

### DELETE /api/v1.0/tasks/:task_id/evaluations
**Destroy all evaluations for this task**

### GET /api/v1.0/task_evaluations
**List all task evaluations when no params are passed**

### GET /api/v1.0/task_evaluations
**List all task evaluations for a specific task**

### GET /api/v1.0/task_evaluations
**List all task evaluations for a specific evaluator**

### POST /api/v1.0/task_evaluations/:id/reset
**Reset a task evaluation**

### DELETE /api/v1.0/task_evaluations/:id
**Destroy a task evaluation**

---

## Task Followers

### GET /api/v1.0/tasks/:task_id/followers
**List all followers**

### POST /api/v1.0/tasks/:task_id/followers
**Adds a follower to a task**

### DELETE /api/v1.0/tasks/:task_id/followers/:id
**Destroy a follower from a task**

---

## Task Assignments

### POST /api/v1.0/tasks/:task_id/assignments
**Create a task assignment for another user**

| Name | Type | Description |
|------|------|-------------|
| task_assignment[assignee_id]* | string | ID of assignee |
| task_id* | integer | ID of task |

### PUT /api/v1.0/tasks/:task_id/assignments/:id
**Update a task assignment for another user**

| Name | Type | Description |
|------|------|-------------|
| id* | string | ID of assignment |
| task_id* | integer | ID of task |
| task_assignment[queue_position] | integer | Queue position |
| task_assignment[effort] | string | Effort to present only the informed assignee effort will be affected |

### DELETE /api/v1.0/tasks/:task_id/assignments/:id
**Destroy a task assignment for another user**

| Name | Type | Description |
|------|------|-------------|
| id* | string | ID of assignment |
| task_id* | integer | ID of task |
| destroy_worked_time | boolean | Destroy worked time |

### POST /api/v1.0/tasks/:task_id/assignments/:id/play
**Play a Task**

| Name | Type | Description |
|------|------|-------------|
| id* | string | ID of assignment |
| task_id* | integer | ID of task |

### POST /api/v1.0/tasks/:task_id/assignments/:id/pause
**Pause a task assignment**

| Name | Type | Description |
|------|------|-------------|
| id* | string | ID of assignment |
| task_id* | integer | ID of task |

---

## Task Sharing

### POST /api/v1.0/tasks/:id/share
**Share the task**

| Name | Type | Description |
|------|------|-------------|
| id* | integer | Task ID |
| comment | string | Comment |
| guests_params | array | List of objects with guest data |
| sharing_details | array | List of optional information to be shared. Options: "documents", "time_progress", "board_stage" |

### POST /api/v1.0/tasks/:id/unshare
**Unshare the task**

| Name | Type | Description |
|------|------|-------------|
| id* | integer | Task ID |

---

## Task Workflows

### DELETE /api/v1.0/workflows
**Destroy a workflow**

| Name | Type | Description |
|------|------|-------------|
| task_id* | integer | ID of the task the workflow belongs to |

---

## Teams

### GET /api/v1.0/teams
**List all Teams**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |
| id | integer | Team id |
| name | string | Team name |
| user_ids | array | IDs of team members |
| board_id | integer | Board id |
| leader_id | string | Leader user id |

### GET /api/v1.0/teams/:id
**Show a team**

| Name | Type | Description |
|------|------|-------------|
| id | integer | Team id |
| name | string | Team name |
| user_ids | array | IDs of team members |
| board_id | integer | Board id |
| leader_id | string | Leader user id |

---

## Users

### GET /api/v1.0/users
**List all Users**

| Name | Type | Description |
|------|------|-------------|
| sort | string | Sort by column |
| sort_dir | string | Sort direction ('asc' or 'desc') |
| is_active | boolean | Filter by active status |
| team_id | integer | Filter by team id |
| id | string | User's ID |
| name | string | User's full name |
| email | string | User's email |
| avatar_url | url | User's chosen profile photo |
| avatar_large_url | url | User's chosen profile photo |
| cost_hour | decimal | Current user cost per hour |
| is_master | boolean | User is an administrator |
| permission_type | string | User role |

### GET /api/v1.0/users/:id
**Show a user**

| Name | Type | Description |
|------|------|-------------|
| id | string | User's ID |
| name | string | User's full name |
| email | string | User's email |
| avatar_url | url | User's chosen profile photo |
| avatar_large_url | url | User's chosen profile photo |
| cost_hour | decimal | Current user cost per hour |
| is_master | boolean | User is an administrator |
| permission_type | string | User role |

### GET /api/v1.0/users/me
**Show the authenticated user**

---

## Workflows

### GET /api/v1.0/workflows
**List all workflows**

### GET /api/v1.0/workflows
**List all workflows for a task**

### GET /api/v1.0/workflows/:id
**Show a workflow**

### POST /api/v1.0/workflows
**Create a workflow**

| Name | Type | Description |
|------|------|-------------|
| task_id* | integer | ID of the task the workflow belongs to |
| name* | string | Name of the workflow |

### PUT /api/v1.0/workflows/:id
**Update a workflow**

| Name | Type | Description |
|------|------|-------------|
| name | string | Name of the workflow |
| step_ids | array | IDs of the steps |

### DELETE /api/v1.0/workflows
**Destroy a workflow**

| Name | Type | Description |
|------|------|-------------|
| task_id* | integer | ID of the task the workflow belongs to |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource was created |
| 204 | No Content - Request succeeded with no content returned |
| 400 | Bad Request - Invalid parameters or malformed request |
| 401 | Unauthorized - Missing or invalid credentials |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Error Handling

All error responses include a JSON body with error details:

```json
{
  "error": "Error message",
  "status": 422
}
```

## Authentication Headers

Required on all requests:

```
App-Key: your_app_key
User-Token: your_user_token
```

## Rate Limiting

The API enforces a rate limit of 100 requests per minute. When the limit is exceeded, the API returns a 429 status code with a `Retry-After` header indicating how long to wait before retrying.

## Data Types

- **integer**: Whole number
- **string**: Text value
- **boolean**: true or false
- **array**: List of values
- **object**: Complex structure with nested properties
- **datetime**: ISO 8601 format (e.g., 2026-03-25T14:30:00Z)
- **date**: ISO 8601 format (e.g., 2026-03-25)
- **url**: HTTP(S) URL string
- **decimal**: Floating point number
- **enum**: Limited set of predefined values
- **json**: JSON-formatted object or array
- **date_time**: ISO 8601 datetime format

## Common Parameters

- **sort**: Sort results by specified column name
- **sort_dir**: Sort direction ('asc' for ascending, 'desc' for descending)
- **page**: Pagination page number (default: 1)
- **limit**: Number of results per page (default: 50)
