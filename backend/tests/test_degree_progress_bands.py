"""
Open-ended wildcard bands ("Any 300-level COMP course or above").

degree_progress.py is a hand-maintained port of requirementMatch.js — there is
no shared module between the two runtimes, so the two can silently disagree and
the AI advisor ends up grounded on different numbers than the student sees in
Degree Planning. These tests pin the Python side to the same behaviour as
frontend/src/utils/requirementMatch.test.js.

Two bugs are covered:

1. "300-level ... or above" parsed as 300-399, so every 400- and 500-level
   course a student had taken was dropped from that requirement. On a real
   account this pushed COMP 421 and COMP 559 out of the CS major and into
   Electives.

2. Rows phrased "Any COMP course at 300+" never mention the word "level", which
   the old gate required, so they produced no band at all. Those rows also have
   a null catalog, which switched on the legacy any-course-in-this-subject
   fallback — "Any MATH course at 300+" happily matched MATH 133.
"""
import math

from api.utils.degree_progress import block_wildcard_matches, wildcard_band


def band(subject, catalog, title):
    return wildcard_band({'subject': subject, 'catalog': catalog, 'title': title})


class TestOpenEnded:
    def test_or_above_has_no_ceiling(self):
        b = band('COMP', '300', 'Any 300-level COMP course or above (excluding COMP 396).')
        assert (b['subject'], b['min'], b['max']) == ('COMP', 300, math.inf)

    def test_every_open_ended_phrasing_in_the_catalogue(self):
        # Exactly the titles present in requirement_courses today.
        for subject, catalog, title in [
            ('GEOG', '300', 'Any 300-level or above Geography course'),
            ('COMP', '300', 'Any COMP course at 300 level or above (excluding specified projects)'),
            ('MUHL', '300', 'Any MUHL course at 300-level or higher'),
            ('MUPP', '300', 'Any MUPP course at 300-level or higher'),
            ('PSYC', '300', 'Any Psychology course at 300-level or above'),
        ]:
            assert band(subject, catalog, title)['max'] == math.inf, title

    def test_plus_phrasing_without_the_word_level(self):
        assert band('COMP', None, 'Any COMP course at 300+') == {
            'subject': 'COMP', 'min': 300, 'max': math.inf,
        }
        assert band('MATH', None, 'Any MATH statistics course at 400+') == {
            'subject': 'MATH', 'min': 400, 'max': math.inf,
        }


class TestClosedBandsUnchanged:
    def test_plain_single_hundred_band_still_closed(self):
        assert band('ANTH', '200', 'Any 200-level Anthropology course') == {
            'subject': 'ANTH', 'min': 200, 'max': 299,
        }
        assert band('ANTH', '300', 'Any 300-level Anthropology course') == {
            'subject': 'ANTH', 'min': 300, 'max': 399,
        }

    def test_non_wildcard_rows_are_still_not_bands(self):
        assert band('COMP', '250', 'Introduction to Computer Science.') is None


class TestLegacyFallback:
    def test_parseable_null_catalog_row_does_not_trigger_the_catch_all(self):
        block = {'credits_needed': 6, 'courses': [
            {'subject': 'MATH', 'catalog': None, 'title': 'Any MATH course at 300+'},
        ]}
        taken = [
            {'subject': 'MATH', 'catalog': '133'},
            {'subject': 'MATH', 'catalog': '323'},
            {'subject': 'COMP', 'catalog': '250'},
        ]
        assert block_wildcard_matches(block, taken) == [{'subject': 'MATH', 'catalog': '323'}]

    def test_uninterpretable_row_still_falls_back(self):
        """The fallback must survive — it's what carries seed rows that name a
        subject with no level information at all."""
        block = {'credits_needed': 6, 'courses': [
            {'subject': 'MATH', 'catalog': None, 'title': 'Mathematics elective'},
        ]}
        taken = [{'subject': 'MATH', 'catalog': '133'}, {'subject': 'COMP', 'catalog': '250'}]
        assert block_wildcard_matches(block, taken) == [{'subject': 'MATH', 'catalog': '133'}]


