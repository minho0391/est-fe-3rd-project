// [마이페이지] 페이지 (localhost:3000/post/mypage)
"use client";

import "@/community/common.css";
import "@/community/mypage.css";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AccountCircleIcon,
  BookmarkBorderIcon,
  ChatBubbleOutlineOutlined,
  ChevronLeftIcon,
  ChevronRightIcon,
  ContentCopyIcon,
  DeleteOutlined,
  FavoriteBorderIcon,
  ForumOutlinedIcon,
  HomeOutlinedIcon,
  LogoutIcon,
  ManageAccountsOutlinedIcon,
  RemoveRedEyeIcon,
  ShareOutlinedIcon,
} from "@/images/icons";
import {
  getCommentsByAuthorId,
  getCurrentUserProfile,
  getLikedPostsByCurrentUser,
  getPostsByAuthorId,
} from "@/lib/communityQueries";

const formatCount = value => {
  const number = Number(value ?? 0);

  if (number >= 1000) {
    const compact = number / 1000;
    return `${Number.isInteger(compact) ? compact : compact.toFixed(1)}K`;
  }

  return String(number);
};

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("myPosts");
  const [sortKey, setSortKey] = useState("all");
  const [userProfile, setUserProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMyPageData = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const me = await getCurrentUserProfile();

        if (!isMounted) return;

        if (!me) {
          setUserProfile(null);
          setMyPosts([]);
          setMyComments([]);
          setLikedPosts([]);
          setLoadError("로그인이 필요합니다.");
          return;
        }

        const [posts, comments, liked] = await Promise.all([
          getPostsByAuthorId(me.id),
          getCommentsByAuthorId(me.id),
          getLikedPostsByCurrentUser(),
        ]);

        if (!isMounted) return;

        setUserProfile(me);
        setMyPosts(posts);
        setMyComments(comments);
        setLikedPosts(liked);
      } catch (error) {
        console.error("마이페이지 데이터를 불러오지 못했습니다.", error);

        if (isMounted) {
          setLoadError("마이페이지 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMyPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalViews = myPosts.reduce(
    (sum, post) => sum + Number(post.views ?? 0),
    0,
  );
  const totalLikes = myPosts.reduce(
    (sum, post) => sum + Number(post.likes ?? 0),
    0,
  );

  const sortedMyPosts = useMemo(() => {
    const posts = [...myPosts];

    if (sortKey === "views") {
      return posts.sort((a, b) => Number(b.views ?? 0) - Number(a.views ?? 0));
    }

    if (sortKey === "likes") {
      return posts.sort((a, b) => Number(b.likes ?? 0) - Number(a.likes ?? 0));
    }

    if (sortKey === "comments") {
      return posts.sort(
        (a, b) => Number(b.commentsCount ?? 0) - Number(a.commentsCount ?? 0),
      );
    }

    return posts;
  }, [myPosts, sortKey]);

  const renderPostRows = posts => (
    <div className="mypage-postList">
      {posts.length > 0 ? (
        posts.map(post => (
          <article key={post.id} className="mypage-postItem">
            <div className="mypage-postTop">
              <div className="mypage-tagGroup">
                {(post.tags?.length ? post.tags : [post.board])
                  .slice(0, 2)
                  .map((tag, index) => (
                    <span
                      key={`${post.id}-${tag}`}
                      className={`mypage-tag mypage-tagTone${(index % 4) + 1}`}
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <div className="mypage-postTopRight">
                <span className="mypage-postDate">{post.createdAt}</span>

                <div className="mypage-postActions" aria-label="게시글 작업">
                  <button type="button" aria-label="복사">
                    <ContentCopyIcon aria-hidden="true" fontSize="small" />
                  </button>

                  <button type="button" aria-label="공유">
                    <ShareOutlinedIcon aria-hidden="true" fontSize="small" />
                  </button>

                  <button
                    type="button"
                    className="mypage-deleteButton"
                    aria-label="삭제"
                  >
                    <DeleteOutlined aria-hidden="true" fontSize="small" />
                  </button>
                </div>
              </div>
            </div>

            <Link href={`/post/${post.id}`} className="mypage-postLink">
              <h2 className="mypage-postTitle">{post.title}</h2>
              <p className="mypage-postDescription">{post.description}</p>
            </Link>

            <div className="mypage-postFooter">
              <span className="mypage-postViews">
                <RemoveRedEyeIcon aria-hidden="true" fontSize="small" />
                조회 {post.views}
              </span>

              <div className="mypage-postReactions">
                <span>
                  <FavoriteBorderIcon aria-hidden="true" fontSize="small" />
                  좋아요 {post.likes}
                </span>

                <span>
                  <ChatBubbleOutlineOutlined
                    aria-hidden="true"
                    fontSize="small"
                  />
                  댓글 {post.commentsCount}
                </span>
              </div>
            </div>
          </article>
        ))
      ) : (
        <p className="mypage-emptyText">표시할 게시글이 없습니다.</p>
      )}
    </div>
  );

  const renderComments = () => (
    <div className="mypage-postList">
      {myComments.length > 0 ? (
        myComments.map(comment => (
          <Link
            key={comment.id}
            href={`/post/${comment.postId}`}
            className="mypage-commentItem"
          >
            <div className="mypage-commentTop">
              <span className="mypage-tag mypage-tagTone4">댓글</span>
              <span className="mypage-postDate">{comment.createdAt}</span>
            </div>

            <p className="mypage-commentText">{comment.content}</p>
          </Link>
        ))
      ) : (
        <p className="mypage-emptyText">작성한 댓글이 없습니다.</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <main className="community-scope community-page mypage-page">
        <div className="mypage-container">
          <p className="mypage-emptyText">마이페이지를 불러오는 중입니다.</p>
        </div>
      </main>
    );
  }

  if (!userProfile) {
    return (
      <main className="community-scope community-page mypage-page">
        <div className="mypage-container">
          <p className="mypage-emptyText">
            {loadError || "로그인이 필요합니다."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="community-scope community-page mypage-page">
      <div className="mypage-container">
        <aside className="mypage-leftColumn" aria-label="마이페이지 메뉴">
          <section className="mypage-profileCard">
            <div className="mypage-profileInfo">
              <div className="mypage-profileIdentity">
                <div className="mypage-avatar">
                  <AccountCircleIcon aria-hidden="true" />
                </div>

                <div className="mypage-profileText">
                  <div className="mypage-profileNameRow">
                    <strong className="mypage-profileName">
                      {userProfile.name || "Name"}
                    </strong>
                    <span className="mypage-roleBadge">
                      {userProfile.role || "정회원"}
                    </span>
                  </div>

                  <span className="mypage-userEmail">{userProfile.email}</span>
                  <span className="mypage-joinDate">
                    가입일: {userProfile.joinDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="mypage-profileStats">
              <div className="mypage-profileStat">
                <strong>{userProfile.postsCount}</strong>
                <span>작성글</span>
              </div>

              <div className="mypage-profileStat">
                <strong>{userProfile.commentsCount}</strong>
                <span>작성 댓글</span>
              </div>

              <div className="mypage-profileStat">
                <strong>{userProfile.likesCount}</strong>
                <span>받은 좋아요</span>
              </div>
            </div>
          </section>

          <nav className="mypage-menuCard">
            <button
              type="button"
              className={`mypage-menuItem ${
                activeTab === "myPosts" ? "mypage-menuItemActive" : ""
              }`}
              onClick={() => setActiveTab("myPosts")}
            >
              <HomeOutlinedIcon aria-hidden="true" fontSize="small" />
              <span>마이페이지</span>
            </button>

            <button type="button" className="mypage-menuItem">
              <BookmarkBorderIcon aria-hidden="true" fontSize="small" />
              <span>내 AI 저장</span>
            </button>

            <button
              type="button"
              className={`mypage-menuItem ${
                activeTab === "likedPosts" ? "mypage-menuItemActive" : ""
              }`}
              onClick={() => setActiveTab("likedPosts")}
            >
              <FavoriteBorderIcon aria-hidden="true" fontSize="small" />
              <span>좋아요</span>
            </button>

            <button
              type="button"
              className={`mypage-menuItem ${
                activeTab === "myComments" ? "mypage-menuItemActive" : ""
              }`}
              onClick={() => setActiveTab("myComments")}
            >
              <ForumOutlinedIcon aria-hidden="true" fontSize="small" />
              <span>댓글</span>
            </button>

            <button type="button" className="mypage-menuItem">
              <ManageAccountsOutlinedIcon aria-hidden="true" fontSize="small" />
              <span>회원정보 수정</span>
            </button>

            <button type="button" className="mypage-menuItem mypage-menuLogout">
              <LogoutIcon aria-hidden="true" fontSize="small" />
              <span>로그아웃</span>
            </button>
          </nav>
        </aside>

        <section className="mypage-main">
          <h1 className="mypage-title">나의 마이페이지</h1>

          <div className="mypage-summaryGrid">
            <article className="mypage-summaryCard">
              <div className="mypage-summaryIcon">
                <RemoveRedEyeIcon aria-hidden="true" />
              </div>
              <div className="mypage-summaryText">
                <span className="mypage-summaryLabel">조회수</span>
                <strong className="mypage-summaryValue">
                  {formatCount(totalViews)}
                </strong>
              </div>
            </article>

            <article className="mypage-summaryCard">
              <div className="mypage-summaryIcon mypage-summaryIconLike">
                <FavoriteBorderIcon aria-hidden="true" />
              </div>
              <div className="mypage-summaryText">
                <span className="mypage-summaryLabel">좋아요</span>
                <strong className="mypage-summaryValue">
                  {formatCount(totalLikes)}
                </strong>
              </div>
            </article>

            <article className="mypage-summaryCard">
              <div className="mypage-summaryIcon mypage-summaryIconComment">
                <ChatBubbleOutlineOutlined aria-hidden="true" />
              </div>
              <div className="mypage-summaryText">
                <span className="mypage-summaryLabel">댓글</span>
                <strong className="mypage-summaryValue">
                  {formatCount(myComments.length)}
                </strong>
              </div>
            </article>
          </div>

          <section className="mypage-contentSection">
            {activeTab === "myPosts" && (
              <>
                <div className="mypage-listHeader">
                  <div>
                    <p className="mypage-listEyebrow">MY COMMUNITY</p>
                    <h2 className="mypage-listTitle">내가 작성한 글</h2>
                  </div>
                </div>

                <div className="mypage-filterBar">
                  <div
                    className="mypage-filterTabs"
                    role="tablist"
                    aria-label="게시글 정렬"
                  >
                    {[
                      ["all", "전체"],
                      ["views", "조회수"],
                      ["likes", "좋아요"],
                      ["comments", "댓글"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={sortKey === key}
                        className={`mypage-filterTab ${
                          sortKey === key ? "mypage-filterTabActive" : ""
                        }`}
                        onClick={() => setSortKey(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <span className="mypage-filterState">
                    전체 게시글 <strong>{myPosts.length}</strong>
                  </span>
                </div>

                {renderPostRows(sortedMyPosts)}

                <nav
                  className="mypage-pagination"
                  aria-label="마이페이지 페이지네이션"
                >
                  <button type="button" aria-label="이전 페이지">
                    <ChevronLeftIcon aria-hidden="true" />
                  </button>

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(page => (
                    <button
                      key={page}
                      type="button"
                      className={page === 1 ? "mypage-pageActive" : ""}
                      aria-current={page === 1 ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}

                  <button type="button" aria-label="다음 페이지">
                    <ChevronRightIcon aria-hidden="true" />
                  </button>
                </nav>
              </>
            )}

            {activeTab === "myComments" && renderComments()}
            {activeTab === "likedPosts" && renderPostRows(likedPosts)}
          </section>
        </section>
      </div>
    </main>
  );
}
