-- =============================================================================
-- Momentalk - Supabase 스키마 스냅샷
--
-- 작성일: 2026-08-09
-- 최종 수정: 2026-08-10 (posts.is_ai_generated 추가)
--
-- 이 파일은 "현재 DB가 이렇게 생겼다"를 기록한 문서입니다.
-- 실행용 마이그레이션이 아니므로 그대로 돌리면 순서·의존성 문제로 실패합니다.
-- 테이블 대부분을 Supabase 대시보드에서 만들어 변경 이력이 남지 않아,
-- 사후에 스키마를 덤프해 정리했습니다.
--
-- 스키마를 변경하면 이 파일도 같이 갱신해 주세요.
-- =============================================================================


-- =============================================================================
-- 1. 테이블
-- =============================================================================

-- 사용자 프로필. auth.users 와 1:1이며 회원가입 시 트리거로 자동 생성됩니다.
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  nickname text NOT NULL UNIQUE,
  avatar_url text,
  role text NOT NULL DEFAULT 'user'::text,          -- 'user' | 'admin'
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 대화 생성 조건 선택지. category 별로 묶어서 씁니다.
-- category: situation | relation | target | mood | format
CREATE TABLE public.options (
  id smallint NOT NULL DEFAULT nextval('options_id_seq'::regclass),
  category text NOT NULL,
  code text NOT NULL,
  label text NOT NULL,
  emoji text,
  sort_order smallint DEFAULT 0,
  is_active boolean DEFAULT true,
  CONSTRAINT options_pkey PRIMARY KEY (id),
  CONSTRAINT options_category_code_key UNIQUE (category, code)
);

-- 미리 정의된 대화 생성 템플릿 (메인 화면 카드)
CREATE TABLE public.presets (
  id smallint NOT NULL DEFAULT nextval('presets_id_seq'::regclass),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  image_url text,
  conditions jsonb DEFAULT '{}'::jsonb,
  sort_order smallint DEFAULT 0,
  is_active boolean DEFAULT true,
  CONSTRAINT presets_pkey PRIMARY KEY (id)
);

-- 게시글 태그
CREATE TABLE public.tags (
  id integer NOT NULL DEFAULT nextval('tags_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  color text,
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);

-- AI 대화 생성 이력. /api/generate 가 로그인 사용자에 한해 기록합니다.
CREATE TABLE public.generations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preset_id smallint,
  format_code text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,     -- { situation, mood, relation, target }
  custom_input text,                                 -- 자유 입력 상황 텍스트
  status text NOT NULL DEFAULT 'pending'::text,      -- pending | running | succeeded | failed
  source text NOT NULL DEFAULT 'ai'::text,
  model text,                                        -- 'alan'
  error_code text,
  latency_ms integer,                                -- 앨런 응답 소요 시간
  retry_of uuid,                                     -- 재생성 시 이전 생성 참조
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT generations_pkey PRIMARY KEY (id),
  CONSTRAINT generations_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT generations_preset_id_fkey FOREIGN KEY (preset_id)
    REFERENCES public.presets(id),
  CONSTRAINT generations_retry_of_fkey FOREIGN KEY (retry_of)
    REFERENCES public.generations(id)
);

-- 생성 결과 카드. 한 생성당 최대 3장입니다.
CREATE TABLE public.generation_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL,
  position smallint NOT NULL,
  title text NOT NULL,
  body text,
  tips text[] NOT NULL DEFAULT '{}'::text[],
  extras jsonb DEFAULT '{}'::jsonb,                  -- 밸런스 게임 A/B 등 형식별 추가 데이터
  scripts text[] NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT generation_items_pkey PRIMARY KEY (id),
  CONSTRAINT generation_items_generation_id_fkey FOREIGN KEY (generation_id)
    REFERENCES public.generations(id) ON DELETE CASCADE,
  CONSTRAINT generation_items_generation_id_position_key UNIQUE (generation_id, position),
  CONSTRAINT generation_items_position_check CHECK (position >= 1 AND position <= 3)
);

