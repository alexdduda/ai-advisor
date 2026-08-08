"""
Regression test for SYMBOLOS-BACKEND-F.

process_transcript deletes its uploaded PDF in a `finally` block. That used to
run unconditionally, which silently defeated retries=2: a transient Claude
failure raised, the finally deleted the source PDF, and both retries then died
on `StorageApiError: Object not found` at the download step. The retry
mechanism could never succeed, and the student got a misleading generic error
rather than the real cause.

The rule these tests pin down: delete on success, or on the final attempt —
never on a failure that still has a retry coming.
"""
import ast
import pathlib

SRC = (pathlib.Path(__file__).parent.parent / "api/inngest_app.py").read_text()


def _func(name: str) -> str:
    for node in ast.walk(ast.parse(SRC)):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == name:
            return ast.unparse(node)
    raise AssertionError(f"{name} not found")


class TestCleanupIsConditional:
    def test_removal_is_guarded(self):
        """The remove() must not be unconditional inside finally."""
        fn = _func("process_transcript")
        assert "if succeeded or is_final_attempt:" in fn, (
            "transcript cleanup is unconditional again — this defeats retries, "
            "see SYMBOLOS-BACKEND-F"
        )

    def test_final_attempt_derived_from_the_retry_constant(self):
        """Hardcoding the attempt number would silently drift from retries=N."""
        fn = _func("process_transcript")
        assert "ctx.attempt >= _TRANSCRIPT_RETRIES" in fn

    def test_retry_count_is_a_shared_constant(self):
        """The decorator and the guard must not be able to disagree."""
        assert "_TRANSCRIPT_RETRIES = 2" in SRC
        assert "retries=_TRANSCRIPT_RETRIES" in SRC

    def test_success_flag_starts_false_and_is_set_after_done(self):
        fn = _func("process_transcript")
        assert "succeeded = False" in fn
        assert "succeeded = True" in fn
        # set only after the job is marked done, not before the work
        assert fn.index("update_job(job_id, 'done'".replace("'", "'")) < fn.index("succeeded = True") \
            or "succeeded = True" in fn.split("update_job")[-1]


class TestSyllabusUnaffected:
    def test_syllabus_cleanup_stays_unconditional(self):
        """Deliberate asymmetry: process_syllabus swallows per-file errors and
        never re-raises, so no retry follows and keeping the file would leak."""
        fn = _func("process_syllabus")
        assert "remove([storage_path])" in fn
        assert "is_final_attempt" not in fn, (
            "process_syllabus does not re-raise, so it needs no retry guard"
        )
