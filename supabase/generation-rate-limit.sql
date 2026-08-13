-- 앨런 호출 레이트리밋
-- Supabase Dashboard > SQL Editor 에서 실행하세요.
--
-- 로그인 사용자만 제한합니다. 비로그인 생성은 generations 에 저장되지 않아
-- 집계할 근거가 없으므로 통과시킵니다.

-- 사용자별 최근 생성 이력을 빠르게 세기 위한 인덱스
create index if not exists generations_user_created_at_idx
  on public.generations (user_id, created_at desc);

create or replace function public.check_generation_rate_limit(
  p_per_minute integer default 5,
  p_per_day integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_count integer;
begin
  if v_user is null then
    return jsonb_build_object('allowed', true);
  end if;

  select count(*) into v_count
  from public.generations
  where user_id = v_user
    and created_at > now() - interval '1 minute';

  if v_count >= p_per_minute then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'per_minute',
      'retryAfterSeconds', 60,
      'message', '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.'
    );
  end if;

  select count(*) into v_count
  from public.generations
  where user_id = v_user
    and created_at > now() - interval '24 hours';

  if v_count >= p_per_day then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'per_day',
      'message', '하루 생성 한도를 모두 사용했습니다. 내일 다시 이용해 주세요.'
    );
  end if;

  return jsonb_build_object('allowed', true);
end;
$$;

revoke all on function public.check_generation_rate_limit(integer, integer) from public;
grant execute on function public.check_generation_rate_limit(integer, integer) to authenticated, anon;