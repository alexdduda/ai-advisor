-- ────────────────────────────────────────────────────────────────────────────
-- 2026-09-23 — Add credits to search_courses()
--
-- The course search results list never showed credit counts because this
-- function's ranked_sections CTE never selected the courses.credits column
-- in the first place, and RETURNS TABLE didn't declare it either. The
-- frontend/backend fix for this (PR #225) was a no-op until this landed —
-- the courses table always had real credits data, this RPC just never
-- surfaced it.
--
-- Pure addition: every existing column, join, and filter is unchanged.
--
-- Idempotent — safe to re-run. Postgres won't let CREATE OR REPLACE change a
-- function's RETURNS TABLE shape (adding the credits column counts as a
-- change), so this drops the old signature first — same as ALTER'ing a
-- column, not a data-destructive DROP; the function body is recreated
-- immediately after in the same statement batch.
-- ────────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.search_courses(text, text, integer);

CREATE OR REPLACE FUNCTION public.search_courses(p_query text DEFAULT NULL::text, p_subject text DEFAULT NULL::text, p_limit integer DEFAULT 50)
 RETURNS TABLE(course_code text, subject text, catalog text, title text, credits numeric, recent_average numeric, recent_year integer, instructor text, num_sections bigint, rmp_rating numeric, rmp_difficulty numeric, rmp_num_ratings numeric, rmp_would_take_again numeric, mc_rating numeric, mc_num_ratings numeric, blended_rating numeric)
 LANGUAGE sql
 STABLE
AS $function$
  WITH ranked_sections AS (
    SELECT
      "Course"                                         AS course_code,
      SUBSTRING("Course" FROM '^[A-Za-z]+')            AS subject,
      SUBSTRING("Course" FROM '[0-9][A-Za-z0-9]*$')    AS catalog,
      course_name                                      AS title,
      credits,
      "Class Ave.1"::NUMERIC                           AS grade,
      CAST(SUBSTRING("Term Name" FROM '[0-9]{4}') AS INT) AS term_year,
      instructor,
      rmp_rating::NUMERIC,
      rmp_difficulty::NUMERIC,
      rmp_num_ratings::NUMERIC,
      rmp_would_take_again::NUMERIC,
      mc_rating::NUMERIC,
      mc_num_ratings::NUMERIC,
      blended_rating::NUMERIC
    FROM courses
    WHERE
      (p_subject IS NULL OR "Course" LIKE (UPPER(p_subject) || '%'))
      AND (
        p_query IS NULL
        OR "Course" ILIKE ('%' || p_query || '%')
        OR course_name ILIKE ('%' || p_query || '%')
      )
  ),
  most_recent_year AS (
    SELECT
      course_code,
      MAX(term_year) FILTER (WHERE grade IS NOT NULL) AS recent_year
    FROM ranked_sections
    GROUP BY course_code
  ),
  aggregated AS (
    SELECT
      rs.course_code,
      rs.subject,
      rs.catalog,
      MAX(rs.title)                                                AS title,
      MAX(rs.credits)                                              AS credits,
      ROUND(
        AVG(rs.grade) FILTER (WHERE rs.term_year = mry.recent_year),
        2
      )                                                            AS recent_average,
      mry.recent_year,
      (ARRAY_AGG(rs.instructor ORDER BY rs.term_year DESC NULLS LAST)
        FILTER (WHERE rs.instructor IS NOT NULL))[1]               AS instructor,
      COUNT(*)                                                     AS num_sections,
      MAX(rs.rmp_rating)                                           AS rmp_rating,
      MAX(rs.rmp_difficulty)                                       AS rmp_difficulty,
      MAX(rs.rmp_num_ratings)                                      AS rmp_num_ratings,
      MAX(rs.rmp_would_take_again)                                 AS rmp_would_take_again,
      MAX(rs.mc_rating)                                            AS mc_rating,
      MAX(rs.mc_num_ratings)                                       AS mc_num_ratings,
      MAX(rs.blended_rating)                                       AS blended_rating
    FROM ranked_sections rs
    JOIN most_recent_year mry USING (course_code)
    GROUP BY rs.course_code, rs.subject, rs.catalog, mry.recent_year
  )
  SELECT
    course_code, subject, catalog, title, credits,
    recent_average, recent_year, instructor, num_sections,
    rmp_rating, rmp_difficulty, rmp_num_ratings, rmp_would_take_again,
    mc_rating, mc_num_ratings, blended_rating
  FROM aggregated
  ORDER BY
    CASE WHEN p_subject IS NOT NULL AND subject = UPPER(p_subject) THEN 0 ELSE 1 END,
    course_code
  LIMIT p_limit;
$function$
;
