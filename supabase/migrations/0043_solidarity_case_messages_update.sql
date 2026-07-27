-- Migration 0043: Add missing UPDATE policy for solidarity_case_messages
-- Allows editing of case discussion messages by org members.

CREATE POLICY "solidarity_case_messages_update" ON solidarity_case_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM solidarity_cases sc
      JOIN commissions c ON c.id = sc.commission_id
      WHERE sc.id = solidarity_case_messages.case_id
        AND c.org_id = public.org_id()
    )
  );
