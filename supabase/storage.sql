-- Create a new public bucket for signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public access to all signatures (for viewing)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'signatures' );

-- Policy: Allow authenticated users to upload their own signatures
CREATE POLICY "Authenticated users can upload signatures"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'signatures' AND
    auth.role() = 'authenticated'
  );

-- Policy: Allow users to update their own signatures
CREATE POLICY "Users can update their own signatures"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'signatures' AND
    auth.role() = 'authenticated'
  );

-- Policy: Allow users to delete their own signatures
CREATE POLICY "Users can delete their own signatures"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'signatures' AND
    auth.role() = 'authenticated'
  );
