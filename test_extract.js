const toRecord = (value) =>
  value && typeof value === "object" ? value : {};

const extractPayload = (raw) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw) => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item) => !!item && typeof item === "object");
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item) => !!item && typeof item === "object");
    }
  }

  return [];
};

const responseData = {
    "success": true,
    "message": "My KPIs",
    "data": [
        {
            "id": 1,
            "employee_id": 1,
            "title": "test",
            "description": "adsd",
            "target": 23,
            "achievement": 0,
            "score": 0,
            "status": "draft",
            "created_at": "2026-04-22T09:08:06.000000Z",
            "updated_at": "2026-04-22T09:08:06.000000Z",
            "employee": {
                "id": 1,
                "user_id": 1,
                "position": "Super Administrator",
                "department": "Management",
                "manager_id": null,
                "user": {
                    "id": 1,
                    "name": "Super Admin",
                    "email": "superadmin@gmail.com",
                    "profile": null
                },
                "manager": null
            }
        }
    ]
};

console.log(JSON.stringify(extractArrayPayload(responseData), null, 2));
