-- Community delete consistency helpers
-- Supabase Dashboard > SQL Editor에서 실행하거나 migration으로 적용하세요.

-- 정책:
-- 1) 댓글 삭제는 선택 댓글 + 모든 하위 대댓글을 물리 삭제합니다.
-- 2) 게시글 삭제는 게시글에 종속된 댓글/좋아요/태그 연결/조회 기록을 먼저 삭제합니다.
-- 3) boards/profiles/tags/saved_contents 같은 공유 부모 데이터는 삭제하지 않습니다.
-- 4) posts.comment_count는 실제로 남아 있는(legacy soft-delete 제외) 댓글만 집계합니다.

create or replace function public.delete_comment_tree(p_comment_id text)
returns table(id_text text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if not exists (
    select 1
    from public.comments c
    where c.id::text = p_comment_id
      and c.author_id = auth.uid()
      and c.deleted_at is null
  ) then
    raise exception '삭제할 수 없는 댓글입니다.';
  end if;

  -- 한 SQL 문장에서 부모 + 모든 자식을 함께 물리 삭제합니다.
  -- self FK가 있어도 삭제 대상 전체가 같은 statement 안에 포함되므로 고아 레코드가 남지 않습니다.
  return query
  with recursive comment_tree as (
    select c.id
    from public.comments c
    where c.id::text = p_comment_id

    union all

    select child.id
    from public.comments child
    join comment_tree parent on child.parent_id = parent.id
  ), deleted as (
    delete from public.comments c
    using comment_tree t
    where c.id = t.id
    returning c.id::text as id_text
  )
  select d.id_text from deleted d;
end;
$$;

revoke all on function public.delete_comment_tree(text) from public;
grant execute on function public.delete_comment_tree(text) to authenticated;

create or replace function public.delete_post_cascade(p_post_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if not exists (
    select 1
    from public.posts p
    where p.id::text = p_post_id
      and p.author_id = auth.uid()
  ) then
    raise exception '삭제할 수 없는 게시글입니다.';
  end if;

  -- 게시글에 종속된 자식 레코드를 먼저 물리 삭제합니다.
  -- 댓글은 post_id 기준 전체 삭제하므로 부모/자식 댓글 모두 함께 사라집니다.
  delete from public.comments where post_id::text = p_post_id;
  delete from public.post_likes where post_id::text = p_post_id;
  delete from public.post_tags where post_id::text = p_post_id;
  delete from public.post_views where post_id::text = p_post_id;

  -- 영상/일반 링크는 별도 테이블이 아니라 posts.content_html 내부 마크업이므로
  -- posts 행 삭제와 함께 제거됩니다. 본문 Storage 이미지는 앱의 deletePost()에서 제거합니다.
  delete from public.posts where id::text = p_post_id;

  return true;
end;
$$;

revoke all on function public.delete_post_cascade(text) from public;
grant execute on function public.delete_post_cascade(text) to authenticated;

-- comments의 물리 삭제/legacy soft-delete 상태와 posts.comment_count를 항상 동기화합니다.
-- 집계 기준은 상세페이지와 동일하게 "삭제되지 않은 모든 댓글"이며, 최상위 댓글과 답글을 모두 포함합니다.
create or replace function public.sync_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_post_id text;
  old_post_id text;
begin
  if tg_op <> 'DELETE' then
    new_post_id := new.post_id::text;
  end if;

  if tg_op <> 'INSERT' then
    old_post_id := old.post_id::text;
  end if;

  if new_post_id is not null then
    update public.posts p
    set comment_count = (
      select count(*)::integer
      from public.comments c
      where c.post_id::text = new_post_id
        and c.deleted_at is null
    )
    where p.id::text = new_post_id;
  end if;

  if old_post_id is not null and old_post_id is distinct from new_post_id then
    update public.posts p
    set comment_count = (
      select count(*)::integer
      from public.comments c
      where c.post_id::text = old_post_id
        and c.deleted_at is null
    )
    where p.id::text = old_post_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_comment_count on public.comments;
drop trigger if exists comments_sync_post_comment_count on public.comments;
create trigger comments_sync_post_comment_count
after insert or delete or update of deleted_at, post_id
on public.comments
for each row execute function public.sync_post_comment_count();

-- 과거 soft-delete로 남아 있던 댓글과 그 하위 댓글을 한 번 정리합니다.
-- 삭제된 부모 아래 active 자식이 남아 있더라도 함께 제거하여 트리 고아를 없앱니다.
with recursive stale_tree as (
  select c.id
  from public.comments c
  where c.deleted_at is not null

  union

  select child.id
  from public.comments child
  join stale_tree parent on child.parent_id = parent.id
)
delete from public.comments c
using stale_tree s
where c.id = s.id;

-- 기존 데이터의 comment_count도 동일한 기준(최상위 댓글 + 답글, deleted_at is null)으로 재계산합니다.
update public.posts p
set comment_count = (
  select count(*)::integer
  from public.comments c
  where c.post_id = p.id
    and c.deleted_at is null
);
