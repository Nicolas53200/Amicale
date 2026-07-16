-- ============================================================
-- ÉTAPE 3 : Hook JWT pour injecter org_id dans le token
-- ============================================================

-- Cette fonction ajoute org_id au JWT pour que les policies RLS
-- puissent utiliser public.org_id()
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  member_org_id UUID;
BEGIN
  claims := event->'claims';

  SELECT m.org_id INTO member_org_id
  FROM public.members m
  WHERE m.user_id = (event->>'user_id')::UUID
  LIMIT 1;

  IF member_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}', to_jsonb(member_org_id::TEXT));
    event := jsonb_set(event, '{claims}', claims);
  END IF;

  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions nécessaires au hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT SELECT ON TABLE public.members TO supabase_auth_admin;


-- ============================================================
-- ÉTAPE 4 : Données de démonstration (seed)
-- ============================================================

-- 4.1 Organisation
INSERT INTO organizations (id, name, slug, plan, settings) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Amicale SP Laval',
  'amicale-sp-laval',
  'pro',
  '{
    "modules": {
      "locations": true,
      "voyages": true,
      "evenements": true,
      "bons_cadeaux": true
    },
    "onboarding_steps": 5,
    "theme_color": "#FF6B35"
  }'::jsonb
);


-- 4.2 Commissions (9 commissions fixes du prototype)
INSERT INTO commissions (id, org_id, name, model, icon, color, budget, features, is_fixed, description) VALUES
  ('c0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Événements', 'evenement', '🎉', '#FF6B35', 5000, '["notifications","documents","compta","membres"]', true, 'Organisation des événements festifs et sportifs'),
  ('c0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Voyages', 'voyage', '✈️', '#3B82F6', 8000, '["notifications","documents","compta","membres"]', true, 'Organisation des voyages et sorties'),
  ('c0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Locations', 'location', '🏠', '#10B981', 2000, '["notifications","documents","compta","membres"]', true, 'Gestion des biens locatifs de l''amicale'),
  ('c0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Sport', 'simple', '⚽', '#8B5CF6', 1500, '["notifications","documents","compta","membres"]', true, 'Activités sportives et tournois'),
  ('c0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Noël', 'simple', '🎄', '#EF4444', 3000, '["notifications","documents","compta","membres"]', true, 'Organisation des fêtes de Noël'),
  ('c0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Fête des familles', 'simple', '👨‍👩‍👧‍👦', '#F59E0B', 2000, '["notifications","documents","compta","membres"]', true, 'Journée annuelle des familles'),
  ('c0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Sainte-Barbe', 'simple', '🔥', '#DC2626', 4000, '["notifications","documents","compta","membres"]', true, 'Organisation de la Sainte-Barbe'),
  ('c0000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Solidarité', 'simple', '🤝', '#06B6D4', 1000, '["notifications","documents","compta","membres"]', true, 'Actions de solidarité entre membres'),
  ('c0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Foyer', 'simple', '☕', '#78716C', 500, '["notifications","documents","compta","membres"]', true, 'Gestion du foyer et des consommations');