-- 사용자 보관함. 생성 결과 중 마음에 든 것을 담습니다.
CREATE TABLE public.saved_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  generation_item_id uuid,                           -- null 이면 직접 만든 콘텐츠
  format_code text NOT NULL,
  conditions jsonb DEFAULT '{}'::jsonb,
  title text NOT NULL,
  body text,
  tips text[] NOT NULL DEFAULT '{}'::text[],
  extras jsonb DEFAULT '{}'::jsonb,
  memo text,
  created_at timestamp with time zone DEFAULT now(),
  scripts text[] NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT saved_contents_pkey PRIMARY KEY (id),
  CONSTRAINT saved_contents_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT saved_contents_generation_item_id_fkey FOREIGN KEY (generation_item_id)
    REFERENCES public.generation_items(id) ON DELETE SET NULL,
  -- 같은 항목을 두 번 저장하지 못하게 막습니다.
  CONSTRAINT saved_contents_user_id_generation_item_id_key
    UNIQUE (user_id, generation_item_id)
);

-- AI 없이 제공하는 기본 콘텐츠. 게임(카드 뒤집기, 랜덤 픽)에서 사용합니다.
-- *_codes 배열로 조건 필터링이 가능해 AI 실패 시 폴백으로도 쓸 수 있습니다.
CREATE TABLE public.default_contents (
  id integer NOT NULL DEFAULT nextval('default_contents_id_seq'::regclass),
  format_code text NOT NULL,
  title text NOT NULL,
  body text,
  tips text[] NOT NULL DEFAULT '{}'::text[],
  extras jsonb DEFAULT '{}'::jsonb,
  target_codes text[] DEFAULT '{}'::text[],
  relation_codes text[] DEFAULT '{}'::text[],
  situation_codes text[] DEFAULT '{}'::text[],
  mood_codes text[] DEFAULT '{}'::text[],
  weight smallint DEFAULT 0,                         -- 노출 가중치
  is_active boolean DEFAULT true,
  source_id text,
  preset_code text,
  level smallint,
  topic_tag text,
  scripts text[] NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT default_contents_pkey PRIMARY KEY (id)
);

-- 커뮤니티 게시판. 자유게시판 / 공지사항 / Q&A / 정보공유 4개.
CREATE TABLE public.boards (
  id smallint NOT NULL DEFAULT nextval('boards_id_seq'::regclass),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_notice boolean DEFAULT false,
  write_role text NOT NULL DEFAULT 'user'::text,
  sort_order smallint DEFAULT 0,
  CONSTRAINT boards_pkey PRIMARY KEY (id)
);

-- 커뮤니티 게시글.
-- view_count / like_count / comment_count 는 트리거가 관리하므로 직접 update 하지 마세요.
CREATE TABLE public.posts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  board_id smallint NOT NULL,
  author_id uuid NOT NULL,
  title text NOT NULL,
  content_html text NOT NULL,                        -- Quill 에디터 HTML
  content_text text NOT NULL DEFAULT ''::text,       -- 태그 제거한 순수 텍스트
  saved_content_id uuid,                             -- 보관함 콘텐츠 첨부
  shared_content jsonb,                              -- 첨부한 보관함 콘텐츠 스냅샷
  status text NOT NULL DEFAULT 'published'::text,
  is_pinned boolean DEFAULT false,
  allow_comments boolean DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text,                                  -- 목록용 추가 설명
  is_ai_generated boolean NOT NULL DEFAULT false,    -- AI 로 초안을 생성한 글 (상세에 뱃지 표시)
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_board_id_fkey FOREIGN KEY (board_id)
    REFERENCES public.boards(id),
  CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT posts_saved_content_id_fkey FOREIGN KEY (saved_content_id)
    REFERENCES public.saved_contents(id) ON DELETE SET NULL
);

CREATE TABLE public.post_tags (
  post_id bigint NOT NULL,
  tag_id integer NOT NULL,
  CONSTRAINT post_tags_pkey PRIMARY KEY (post_id, tag_id),
  CONSTRAINT post_tags_post_id_fkey FOREIGN KEY (post_id)
    REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT post_tags_tag_id_fkey FOREIGN KEY (tag_id)
    REFERENCES public.tags(id) ON DELETE CASCADE
);

