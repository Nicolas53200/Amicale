-- Migration 0047: Fix default commissions to match prototype
-- 1. Rename "Fête des familles" → "Fête des Femmes" (FDF in prototype)
-- 2. Add missing "Calendriers" commission
-- 3. Update create_default_commissions function

-- Fix existing orgs: rename "Fête des familles" to "Fête des Femmes"
UPDATE commissions
SET name = 'Fête des Femmes',
    icon = '💐',
    description = 'Organisation de la Fête des Femmes'
WHERE name = 'Fête des familles'
  AND is_fixed = true;

-- Add "Calendriers" commission to existing orgs that don't have one
INSERT INTO commissions (org_id, name, model, icon, color, budget, is_fixed, description)
SELECT o.id, 'Calendriers', 'simple', '📅', '#F97316', 1000, true, 'Campagne de vente des calendriers'
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM commissions c
  WHERE c.org_id = o.id
    AND c.name = 'Calendriers'
    AND c.is_fixed = true
);

-- Recreate the default commissions function with corrected data
CREATE OR REPLACE FUNCTION public.create_default_commissions(p_org_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO commissions (org_id, name, model, icon, color, budget, is_fixed, description) VALUES
    (p_org_id, 'Événements', 'evenement', '🎉', '#FF6B35', 5000, true, 'Organisation des événements festifs et sportifs'),
    (p_org_id, 'Voyages', 'voyage', '✈️', '#3B82F6', 8000, true, 'Organisation des voyages et sorties'),
    (p_org_id, 'Locations', 'location', '🏠', '#10B981', 2000, true, 'Gestion des biens locatifs'),
    (p_org_id, 'Calendriers', 'simple', '📅', '#F97316', 1000, true, 'Campagne de vente des calendriers'),
    (p_org_id, 'Sport', 'simple', '⚽', '#8B5CF6', 1500, true, 'Activités sportives et tournois'),
    (p_org_id, 'Fête des Femmes', 'simple', '💐', '#F59E0B', 2000, true, 'Organisation de la Fête des Femmes'),
    (p_org_id, 'Sainte-Barbe', 'simple', '🔥', '#DC2626', 4000, true, 'Organisation de la Sainte-Barbe'),
    (p_org_id, 'Solidarité', 'simple', '🤝', '#06B6D4', 1000, true, 'Actions de solidarité entre membres'),
    (p_org_id, 'Foyer', 'simple', '☕', '#78716C', 500, true, 'Gestion du foyer et des consommations'),
    (p_org_id, 'Noël', 'simple', '🎄', '#EF4444', 3000, true, 'Organisation des fêtes de Noël');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
