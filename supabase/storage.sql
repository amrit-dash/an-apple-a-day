-- Create the signatures bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the signatures bucket
CREATE POLICY "Authenticated users can upload signatures" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'signatures' AND auth.role() = 'authenticated'
    );

-- Allow public access to read signatures
CREATE POLICY "Anyone can view signatures" ON storage.objects
    FOR SELECT USING (bucket_id = 'signatures');

-- Allow users to update their own signatures
CREATE POLICY "Users can update their own signatures" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'signatures' AND auth.uid() = owner
    );

-- Allow users to delete their own signatures
CREATE POLICY "Users can delete their own signatures" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'signatures' AND auth.uid() = owner
    );
