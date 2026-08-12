-- 댓글/답글 좋아요 기능. Supabase SQL Editor에서 1회 적용하세요.
create table if not exists public.comment_likes (
  comment_id bigint not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

drop policy if exists "comment likes readable" on public.comment_likes;
create policy "comment likes readable" on public.comment_likes for select using (true);
drop policy if exists "users insert own comment likes" on public.comment_likes;
create policy "users insert own comment likes" on public.comment_likes for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own comment likes" on public.comment_likes;
create policy "users delete own comment likes" on public.comment_likes for delete using (auth.uid() = user_id);

-- 기존 comments RLS에서 아래 권한이 보장되어야 합니다.
-- UPDATE: auth.uid() = author_id (작성자만 수정)
-- DELETE: 댓글 작성자 또는 해당 게시글 작성자
-- 예시 DELETE policy (기존 정책/테이블 타입에 맞게 조정):
-- using (auth.uid() = author_id or exists (select 1 from public.posts p where p.id = comments.post_id and p.author_id = auth.uid()));