-- 댓글. deleted_at 으로 soft delete 하므로 대댓글 트리가 깨지지 않습니다.
CREATE TABLE public.comments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  post_id bigint NOT NULL,
  author_id uuid NOT NULL,
  parent_id bigint,
  content text NOT NULL,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id)
    REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id)
    REFERENCES public.comments(id) ON DELETE CASCADE
);

CREATE TABLE public.post_likes (
  post_id bigint NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (post_id, user_id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id)
    REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 조회 기록. 복합 PK 덕분에 같은 사람이 같은 날 여러 번 봐도 1회로 집계됩니다.
-- viewer_key: 로그인 시 user id, 비로그인 시 localStorage 에 보관한 임의 키
CREATE TABLE public.post_views (
  post_id bigint NOT NULL,
  viewer_key text NOT NULL,
  viewed_on date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT post_views_pkey PRIMARY KEY (post_id, viewer_key, viewed_on),
  CONSTRAINT post_views_post_id_fkey FOREIGN KEY (post_id)
    REFERENCES public.posts(id) ON DELETE CASCADE
);


-- =============================================================================
-- 2. 함수
-- =============================================================================

-- 회원가입 시 profiles 행을 자동 생성합니다.
-- 닉네임이 없으면 '모멘톡' + uuid 앞 6자리로 만들고, 중복이면 랜덤 4자를 덧붙입니다.
-- auth.users 에 AFTER INSERT 트리거로 연결돼 있습니다.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  base_nick  text := coalesce(nullif(trim(new.raw_user_meta_data->>'nickname'), ''),
                              '모멘톡' || substr(new.id::text, 1, 6));
  final_nick text := base_nick;
begin
  while exists (select 1 from profiles where nickname = final_nick) loop
    final_nick := base_nick || substr(md5(random()::text), 1, 4);
  end loop;
  insert into profiles (id, nickname) values (new.id, final_nick);
  return new;
end $function$;

-- 좋아요·댓글 개수를 posts 에 반영합니다.
-- post_likes / comments 의 INSERT, DELETE 트리거로 연결돼 있습니다.
CREATE OR REPLACE FUNCTION public.bump_counter()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  delta  int    := case when tg_op = 'INSERT' then 1 else -1 end;
  target bigint := case when tg_op = 'INSERT' then new.post_id else old.post_id end;
begin
  if tg_table_name = 'post_likes' then
    update posts set like_count = like_count + delta where id = target;
  else
    update posts set comment_count = comment_count + delta where id = target;
  end if;
  return null;
end $function$;

-- 조회수 증가. 같은 (글, 사용자, 날짜) 조합은 한 번만 집계됩니다.
-- post_views 에 RLS 정책이 없어도 SECURITY DEFINER 로 동작합니다.
CREATE OR REPLACE FUNCTION public.increment_post_view(p_post_id bigint, p_viewer_key text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into post_views (post_id, viewer_key) values (p_post_id, p_viewer_key)
  on conflict do nothing;

  if found then
    update posts set view_count = view_count + 1 where id = p_post_id;
  end if;
end $function$;

-- 좋아요 토글. 이미 눌렀으면 취소하고 false, 아니면 추가하고 true 를 반환합니다.
-- auth.uid() 를 그대로 써야 해서 SECURITY INVOKER 입니다.
-- like_count 는 건드리지 않고 bump_counter 트리거가 처리합니다.
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
begin
  delete from post_likes where post_id = p_post_id and user_id = auth.uid();
  if found then return false; end if;

  insert into post_likes (post_id, user_id) values (p_post_id, auth.uid());
  return true;
end $function$;

-- public 스키마에 테이블이 생기면 RLS 를 자동으로 켜는 이벤트 트리거입니다.
-- Supabase 가 프로젝트에 기본 제공합니다. 직접 만든 함수가 아닙니다.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public')
        AND cmd.schema_name NOT IN ('pg_catalog','information_schema')
        AND cmd.schema_name NOT LIKE 'pg_toast%'
        AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip %', cmd.object_identity;
     END IF;
  END LOOP;
END;
$function$;


-- =============================================================================
-- 3. RLS 정책
--
-- public 스키마 테이블은 전부 RLS 활성화 상태입니다.
-- =============================================================================

-- 읽기 전용 참조 테이블 --------------------------------------------------------

CREATE POLICY "누구나 읽기" ON public.boards
  FOR SELECT USING (true);

CREATE POLICY "누구나 읽기" ON public.options
  FOR SELECT USING (true);

CREATE POLICY "활성만 읽기" ON public.presets
  FOR SELECT USING (is_active);

CREATE POLICY "활성만 읽기" ON public.default_contents
  FOR SELECT USING (is_active);

-- 태그: 조회는 전체 공개, 생성은 회원만 --------------------------------------
-- 글 작성 시 없는 태그를 새로 만들기 때문에 INSERT 가 필요합니다.

CREATE POLICY "누구나 읽기" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "회원만 태그 생성" ON public.tags
  FOR INSERT TO authenticated WITH CHECK (true);

-- 프로필 --------------------------------------------------------------------

CREATE POLICY "누구나 읽기" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "본인만 수정" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 생성 이력 / 보관함: 본인 것만 -----------------------------------------------

CREATE POLICY "본인만" ON public.generations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인만" ON public.generation_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM generations g
      WHERE g.id = generation_items.generation_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "본인만" ON public.saved_contents
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 게시글: 조회는 공개(비회원 포함), 수정·삭제는 작성자만 ------------------------

CREATE POLICY "발행글 읽기" ON public.posts
  FOR SELECT USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "본인만 작성" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "본인만 수정" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "본인만 삭제" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- 게시글 태그: 글 작성자만 편집 -----------------------------------------------

CREATE POLICY "누구나 읽기" ON public.post_tags
  FOR SELECT USING (true);

CREATE POLICY "글 작성자만" ON public.post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_tags.post_id AND p.author_id = auth.uid()
    )
  );

