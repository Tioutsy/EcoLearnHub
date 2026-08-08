# Subscription State & Employee Band Standard

## 1. Subscription State Model
The ELEVIO SKILLS platform supports the following explicit subscription lifecycle states:
- `active`: Subscription in good standing, full LMS access.
- `pending`: Account created, payment/plan confirmation pending.
- `payment_failed`: Payment attempt failed, grace period active.
- `suspended`: Account suspended due to non-payment or administrative lock.
- `cancelled`: Subscription terminated by client.

---

## 2. Server-Enforced Headcount Limits

| Employee Band | Monthly Price (MUR) | Max Seats (`maxEmployees`) |
| :--- | :--- | :--- |
| **Up to 25** | MUR 3,000 / mo | 25 |
| **26–50** | MUR 4,500 / mo | 50 |
| **51–80** | MUR 5,000 / mo | 80 |
| **81–120** | MUR 6,250 / mo | 120 |
| **>120 (Tailored)** | Custom | Custom Quote Path |

### Server Seat Rule:
When `POST /api/company/employees` is invoked:
1. Active + invited employee rows in `employeesTable` are counted.
2. If `currentEmployees >= company.maxEmployees`, the server responds with **HTTP 403 Forbidden**:
   ```json
   {
     "error": "Employee seat limit reached (25 of 25 seats used). Please upgrade your subscription band to add more employees."
   }
   ```