-- 4.3 Membres (9 membres du prototype)
-- Note : les user_id seront mis à jour après création des users auth
INSERT INTO members (id, org_id, first_name, last_name, email, phone, role, status, grade, centre, is_bureau, bureau_role, onboarding_completed, invitation_code) VALUES
  ('m0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Nicolas', 'Morel', 'nicolas.morel53@hotmail.fr', '06 12 34 56 78', 'president', 'actif', 'Adjudant-chef', 'CIS Laval', true, 'Président', true, 'INVITE-NICOLAS'),
  ('m0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Sophie', 'Martin', 'sophie.martin@email.fr', '06 23 45 67 89', 'tresorier', 'actif', 'Sergent-chef', 'CIS Laval', true, 'Trésorière', true, 'INVITE-SOPHIE'),
  ('m0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Thomas', 'Dubois', 'thomas.dubois@email.fr', '06 34 56 78 90', 'secretaire', 'actif', 'Caporal-chef', 'CIS Changé', true, 'Secrétaire', true, 'INVITE-THOMAS'),
  ('m0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Marie', 'Bernard', 'marie.bernard@email.fr', '06 45 67 89 01', 'commissaire', 'actif', 'Sergent', 'CIS Laval', true, 'Commissaire aux comptes', true, 'INVITE-MARIE'),
  ('m0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Pierre', 'Petit', 'pierre.petit@email.fr', '06 56 78 90 12', 'membre', 'actif', 'Caporal', 'CIS Bonchamp', false, NULL, true, 'INVITE-PIERRE'),
  ('m0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Julie', 'Robert', 'julie.robert@email.fr', '06 67 89 01 23', 'membre', 'actif', 'Sapeur 1ère classe', 'CIS Laval', false, NULL, true, 'INVITE-JULIE'),
  ('m0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Antoine', 'Richard', 'antoine.richard@email.fr', '06 78 90 12 34', 'membre', 'actif', 'Caporal-chef', 'CIS Changé', false, NULL, true, 'INVITE-ANTOINE'),
  ('m0000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Claire', 'Durand', 'claire.durand@email.fr', '06 89 01 23 45', 'membre', 'actif', 'Lieutenant', 'CIS Laval', false, NULL, true, 'INVITE-CLAIRE'),
  ('m0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Lucas', 'Leroy', 'lucas.leroy@email.fr', '06 90 12 34 56', 'membre', 'inactif', 'Adjudant', 'CIS Bonchamp', false, NULL, false, 'INVITE-LUCAS');


-- 4.4 Commission members (affecter des membres aux commissions)
INSERT INTO commission_members (commission_id, member_id, role) VALUES
  -- Événements
  ('c0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000001', 'responsable'),
  ('c0000001-0000-0000-0000-000000000001', 'm0000005-0000-0000-0000-000000000005', 'membre'),
  ('c0000001-0000-0000-0000-000000000001', 'm0000006-0000-0000-0000-000000000006', 'membre'),
  -- Voyages
  ('c0000002-0000-0000-0000-000000000002', 'm0000002-0000-0000-0000-000000000002', 'responsable'),
  ('c0000002-0000-0000-0000-000000000002', 'm0000007-0000-0000-0000-000000000007', 'membre'),
  -- Locations
  ('c0000003-0000-0000-0000-000000000003', 'm0000003-0000-0000-0000-000000000003', 'responsable'),
  ('c0000003-0000-0000-0000-000000000003', 'm0000008-0000-0000-0000-000000000008', 'membre'),
  -- Sport
  ('c0000004-0000-0000-0000-000000000004', 'm0000005-0000-0000-0000-000000000005', 'responsable'),
  ('c0000004-0000-0000-0000-000000000004', 'm0000007-0000-0000-0000-000000000007', 'membre'),
  -- Noël
  ('c0000005-0000-0000-0000-000000000005', 'm0000006-0000-0000-0000-000000000006', 'responsable'),
  ('c0000005-0000-0000-0000-000000000005', 'm0000004-0000-0000-0000-000000000004', 'membre'),
  -- Sainte-Barbe
  ('c0000007-0000-0000-0000-000000000007', 'm0000001-0000-0000-0000-000000000001', 'responsable'),
  ('c0000007-0000-0000-0000-000000000007', 'm0000002-0000-0000-0000-000000000002', 'membre'),
  ('c0000007-0000-0000-0000-000000000007', 'm0000003-0000-0000-0000-000000000003', 'membre'),
  -- Solidarité
  ('c0000008-0000-0000-0000-000000000008', 'm0000004-0000-0000-0000-000000000004', 'responsable'),
  -- Foyer
  ('c0000009-0000-0000-0000-000000000009', 'm0000008-0000-0000-0000-000000000008', 'responsable');


