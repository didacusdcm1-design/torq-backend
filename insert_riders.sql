INSERT INTO "Rider" (id, "firstName", "lastName", email, phone, status, "createdAt", "updatedAt") 
VALUES 
(gen_random_uuid(), 'Chadrick', 'Didacus', 'rider@torq.com', '0712345678', 'APPROVED', NOW(), NOW()),
(gen_random_uuid(), 'John', 'Doe', 'john@torq.com', '0722334455', 'PENDING', NOW(), NOW()),
(gen_random_uuid(), 'Jane', 'Smith', 'jane@torq.com', '0733445566', 'REJECTED', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
