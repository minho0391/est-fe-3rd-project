-- Quill 게시글 본문 이미지 업로드용 Supabase Storage 설정
-- 일반 사용자는 본인 폴더만 조회/삭제할 수 있고, 운영진 신고 처리 시에는 관리자에게
-- 타인 폴더의 이미지 조회/삭제를 허용합니다. 삭제 후 클라이언트에서 실제 잔존 여부를 검증합니다.
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

drop policy if exists "post images select own folder" on storage.objects;
create policy "post images select own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'post-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
);

drop policy if exists "post images delete own folder" on storage.objects;
create policy "post images delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
);