-- 4.5 Événements
INSERT INTO events (id, org_id, commission_id, title, description, date, end_date, location, max_attendees, price, max_benevoles, category) VALUES
  ('e0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001',
   'Repas de l''amicale', 'Grand repas annuel de l''amicale. Menu : apéritif, entrée, plat, dessert, vin compris. Soirée dansante à partir de 22h.',
   '2026-09-20 19:00:00+02', '2026-09-21 02:00:00+02', 'Salle des fêtes de Laval', 120, 25, 8, 'repas'),

  ('e0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001',
   'Tournoi de foot inter-centres', 'Tournoi de football entre les différents centres de secours du département. Équipes de 6 joueurs.',
   '2026-08-16 09:00:00+02', '2026-08-16 18:00:00+02', 'Stade municipal', 60, 0, 6, 'sport'),

  ('e0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'c0000007-0000-0000-0000-000000000007',
   'Sainte-Barbe 2026', 'Cérémonie de la Sainte-Barbe suivie du repas traditionnel. Tenue de cérémonie obligatoire.',
   '2026-12-04 18:00:00+01', '2026-12-05 01:00:00+01', 'Centre de secours Laval', 200, 35, 12, 'ceremonie'),

  ('e0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'c0000005-0000-0000-0000-000000000005',
   'Arbre de Noël', 'Fête de Noël pour les enfants des sapeurs-pompiers. Spectacle, goûter et cadeaux.',
   '2026-12-13 14:00:00+01', '2026-12-13 18:00:00+01', 'Salle du foyer', 80, 0, 10, 'famille'),

  ('e0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'c0000004-0000-0000-0000-000000000004',
   'Randonnée VTT', 'Sortie VTT ouverte à tous les niveaux. Parcours de 35 km. Pique-nique tiré du sac.',
   '2026-07-26 08:30:00+02', '2026-07-26 16:00:00+02', 'Départ parking CIS Laval', 30, 0, 0, 'sport');


-- 4.6 Inscriptions événements
INSERT INTO event_registrations (event_id, member_id, status, nb_personnes, is_benevole) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000001', 'inscrit', 2, NULL),
  ('e0000001-0000-0000-0000-000000000001', 'm0000002-0000-0000-0000-000000000002', 'inscrit', 2, NULL),
  ('e0000001-0000-0000-0000-000000000001', 'm0000005-0000-0000-0000-000000000005', 'inscrit', 1, 'cuisine'),
  ('e0000001-0000-0000-0000-000000000001', 'm0000006-0000-0000-0000-000000000006', 'inscrit', 1, 'service'),
  ('e0000002-0000-0000-0000-000000000002', 'm0000005-0000-0000-0000-000000000005', 'inscrit', 1, NULL),
  ('e0000002-0000-0000-0000-000000000002', 'm0000007-0000-0000-0000-000000000007', 'inscrit', 1, NULL),
  ('e0000005-0000-0000-0000-000000000005', 'm0000001-0000-0000-0000-000000000001', 'inscrit', 1, NULL),
  ('e0000005-0000-0000-0000-000000000005', 'm0000007-0000-0000-0000-000000000007', 'inscrit', 1, NULL);


-- 4.7 Voyages
INSERT INTO trips (id, org_id, commission_id, destination, description, start_date, end_date, price_adult, price_child, max_seats, included, itinerary) VALUES
  ('t0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002',
   'Saint-Malo', 'Week-end découverte de la cité corsaire. Visite des remparts, de l''aquarium et balade en bateau.',
   '2026-09-05 07:00:00+02', '2026-09-07 20:00:00+02', 180, 90, 50,
   '["Transport en bus","Hôtel 2 nuits","Petit-déjeuner","Entrée aquarium"]'::jsonb,
   '[{"jour":1,"titre":"Arrivée & remparts","desc":"Départ 7h, arrivée 12h. Pique-nique puis visite des remparts."},{"jour":2,"titre":"Aquarium & plage","desc":"Visite de l''aquarium le matin, plage et temps libre l''après-midi."},{"jour":3,"titre":"Balade en mer & retour","desc":"Balade en bateau le matin, retour prévu vers 20h."}]'::jsonb),

  ('t0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002',
   'Strasbourg - Marché de Noël', 'Séjour au cœur des marchés de Noël de Strasbourg. Vin chaud et ambiance féérique.',
   '2026-12-19 06:00:00+01', '2026-12-21 22:00:00+01', 220, 110, 45,
   '["Transport en bus","Hôtel 2 nuits","Petit-déjeuner","Visite guidée"]'::jsonb,
   '[{"jour":1,"titre":"Arrivée & marché","desc":"Arrivée en fin de matinée, installation et premier marché."},{"jour":2,"titre":"Visite guidée","desc":"Visite guidée de la vieille ville et de la cathédrale, marchés de Noël."},{"jour":3,"titre":"Temps libre & retour","desc":"Matinée libre pour les derniers achats, retour l''après-midi."}]'::jsonb);


