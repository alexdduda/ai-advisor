"""
Tests for GET /api/courses/{subject}/{catalog}'s optional `term` param —
lets a caller (completed-course detail views) ask for the class average as
it stood in a specific term instead of the aggregate recent/overall average.
"""
from __future__ import annotations

from types import SimpleNamespace

from .conftest import auth


def _stub_rpc(fake_supabase, course_row: dict):
    """The shared fake's default .rpc() returns a bare scalar, which doesn't
    match the shape get_course_details expects (a list of one row dict).
    Point it at a real row for the RPC this endpoint calls, and leave other
    RPC calls on the default behavior."""
    def _rpc(name, *args, **kwargs):
        if name == "get_course_details":
            return SimpleNamespace(execute=lambda: SimpleNamespace(data=[course_row]))
        return SimpleNamespace(execute=lambda: SimpleNamespace(data=1))
    fake_supabase.rpc = _rpc


def test_course_details_term_average_present(client, fake_supabase):
    _stub_rpc(fake_supabase, {"course_name": "Intro to Whatever", "recent_avg": 3.1, "overall_avg": 3.0})
    fake_supabase.set_table("courses", [
        {"Course": "COMP202", "instructor": "A Prof", "Class Ave.1": 3.4},
        {"Course": "COMP202", "instructor": "B Prof", "Class Ave.1": 3.2},
        {"Course": "COMP202", "instructor": "A Prof", "Class Ave.1": 2.8},  # different term, ignored below via Term Name filter
    ])
    # Give the two rows that should match a Term Name so the eq filter can select them.
    fake_supabase._tables["courses"][0]["Term Name"] = "Fall 2023"
    fake_supabase._tables["courses"][1]["Term Name"] = "Fall 2023"
    fake_supabase._tables["courses"][2]["Term Name"] = "Winter 2024"

    resp = client.get("/api/courses/COMP/202", params={"term": "Fall 2023"}, headers=auth("user-1"))
    assert resp.status_code == 200
    course = resp.json()["course"]
    assert course["term"] == "Fall 2023"
    assert course["term_average"] == 3.3  # average of 3.4 and 3.2


def test_course_details_term_average_falls_back_when_no_match(client, fake_supabase):
    _stub_rpc(fake_supabase, {"course_name": "Intro to Whatever", "recent_avg": 3.1, "overall_avg": 3.0})
    fake_supabase.set_table("courses", [])

    resp = client.get("/api/courses/COMP/202", params={"term": "Fall 2019"}, headers=auth("user-1"))
    assert resp.status_code == 200
    course = resp.json()["course"]
    assert "term_average" not in course
    assert course["average"] == 3.1
    assert course["overall_average"] == 3.0


def test_course_details_without_term_is_unaffected(client, fake_supabase):
    _stub_rpc(fake_supabase, {"course_name": "Intro to Whatever", "recent_avg": 3.1, "overall_avg": 3.0})

    resp = client.get("/api/courses/COMP/202", headers=auth("user-1"))
    assert resp.status_code == 200
    course = resp.json()["course"]
    assert "term_average" not in course
    assert "term" not in course
