-- =========================================================================
-- IntelliDesk Database Initialization Script
-- PostgreSQL with pgvector Extension
-- =========================================================================

-- Enable pgvector extension for AI semantic search & RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    department VARCHAR(80),
    phone_number VARCHAR(30),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. User-Roles join table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Ticket Categories table
CREATE TABLE IF NOT EXISTS ticket_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(60) UNIQUE NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    default_priority VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI Conversations (Interactive troubleshooting sessions)
CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(64) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    initial_query TEXT NOT NULL,
    identified_category VARCHAR(60),
    status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL, -- ACTIVE, RESOLVED, ESCALATED
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 6. Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_number VARCHAR(32) UNIQUE NOT NULL, -- e.g. TCK-20261119-0001
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'OPEN' NOT NULL, -- OPEN, ASSIGNED, IN_PROGRESS, WAITING_FOR_USER, ESCALATED, RESOLVED, CLOSED
    priority VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    category_id BIGINT REFERENCES ticket_categories(id) ON DELETE SET NULL,
    requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_engineer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    source_conversation_id BIGINT REFERENCES ai_conversations(id) ON DELETE SET NULL,
    ai_summary TEXT,
    root_cause TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 7. Ticket Assignments history
CREATE TABLE IF NOT EXISTS ticket_assignments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    assigned_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Ticket Messages (Communication thread between employee & engineer)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Ticket History (Audit log of ticket status/priority transitions)
CREATE TABLE IF NOT EXISTS ticket_history (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    changed_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    field_changed VARCHAR(50) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Knowledge Documents (Admin-uploaded SOPs, manuals)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- PDF, DOCX, TXT
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    category VARCHAR(60) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    version INT DEFAULT 1 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    uploaded_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Document Chunks with Vector Embeddings (RAG Engine)
CREATE TABLE IF NOT EXISTS document_chunks (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_content TEXT NOT NULL,
    token_count INT,
    embedding vector(1536), -- 1536 dims for OpenAI text-embedding-3 / configurable
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. AI Messages (Chat messages in troubleshooting session)
CREATE TABLE IF NOT EXISTS ai_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- USER, ASSISTANT, SYSTEM
    content TEXT NOT NULL,
    context_citations JSONB, -- Document references used by RAG
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Troubleshooting Steps (Tracked interactive diagnostic checklist)
CREATE TABLE IF NOT EXISTS troubleshooting_steps (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    step_title VARCHAR(150) NOT NULL,
    instructions TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL, -- PENDING, ATTEMPTED, SUCCEEDED, FAILED, SKIPPED
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE
);

-- 14. Ticket Feedback (CSAT post-resolution)
CREATE TABLE IF NOT EXISTS ticket_feedback (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT UNIQUE NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Audit Logs (Enterprise security and administrative tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    entity_name VARCHAR(60) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- Indexes for High-Performance Queries
-- =========================================================================

-- Ticket querying indexes
CREATE INDEX IF NOT EXISTS idx_tickets_requester ON tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_engineer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_composite_queue ON tickets(status, priority, created_at DESC);

-- AI session indexes
CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_msg_conv ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tb_steps_conv ON troubleshooting_steps(conversation_id);

-- RAG Vector Index: HNSW (Hierarchical Navigable Small World) with Cosine Distance
-- Enables sub-millisecond Approximate Nearest Neighbor (ANN) vector searches
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw 
ON document_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
