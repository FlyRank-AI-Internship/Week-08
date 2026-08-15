# Phase 1 Design

## Problem

Customers need a simple way to create lead-capture widgets that can be embedded on websites they do not control. Visitors should be able to submit information safely from those external websites, while widget owners can later view submissions and basic analytics.

## Main Actors

1. Widget Owner - authenticated customer who manages widgets and views submissions.
2. Customer Website - external website that loads the public widget script.
3. Website Visitor - public user who interacts with the widget and submits data.

## Core Request Paths

### Owner path

Authenticated owner
-> Widget Management API
-> tenant-isolated database
-> embed snippet

### Widget delivery path

External website
-> widget.v1.js
-> public widget config
-> render widget

### Submission path

Visitor submission
-> CORS
-> validation
-> payload protection
-> rate limit
-> spam check
-> geo enrichment
-> store submission
-> non-critical side effect

### Dashboard path

Authenticated owner
-> Dashboard API
-> tenant-filtered submissions and analytics

## Initial Data Model

### Tenant

- id
- name
- createdAt

### User

- id
- tenantId
- email
- passwordHash
- createdAt

### Widget

- id
- tenantId
- type
- title
- description
- buttonText
- fields
- displayOptions
- isActive
- createdAt
- updatedAt

### Submission

- id
- widgetId
- tenantId
- payload
- ipAddress
- country
- city
- userAgent
- isSpam
- createdAt

## API Surface

### Authentication

POST /api/auth/login

### Widget Management

POST /api/widgets
GET /api/widgets
GET /api/widgets/:id
PATCH /api/widgets/:id
DELETE /api/widgets/:id
GET /api/widgets/:id/embed

### Public Widget Delivery

GET /widget.v1.js
GET /api/public/widgets/:id/config

### Public Submission

POST /api/public/widgets/:id/submissions
OPTIONS /api/public/widgets/:id/submissions

### Dashboard

GET /api/dashboard/submissions
GET /api/dashboard/stats

## Layers

HTTP / Routes
↓
Validation + Middleware
↓
Services / Business Logic
↓
Repositories
↓
PostgreSQL

External dependencies such as geo providers and side effects sit behind service interfaces so they can fail or be swapped without changing the HTTP layer.

## Explicit Non-Goal

This capstone will not build a drag-and-drop form builder or polished dashboard frontend. The widget UI and owner-facing UI will remain minimal because the project is graded primarily on backend correctness, resilience, security, and cross-origin behavior.