class TestExclusions:
    CS_ABOVE = 'Any 300-level COMP course or above (excluding COMP 396).'

    def test_parses_the_excluded_code_off_the_title(self):
        assert band('COMP', '300', self.CS_ABOVE)['exclude'] == {'COMP 396'}

    def test_excluded_course_stays_out_of_the_block(self):
        block = {'credits_needed': 6, 'courses': [
            {'subject': 'COMP', 'catalog': '300', 'title': self.CS_ABOVE},
        ]}
        taken = [
            {'subject': 'COMP', 'catalog': '396'},
            {'subject': 'COMP', 'catalog': '421'},
            {'subject': 'COMP', 'catalog': '250'},   # below the band
        ]
        assert block_wildcard_matches(block, taken) == [{'subject': 'COMP', 'catalog': '421'}]

    def test_category_carve_out_excludes_nothing(self):
        """"excluding specified projects and independent studies" names no codes,
        so we leave those courses in rather than guess which they are."""
        b = band('COMP', '300',
                 'Any COMP course at 300 level or above (excluding specified projects and independent studies)')
        assert 'exclude' not in b
        assert b['max'] == math.inf

    def test_plain_band_carries_no_exclude_key(self):
        assert band('ANTH', '200', 'Any 200-level Anthropology course') == {
            'subject': 'ANTH', 'min': 200, 'max': 299,
        }


class TestBlockCreditCap:
    """A block awards at most credits_needed. The cap used to be checked only
    before adding a course, so the last one always overshot — on a real account
    a 6-credit block absorbed COMP 322 (1) + COMP 421 (3) + COMP 559 (4) = 8,
    inflating that program's ring."""


    BLOCK = {
        'credits_needed': 6,
        'courses': [{'subject': 'COMP', 'catalog': '300',
                     'title': 'Any 300-level COMP course or above'}],
    }

    def _prog(self):
        return {'program_key': 'p', 'total_credits': 36, 'blocks': [dict(self.BLOCK)]}

    def test_block_never_awards_more_than_it_needs(self):
        from api.utils.degree_progress import calc_ring_progress
        done = [
            {'subject': 'COMP', 'catalog': '322', 'credits': 1},
            {'subject': 'COMP', 'catalog': '421', 'credits': 3},
            {'subject': 'COMP', 'catalog': '559', 'credits': 4},   # would overshoot to 8
        ]
        assert calc_ring_progress(self._prog(), done, [], {}, set())['earned'] == 6

    def test_under_the_cap_is_untouched(self):
        from api.utils.degree_progress import calc_ring_progress
        done = [{'subject': 'COMP', 'catalog': '421', 'credits': 3}]
        assert calc_ring_progress(self._prog(), done, [], {}, set())['earned'] == 3


class TestMultiTermCourseLevels:
    """D1/D2 courses must resolve to their numeric level, like JS parseInt.

    Python's int("227D1") raises; JavaScript's parseInt("227D1") is 227. The
    port used int(), so every multi-term course (ECON 230D1, FRSL 207D1, …)
    silently fell out of level bands on the backend while the frontend counted
    them — the two runtimes disagreeing about a student's credits is precisely
    what degree_progress.py exists to prevent.
    """

    BLOCK = {'credits_needed': 18, 'courses': [
        {'subject': 'ECON', 'title': 'Any ECON course at 210+'},
    ]}

    def test_d_course_counts_toward_a_band(self):
        taken = [{'subject': 'ECON', 'catalog': '227D1', 'credits': 3}]
        assert block_wildcard_matches(self.BLOCK, taken) == taken

    def test_band_floor_still_excludes_lower_courses(self):
        taken = [{'subject': 'ECON', 'catalog': '208', 'credits': 3}]
        assert block_wildcard_matches(self.BLOCK, taken) == []

    def test_d_course_respects_a_closed_band(self):
        block = {'credits_needed': 6, 'courses': [
            {'subject': 'FRSL', 'catalog': '200', 'title': 'Any 200-level French course'},
        ]}
        inside = [{'subject': 'FRSL', 'catalog': '207D1', 'credits': 3}]
        outside = [{'subject': 'FRSL', 'catalog': '307D1', 'credits': 3}]
        assert block_wildcard_matches(block, inside) == inside
        assert block_wildcard_matches(block, outside) == []

    def test_unparseable_catalog_is_still_no_level(self):
        block = {'credits_needed': 6, 'courses': [
            {'subject': 'ECON', 'title': 'Any ECON course at 210+'},
        ]}
        assert block_wildcard_matches(block, [{'subject': 'ECON', 'catalog': 'XXX'}]) == []
