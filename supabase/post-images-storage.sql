-- Quill 게시글 본문 이미지 업로드용 Supabase Storage 설정
-- Supabase Dashboard > SQL Editor에서 한 번 실행하세요.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "post images insert own folder" on storage.objects;
create policy "post images insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "post images delete own folder" on storage.objects;
create policy "post images delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
