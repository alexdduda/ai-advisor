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
        assert band('COMP', '300', 'Any 300-level COMP course or above (excluding COMP 396).') == {
            'subject': 'COMP', 'min': 300, 'max': math.inf,
        }

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
