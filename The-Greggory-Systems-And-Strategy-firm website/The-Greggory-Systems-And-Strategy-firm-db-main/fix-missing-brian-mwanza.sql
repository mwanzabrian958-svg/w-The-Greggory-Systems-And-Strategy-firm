-- =====================================================
-- FIX: Insert Brian Mwanza into company_personnel table
-- This script fixes the "Person not found" error on the About page
-- =====================================================

USE the_greggory_systems_and_strategy_firm_db_main;

-- Insert Brian Mwanza if he doesn't already exist
INSERT INTO company_personnel (name, position, bio, image_url, sort_order, is_active)
SELECT 'Brian Mwanza', 'Founder & Managing Director',
 '<p>Brian Mwanza is the visionary force behind The-Greggory-Systems-And-Strategy-firm. With over a decade of experience in systemic design and business strategy, he has guided some of the most ambitious organizations through complex digital and operational transformations.</p><p>His philosophy is rooted in the belief that &quot;Strategy is not a document; it''s a pulse.&quot; Under his leadership, the firm has evolved from a boutique advisory to a global architect of business resonance, known for its uncompromising commitment to clarity and human-centric systems.</p>',
 '/images/brian-mwanza-ceo.jpg',
 0, TRUE
WHERE NOT EXISTS (SELECT 1 FROM company_personnel WHERE name = 'Brian Mwanza');

-- Verify the record exists
SELECT id, name, position, is_active FROM company_personnel WHERE name = 'Brian Mwanza';
