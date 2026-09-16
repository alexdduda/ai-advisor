"""
_grade_related_notes — grounding for the AI advisor's grade/GPA claims.

Incident this fixes: a student asked the chat about their math electives and
got told they needed "better than a C" (then, corrected, "better than a D")
for later math electives — a claim that appeared nowhere in their actual
program data. Root cause: compute_degree_progress_summary only ever sent the
model percent-complete numbers, never the real per-course/block/program
"notes" text where genuine grade requirements live (e.g. "must be passed
with a grade of C or better"). With zero grounding, the model filled the gap
from unverifiable training knowledge instead of saying it didn't have the
number.

These tests pin _grade_related_notes to: only surface text that actually
mentions a grade/GPA keyword (most notes are unrelated — deadlines, sequencing,
mutually-exclusive courses — and would just be prompt noise), dedupe repeated
text (block.notes and block.constraint_notes are often verbatim identical in
the seed data), and label each note with the program it came from.
"""
from api.utils.degree_progress import _grade_related_notes


class TestGradeRelatedNotes:
    def test_program_description_with_grade_requirement_is_surfaced(self):
        prog = {
            'description': 'All courses counted towards the Minor must be passed with a grade of C or better.',
            'blocks': [],
        }
        out = _grade_related_notes('Statistics Minor', prog)
        assert len(out) == 1
        assert 'Statistics Minor' in out[0]
        assert 'grade of C or better' in out[0]

    def test_course_level_note_with_grade_requirement_is_surfaced(self):
        prog = {
            'description': None,
            'blocks': [
                {
                    'notes': 'All three courses must be completed in U2.',
                    'courses': [
                        {'subject': 'MATH', 'catalog': '222', 'notes': 'May be omitted if an equivalent course was completed with grade C or better.'},
                        {'subject': 'MATH', 'catalog': '314', 'notes': 'Advanced Calculus — no prerequisite note here.'},
                    ],
                },
            ],
        }
        out = _grade_related_notes('Mathematics', prog)
        assert len(out) == 1
        assert 'grade C or better' in out[0]

    def test_notes_with_no_grade_keyword_are_dropped(self):
        prog = {
            'description': 'A general overview of what this program covers.',
            'blocks': [
                {
                    'notes': 'Students must complete these in sequence.',
                    'courses': [
                        {'subject': 'COMP', 'catalog': '202', 'notes': 'Prerequisite: none.'},
                    ],
                },
            ],
        }
        assert _grade_related_notes('Computer Science', prog) == []

    def test_duplicate_notes_and_constraint_notes_text_deduped(self):
        same_text = 'PSYC 306 and PSYC 380D1/D2 require minimum grade of B for Joint Honours award.'
        prog = {
            'description': None,
            'blocks': [
                {'notes': same_text, 'constraint_notes': same_text, 'courses': []},
            ],
        }
        out = _grade_related_notes('Psychology', prog)
        assert len(out) == 1

    def test_empty_and_missing_fields_are_safe(self):
        prog = {'description': '', 'blocks': [
            {'notes': None, 'constraint_notes': '', 'courses': [{'subject': 'X', 'catalog': '1', 'notes': None}]},
            {},
        ]}
        assert _grade_related_notes('Anything', prog) == []

    def test_gpa_keyword_alone_is_enough_to_surface(self):
        prog = {'description': 'To graduate, a CGPA of 3.30 must be obtained.', 'blocks': []}
        out = _grade_related_notes('Neuroscience', prog)
        assert len(out) == 1
        assert 'CGPA' in out[0]