-- 댓글 ----------------------------------------------------------------------
-- 작성 시 대상 글이 댓글을 허용하고 발행 상태인지까지 확인합니다.

CREATE POLICY "누구나 읽기" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "회원만 작성" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = comments.post_id
        AND p.allow_comments
        AND p.status = 'published'
    )
  );

CREATE POLICY "본인만 수정" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "본인만 삭제" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- 좋아요 --------------------------------------------------------------------

CREATE POLICY "누구나 읽기" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "본인만" ON public.post_likes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- post_views 는 정책이 없습니다.
-- increment_post_view 가 SECURITY DEFINER 라 RLS 를 우회하고,
-- 클라이언트가 직접 조회할 일이 없어 의도적으로 비워뒀습니다.


-- =============================================================================
-- 4. Storage
-- =============================================================================

-- 프로필 사진 버킷.
-- public: true, 용량 제한 2MB, 허용 MIME: image/jpeg, image/png, image/webp
-- 파일 경로는 {user_id}/avatar.{ext} 형태입니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 본인 폴더에만 업로드·수정·삭제할 수 있습니다.
-- public 버킷이라 이미지 조회는 CDN 이 처리하므로 SELECT 정책은 두지 않았습니다.
-- (전체 파일 목록이 노출되는 것을 막기 위함)
CREATE POLICY "아바타 본인 폴더만" ON storage.objects
  FOR ALL USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- =============================================================================
-- 5. 트리거 (참고)
--
-- 아래 트리거들이 연결돼 있습니다. 정확한 정의는 대시보드에서 확인하세요.
--
--   auth.users        AFTER INSERT           → handle_new_user()
--   public.post_likes AFTER INSERT / DELETE  → bump_counter()
--   public.comments   AFTER INSERT / DELETE  → bump_counter()
--   (event trigger)   DDL CREATE TABLE       → rls_auto_enable()
-- =============================================================================