-- 4.8 Inscriptions voyages
INSERT INTO trip_registrations (trip_id, member_id, nb_adults, nb_children, total_amount, payment_status) VALUES
  ('t0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000001', 2, 1, 450, 'paye'),
  ('t0000001-0000-0000-0000-000000000001', 'm0000002-0000-0000-0000-000000000002', 1, 0, 180, 'paye'),
  ('t0000001-0000-0000-0000-000000000001', 'm0000006-0000-0000-0000-000000000006', 2, 2, 540, 'en_attente'),
  ('t0000002-0000-0000-0000-000000000002', 'm0000001-0000-0000-0000-000000000001', 2, 1, 550, 'en_attente');


-- 4.9 Biens locatifs
INSERT INTO assets (id, org_id, name, type, description, daily_rate, deposit, rules) VALUES
  ('a0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Appartement Sables d''Olonne', 'appartement', 'T3 en front de mer, 6 couchages. Vue mer depuis le balcon. Parking privé.',
   65, 300, 'Arrivée après 16h, départ avant 10h. Ménage à faire avant le départ. Animaux non admis. Caution restituée sous 15 jours.'),

  ('a0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Barnum 6x12m', 'barnum', 'Grande tente barnum 6x12 mètres avec parois amovibles. Idéal pour événements jusqu''à 80 personnes.',
   50, 200, 'Récupération au centre. Montage et démontage à votre charge. Nettoyage avant restitution.'),

  ('a0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Remorque frigorifique', 'remorque', 'Remorque réfrigérée 3m³. Permis B suffisant. Parfaite pour événements.',
   35, 150, 'Permis B obligatoire. Récupération au centre. Restitution propre et carburant plein.'),

  ('a0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'Emplacement camping Vendée', 'camping', 'Emplacement dans camping 4 étoiles en Vendée. Accès piscine et animations inclus.',
   25, 100, 'Réservation minimum 7 nuits en juillet-août. Arrivée samedi, départ samedi.');


-- 4.10 Réservations
INSERT INTO asset_bookings (asset_id, member_id, start_date, end_date, status, total_amount, deposit_paid, notes) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000001', '2026-08-01', '2026-08-08', 'confirmee', 455, 300, 'Vacances famille'),
  ('a0000001-0000-0000-0000-000000000001', 'm0000005-0000-0000-0000-000000000005', '2026-08-15', '2026-08-22', 'en_attente', 455, 0, 'Semaine 33'),
  ('a0000002-0000-0000-0000-000000000002', 'm0000006-0000-0000-0000-000000000006', '2026-07-19', '2026-07-20', 'confirmee', 100, 200, 'Anniversaire'),
  ('a0000004-0000-0000-0000-000000000004', 'm0000007-0000-0000-0000-000000000007', '2026-07-25', '2026-08-01', 'confirmee', 175, 100, 'Camping famille');


