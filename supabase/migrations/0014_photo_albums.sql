-- 0014: Photo albums for gallery management

CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  event_id UUID REFERENCES events(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  cover_url TEXT,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photo_albums_org ON photo_albums(org_id);
CREATE INDEX idx_album_photos_album ON album_photos(album_id);

ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view albums in their org"
  ON photo_albums FOR SELECT
  USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Bureau can manage albums"
  ON photo_albums FOR ALL
  USING (org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND is_bureau = true));

CREATE POLICY "Members can view photos"
  ON album_photos FOR SELECT
  USING (album_id IN (SELECT id FROM photo_albums WHERE org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid())));

CREATE POLICY "Bureau can manage photos"
  ON album_photos FOR ALL
  USING (album_id IN (SELECT id FROM photo_albums WHERE org_id IN (SELECT org_id FROM members WHERE user_id = auth.uid() AND is_bureau = true)));
