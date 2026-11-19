-- =========================================================================
-- IntelliDesk Seed Data Script
-- Default Roles, Master Categories, and Initial Admin User
-- =========================================================================

-- 1. Insert System Roles
INSERT INTO roles (name, description) VALUES
('ROLE_EMPLOYEE', 'Standard employee with access to AI troubleshooting and personal tickets'),
('ROLE_SUPPORT_ENGINEER', 'IT support staff capable of managing queues, resolving tickets, and adding notes'),
('ROLE_ADMIN', 'System administrator with user, document, role, and analytics control')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Master Ticket Categories
INSERT INTO ticket_categories (name, code, description, default_priority) VALUES
('Network & Connectivity', 'NETWORK', 'Issues with Wi-Fi, Ethernet, DNS, DHCP, or internal LAN access', 'MEDIUM'),
('VPN & Remote Access', 'VPN', 'Virtual Private Network disconnections, authentication, or certificate errors', 'HIGH'),
('Hardware & Peripherals', 'HARDWARE', 'Laptops, monitors, keyboards, docks, and physical device defects', 'MEDIUM'),
('Software & Applications', 'SOFTWARE', 'Desktop software crashes, licensing, installation, and application errors', 'MEDIUM'),
('Email & Messaging', 'EMAIL', 'Microsoft Outlook, Exchange sync, spam filtering, and calendar issues', 'MEDIUM'),
('Printer & Scanner', 'PRINTER', 'Network printers, driver installations, queue freezes, and scan-to-email', 'LOW'),
('Operating System', 'OPERATING_SYSTEM', 'Windows/macOS updates, Blue Screen (BSOD), performance degradation', 'HIGH'),
('Account & Access Management', 'ACCOUNT_ACCESS', 'Password resets, Single Sign-On (SSO), MFA tokens, and permissions', 'CRITICAL'),
('General / Other', 'OTHER', 'Technical requests and inquiries not fitting specific categories', 'LOW')
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Initial Demo Users
-- Note: Password for all default accounts is: Password@123
-- BCrypt hash: $2a$10$wE.6J0VzE8i9Cj0.nL0r9eu9L4qX7YQ9mN7yK1zU5n4rO8p6x2y7m
INSERT INTO users (email, password_hash, first_name, last_name, department, active) VALUES
('admin@intellidesk.com', '$2a$10$wE.6J0VzE8i9Cj0.nL0r9eu9L4qX7YQ9mN7yK1zU5n4rO8p6x2y7m', 'Admin', 'User', 'IT Operations', TRUE),
('engineer@intellidesk.com', '$2a$10$wE.6J0VzE8i9Cj0.nL0r9eu9L4qX7YQ9mN7yK1zU5n4rO8p6x2y7m', 'Alex', 'Rivera', 'Tier-2 Support', TRUE),
('employee@intellidesk.com', '$2a$10$wE.6J0VzE8i9Cj0.nL0r9eu9L4qX7YQ9mN7yK1zU5n4rO8p6x2y7m', 'Sarah', 'Chen', 'Engineering', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 4. Map Users to Roles
-- Map admin@intellidesk.com -> ROLE_ADMIN
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@intellidesk.com' AND r.name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

-- Map engineer@intellidesk.com -> ROLE_SUPPORT_ENGINEER
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'engineer@intellidesk.com' AND r.name = 'ROLE_SUPPORT_ENGINEER'
ON CONFLICT DO NOTHING;

-- Map employee@intellidesk.com -> ROLE_EMPLOYEE
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'employee@intellidesk.com' AND r.name = 'ROLE_EMPLOYEE'
ON CONFLICT DO NOTHING;