-- 4.11 Comptabilité
INSERT INTO accounting_entries (org_id, commission_id, type, label, amount, status, payment_mode) VALUES
  ('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'recette', 'Cotisations membres 2026', 2700, 'recette', 'virement'),
  ('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'facture', 'Location salle repas annuel', 800, 'valide', 'cheque'),
  ('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'facture', 'Traiteur repas annuel', 1500, 'attente', NULL),
  ('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'recette', 'Inscriptions voyage Saint-Malo', 1170, 'recette', 'virement'),
  ('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'facture', 'Réservation hôtel Saint-Malo', 2400, 'valide', 'virement'),
  ('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'facture', 'Location bus Saint-Malo', 950, 'attente', NULL),
  ('11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'recette', 'Location appartement été', 910, 'recette', 'virement'),
  ('11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'facture', 'Entretien appartement', 350, 'valide', 'cheque'),
  ('11111111-1111-1111-1111-111111111111', 'c0000007-0000-0000-0000-000000000007', 'facture', 'Acompte traiteur Ste-Barbe', 1200, 'valide', 'cheque'),
  ('11111111-1111-1111-1111-111111111111', 'c0000005-0000-0000-0000-000000000005', 'facture', 'Cadeaux enfants Noël', 450, 'attente', NULL),
  ('11111111-1111-1111-1111-111111111111', 'c0000004-0000-0000-0000-000000000004', 'recette', 'Subvention SDIS sport', 500, 'recette', 'virement');


-- 4.12 Notifications (journal de l'amicale)
INSERT INTO notifications (org_id, commission_id, target_member_id, title, message, read, sent_at) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, NULL, 'Bienvenue sur l''application !', 'L''amicale SP Laval lance sa nouvelle application. Retrouvez tous les événements, voyages et informations de votre amicale en un seul endroit.', false, now() - interval '7 days'),
  ('11111111-1111-1111-1111-111111111111', NULL, NULL, 'Inscriptions voyage Saint-Malo ouvertes', 'Les inscriptions pour le week-end à Saint-Malo (5-7 septembre) sont ouvertes ! Places limitées à 50 personnes, ne tardez pas.', false, now() - interval '3 days'),
  ('11111111-1111-1111-1111-111111111111', NULL, NULL, 'Tournoi de foot le 16 août', 'Le tournoi inter-centres aura lieu le samedi 16 août au stade municipal. Inscrivez votre équipe de 6 joueurs dès maintenant.', false, now() - interval '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', NULL, 'Repas annuel : recherche bénévoles', 'Nous cherchons encore 4 bénévoles pour le service du repas annuel du 20 septembre. Contactez la commission événements.', false, now()),
  ('11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'm0000001-0000-0000-0000-000000000001', 'Votre réservation est confirmée', 'Votre réservation de l''appartement aux Sables d''Olonne du 1er au 8 août est confirmée. Bon séjour !', false, now() - interval '5 days');


-- 4.13 Messages
INSERT INTO messages (org_id, from_id, to_id, subject, body, read_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'm0000002-0000-0000-0000-000000000002', 'm0000001-0000-0000-0000-000000000001', 'Budget Sainte-Barbe', 'Salut Nicolas, j''ai finalisé le budget prévisionnel pour la Sainte-Barbe. On est à 3 800€ avec le traiteur et la déco. Tu valides ?', NULL),
  ('11111111-1111-1111-1111-111111111111', 'm0000003-0000-0000-0000-000000000003', 'm0000001-0000-0000-0000-000000000001', 'Clés appartement', 'Bonjour, les clés de l''appartement des Sables sont disponibles au foyer. Tu peux passer les récupérer quand tu veux.', NULL),
  ('11111111-1111-1111-1111-111111111111', 'm0000001-0000-0000-0000-000000000001', 'm0000002-0000-0000-0000-000000000002', 'RE: Budget Sainte-Barbe', 'C''est bon Sophie, le budget est validé. Tu peux lancer les commandes. Merci !', now()),
  ('11111111-1111-1111-1111-111111111111', 'm0000005-0000-0000-0000-000000000005', 'm0000001-0000-0000-0000-000000000001', 'Inscription tournoi foot', 'Salut ! Je suis dispo pour le tournoi de foot. On peut compter sur Antoine aussi. Il nous manque 4 joueurs, tu sais qui est motivé ?', NULL);


-- 4.14 Documents
INSERT INTO documents (org_id, commission_id, title, content, created_by) VALUES
  ('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'PV Réunion bureau juin 2026', 'Compte-rendu de la réunion du bureau du 15 juin 2026. Points abordés : budget Sainte-Barbe, organisation repas annuel, point locations été.', 'm0000003-0000-0000-0000-000000000003'),
  ('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'Programme voyage Saint-Malo', 'Programme détaillé du week-end à Saint-Malo. Jour 1 : remparts. Jour 2 : aquarium. Jour 3 : balade en mer.', 'm0000002-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111111', 'c0000007-0000-0000-0000-000000000007', 'Devis traiteur Sainte-Barbe', 'Devis reçu du traiteur Le Gourmand : 35€/pers, menu 4 services, boissons incluses.', 'm0000002-0000-0000-0000-000000000002');
