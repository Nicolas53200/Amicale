-- 0028: Solidarity case workflow
-- Three tables: solidarity_cases, solidarity_case_messages, solidarity_audit_log.
-- Access restricted to commission members, bureau, and admins.

-- Main cases table
CREATE TABLE IF NOT EXISTS solidarity_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  case_number VARCHAR(30) NOT NULL UNIQUE,
  beneficiary VARCHAR(255),
  case_type VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'ouvert'
    CHECK (status IN ('ouvert', 'en_etude', 'complements_demandes', 'valide', 'refuse', 'cloture')),
  amount_requested NUMERIC(10,2),
  amount_granted NUMERIC(10,2),
  referent_id UUID REFERENCES members(id) ON DELETE SET NULL,
  confidential BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case discussion messages
CREATE TABLE IF NOT EXISTS solidarity_case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES solidarity_cases(id) ON DELETE CASCADE,
  author_id UUID REFERENCES members(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log for status changes and edits
CREATE TABLE IF NOT EXISTS solidarity_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES solidarity_cases(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_state JSONB,
  new_state JSONB,
  performed_by UUID REFERENCES members(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger for solidarity_cases
DO $$ BEGIN
  CREATE TRIGGER trg_solidarity_cases_updated_at
    BEFORE UPDATE ON solidarity_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable RLS on all three tables
ALTER TABLE solidarity_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE solidarity_case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE solidarity_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper expression used in policies: user is a commission member, bureau, or admin
-- for the solidarity case's org.

-- solidarity_cases policies
DO $$ BEGIN
  CREATE POLICY "solidarity_cases_select" ON solidarity_cases
    FOR SELECT
    USING (
      org_id = public.org_id()
      AND (
        -- Bureau / admin can always see
        EXISTS (
          SELECT 1 FROM members
          WHERE members.user_id = auth.uid()
            AND members.org_id = solidarity_cases.org_id
            AND members.role IN ('bureau', 'admin')
        )
        OR
        -- Commission members can see
        EXISTS (
          SELECT 1 FROM commission_members cm
          JOIN members m ON m.id = cm.member_id
          WHERE cm.commission_id = solidarity_cases.commission_id
            AND m.user_id = auth.uid()
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_cases_insert" ON solidarity_cases
    FOR INSERT
    WITH CHECK (
      org_id = public.org_id()
      AND (
        EXISTS (
          SELECT 1 FROM members
          WHERE members.user_id = auth.uid()
            AND members.org_id = solidarity_cases.org_id
            AND members.role IN ('bureau', 'admin')
        )
        OR
        EXISTS (
          SELECT 1 FROM commission_members cm
          JOIN members m ON m.id = cm.member_id
          WHERE cm.commission_id = solidarity_cases.commission_id
            AND m.user_id = auth.uid()
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_cases_update" ON solidarity_cases
    FOR UPDATE
    USING (
      org_id = public.org_id()
      AND (
        EXISTS (
          SELECT 1 FROM members
          WHERE members.user_id = auth.uid()
            AND members.org_id = solidarity_cases.org_id
            AND members.role IN ('bureau', 'admin')
        )
        OR
        EXISTS (
          SELECT 1 FROM commission_members cm
          JOIN members m ON m.id = cm.member_id
          WHERE cm.commission_id = solidarity_cases.commission_id
            AND m.user_id = auth.uid()
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_cases_delete" ON solidarity_cases
    FOR DELETE
    USING (
      org_id = public.org_id()
      AND EXISTS (
        SELECT 1 FROM members
        WHERE members.user_id = auth.uid()
          AND members.org_id = solidarity_cases.org_id
          AND members.role IN ('bureau', 'admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- solidarity_case_messages policies (join through case -> solidarity_cases)
DO $$ BEGIN
  CREATE POLICY "solidarity_case_messages_select" ON solidarity_case_messages
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM solidarity_cases sc
        WHERE sc.id = solidarity_case_messages.case_id
          AND sc.org_id = public.org_id()
          AND (
            EXISTS (
              SELECT 1 FROM members
              WHERE members.user_id = auth.uid()
                AND members.org_id = sc.org_id
                AND members.role IN ('bureau', 'admin')
            )
            OR
            EXISTS (
              SELECT 1 FROM commission_members cm
              JOIN members m ON m.id = cm.member_id
              WHERE cm.commission_id = sc.commission_id
                AND m.user_id = auth.uid()
            )
          )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_case_messages_insert" ON solidarity_case_messages
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM solidarity_cases sc
        WHERE sc.id = solidarity_case_messages.case_id
          AND sc.org_id = public.org_id()
          AND (
            EXISTS (
              SELECT 1 FROM members
              WHERE members.user_id = auth.uid()
                AND members.org_id = sc.org_id
                AND members.role IN ('bureau', 'admin')
            )
            OR
            EXISTS (
              SELECT 1 FROM commission_members cm
              JOIN members m ON m.id = cm.member_id
              WHERE cm.commission_id = sc.commission_id
                AND m.user_id = auth.uid()
            )
          )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_case_messages_delete" ON solidarity_case_messages
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM solidarity_cases sc
        WHERE sc.id = solidarity_case_messages.case_id
          AND sc.org_id = public.org_id()
          AND EXISTS (
            SELECT 1 FROM members
            WHERE members.user_id = auth.uid()
              AND members.org_id = sc.org_id
              AND members.role IN ('bureau', 'admin')
          )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- solidarity_audit_log policies (join through case -> solidarity_cases)
DO $$ BEGIN
  CREATE POLICY "solidarity_audit_log_select" ON solidarity_audit_log
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM solidarity_cases sc
        WHERE sc.id = solidarity_audit_log.case_id
          AND sc.org_id = public.org_id()
          AND (
            EXISTS (
              SELECT 1 FROM members
              WHERE members.user_id = auth.uid()
                AND members.org_id = sc.org_id
                AND members.role IN ('bureau', 'admin')
            )
            OR
            EXISTS (
              SELECT 1 FROM commission_members cm
              JOIN members m ON m.id = cm.member_id
              WHERE cm.commission_id = sc.commission_id
                AND m.user_id = auth.uid()
            )
          )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_audit_log_insert" ON solidarity_audit_log
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM solidarity_cases sc
        WHERE sc.id = solidarity_audit_log.case_id
          AND sc.org_id = public.org_id()
          AND (
            EXISTS (
              SELECT 1 FROM members
              WHERE members.user_id = auth.uid()
                AND members.org_id = sc.org_id
                AND members.role IN ('bureau', 'admin')
            )
            OR
            EXISTS (
              SELECT 1 FROM commission_members cm
              JOIN members m ON m.id = cm.member_id
              WHERE cm.commission_id = sc.commission_id
                AND m.user_id = auth.uid()
            )
          )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS solidarity_cases_org_id_idx
  ON solidarity_cases(org_id);

CREATE INDEX IF NOT EXISTS solidarity_cases_commission_id_idx
  ON solidarity_cases(commission_id);

CREATE INDEX IF NOT EXISTS solidarity_cases_status_idx
  ON solidarity_cases(status);

CREATE INDEX IF NOT EXISTS solidarity_cases_referent_id_idx
  ON solidarity_cases(referent_id);

CREATE INDEX IF NOT EXISTS solidarity_case_messages_case_id_idx
  ON solidarity_case_messages(case_id);

CREATE INDEX IF NOT EXISTS solidarity_audit_log_case_id_idx
  ON solidarity_audit_log(case_id);
