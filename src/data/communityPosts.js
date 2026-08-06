/**
 * Community mock data source.
 *
 * Keep page components free of duplicated sample data. When Supabase is
 * connected, replace the selector implementations in this file (or move them
 * to a repository/service module) while preserving the returned data shape.
 */

export const currentCommunityUser = {
  id: "user-1",
  name: "홍길동",
  email: "user@example.com",
  role: "정회원",
  joinDate: "2026.01.15",
  avatarUrl: "https://via.placeholder.com/80",
  level: 5,
};

export const communityPosts = [
  {
    id: 1,
    isNotice: true,
    board: "공지",
    title: "플랫폼 규칙 안내: 필독",
    description: "건강한 커뮤니티 이용을 위한 기본 규칙입니다.",
    content: "<p>건강한 커뮤니티 이용을 위한 기본 규칙을 확인해 주세요.</p>",
    authorId: "admin-1",
    author: "관리자",
    authorRole: "관리자",
    authorAvatarUrl: "https://via.placeholder.com/40",
    createdAt: "2026.07.28",
    views: 1200,
    likes: 6000,
    commentsCount: 0,
    tags: ["공지", "커뮤니티"],
    likedByCurrentUser: false,
  },
  {
    id: 2,
    isNotice: true,
    board: "공지",
    title: "시스템 코어 업데이트 V2.0 사전 안내",
    description: "업데이트 일정과 주요 변경 내용을 안내합니다.",
    content: "<p>업데이트 일정과 주요 변경 내용을 안내합니다.</p>",
    authorId: "admin-1",
    author: "관리자",
    authorRole: "관리자",
    authorAvatarUrl: "https://via.placeholder.com/40",
    createdAt: "2026.07.27",
    views: 7000,
    likes: 3000,
    commentsCount: 0,
    tags: ["공지", "업데이트"],
    likedByCurrentUser: false,
  },
  {
    id: 3,
    board: "랜덤",
    title: "소제목1",
    description: "랜덤 대화 주제와 활용 방법을 공유합니다.",
    content:
      "<p>랜덤 대화 주제와 활용 방법을 공유합니다.</p><p>다양한 사용자 의견을 댓글로 나눠 보세요.</p>",
    authorId: "user-1",
    author: "홍길동",
    authorRole: "정회원",
    authorAvatarUrl: "https://via.placeholder.com/40",
    createdAt: "2026.07.26",
    views: 4000,
    likes: 2000,
    commentsCount: 2,
    tags: ["랜덤", "커뮤니티"],
    likedByCurrentUser: true,
  },
  {
    id: 4,
    board: "카드",
    title: "소제목2",
    description: "카드 콘텐츠를 활용한 모임 진행 팁입니다.",
    content:
      "<p>카드 콘텐츠를 활용해 자연스럽게 모임을 진행하는 방법을 소개합니다.</p>",
    authorId: "user-2",
    author: "닉네임",
    authorRole: "정회원",
    authorAvatarUrl: "https://via.placeholder.com/40",
    createdAt: "2026.07.26",
    views: 2000,
    likes: 1000,
    commentsCount: 1,
    tags: ["카드", "모임"],
    likedByCurrentUser: false,
  },
  {
    id: 5,
    board: "퀴즈",
    title: "소제목3",
    description: "함께 즐기기 좋은 퀴즈 콘텐츠입니다.",
    content: "<p>함께 즐기기 좋은 퀴즈 콘텐츠를 정리했습니다.</p>",
    authorId: "user-3",
    author: "닉네임",
    authorRole: "정회원",
    authorAvatarUrl: "https://via.placeholder.com/40",
    createdAt: "2026.07.25",
    views: 1000,
    likes: 500,
    commentsCount: 0,
    tags: ["퀴즈", "대화"],
    likedByCurrentUser: true,
  },
  {
    id: 6,
    board: "자유게시판",
    title: "랜덤 질문으로 분위기를 빠르게 여는 방법",
    description: "처음 만난 자리에서 활용하기 좋은 질문을 소개합니다.",
    content: "<p>처음 만난 자리에서 활용하기 좋은 질문을 소개합니다.</p>",
    authorId: "user-1",
    author: "홍길동",
    authorRole: "정회원",
    authorAvatarUrl: "https://via.placeholder.com/40",
    createdAt: "2026.07.24",
    views: 3100,
    likes: 128,
    commentsCount: 2,
    tags: ["자유게시판", "대화주제"],
    likedByCurrentUser: false,
  },
  {
    id: 7,
    board: "정보공유",
    title: "카드 게임을 활용한 모임 진행 팁",
    description: "카드 게임으로 자연스럽게 대화를 이어 가는 방법입니다.",
    content: "<p>카드 게임으로 자연스럽게 대화를 이어 가는 방법입니다.</p>",
    authorId: "user-2",
    author: "Name",
    authorRole: "정회원",
    authorAvatarUrl: "https://via.placeholder.com/40",
    createdAt: "2026.07.23",
    views: 1800,
    likes: 96,
    commentsCount: 1,
    tags: ["정보공유", "카드"],
    likedByCurrentUser: false,
  },
  {
    id: 8,
    board: "자유게시판",
    title: "퀴즈로 자연스럽게 대화를 시작해 보세요",
    description: "부담 없이 참여할 수 있는 가벼운 퀴즈를 모았습니다.",
    content: "<p>부담 없이 참여할 수 있는 가벼운 퀴즈를 모았습니다.</p>",
    authorId: "user-3",
    author: "Name",
    authorRole: "정회원",
    authorAvatarUrl: "https://via.placeholder.com/40",
    createdAt: "2026.07.22",
    views: 900,
    likes: 72,
    commentsCount: 0,
    tags: ["자유게시판", "퀴즈"],
    likedByCurrentUser: false,
  },
];

export const communityComments = [
  {
    id: 1,
    postId: 3,
    authorId: "user-2",
    author: "이영희",
    avatarUrl: "https://via.placeholder.com/36",
    content: "유익한 정보 감사합니다! 활용 방법이 정말 좋네요.",
    createdAt: "10분 전",
  },
  {
    id: 2,
    postId: 3,
    authorId: "user-3",
    author: "박민수",
    avatarUrl: "https://via.placeholder.com/36",
    content: "비슷한 주제로도 한 번 활용해 보고 싶습니다.",
    createdAt: "30분 전",
  },
  {
    id: 3,
    postId: 6,
    authorId: "user-1",
    author: "홍길동",
    avatarUrl: "https://via.placeholder.com/36",
    content: "다음 모임에서도 활용해 보겠습니다.",
    createdAt: "1시간 전",
  },
];

export const savedCommunityContents = [
  {
    id: 1,
    type: "AI",
    badge: "✨ AI 생성",
    title: "여름 휴가철 커뮤니티 에티켓 안내",
    content:
      "안녕하세요! 즐거운 여름 휴가철을 맞아 서로를 배려하는 커뮤니티 에티켓을 공유합니다...",
    tags: ["휴가", "에티켓", "공지"],
  },
  {
    id: 2,
    type: "AI",
    badge: "✨ AI 생성",
    title: "주간 개발 및 소통 초안",
    content:
      "이번 주 업데이트된 주요 기능과 커뮤니티 피드백 반영 사항을 정리해 드립니다...",
    tags: ["업데이트", "개발일지"],
  },
  {
    id: 3,
    type: "ADMIN",
    badge: "📌 운영진 기본",
    title: "자유게시판 기본 작성 템플릿",
    content:
      "1. 오늘 공유하고 싶은 내용:\n2. 추천하는 이유:\n3. 함께 나누고 싶은 질문:",
    tags: ["템플릿", "자유게시판"],
  },
  {
    id: 4,
    type: "ADMIN",
    badge: "📌 운영진 기본",
    title: "Q&A 질문 양식 템플릿",
    content: "[질문 유형]: \n[현재 상황]: \n[원하는 해결 방향]: ",
    tags: ["템플릿", "Q&A"],
  },
];

export const communityBoards = ["자유게시판", "Q&A", "정보공유"];

export const compareCommunityPostCreatedAtDesc = (a, b) => {
  const toTimestamp = value => {
    const normalized = String(value ?? "").replaceAll(".", "-");
    const timestamp = Date.parse(normalized);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  return toTimestamp(b?.createdAt) - toTimestamp(a?.createdAt);
};

export const getCommunityPostById = id =>
  communityPosts.find(post => String(post.id) === String(id));

export const getRankablePosts = () =>
  communityPosts.filter(post => !post.isNotice);

export const getLatestCommunityPosts = (limit = 3) =>
  [...getRankablePosts()].sort((a, b) => b.id - a.id).slice(0, limit);

export const getPopularCommunityPosts = (limit = 3) =>
  [...getRankablePosts()].sort((a, b) => b.likes - a.likes).slice(0, limit);

export const getCommentsByPostId = postId =>
  communityComments.filter(
    comment => String(comment.postId) === String(postId),
  );

export const getPostsByAuthorId = authorId =>
  communityPosts.filter(post => post.authorId === authorId && !post.isNotice);

export const getLikedPostsByCurrentUser = () =>
  communityPosts.filter(post => post.likedByCurrentUser && !post.isNotice);

export const getCommentsByAuthorId = authorId =>
  communityComments.filter(comment => comment.authorId === authorId);

export const getCurrentUserProfile = () => {
  const posts = getPostsByAuthorId(currentCommunityUser.id);
  const comments = getCommentsByAuthorId(currentCommunityUser.id);
  const receivedLikes = posts.reduce((sum, post) => sum + post.likes, 0);

  return {
    ...currentCommunityUser,
    postsCount: posts.length,
    commentsCount: comments.length,
    likesCount: receivedLikes,
  };
};
