from fastapi.testclient import TestClient
from fastapi import APIRouter
import sys
import types
import os


def test_security_headers_and_csp():
    # Stub heavy modules (DB-dependent routers) before importing app.main
    for name in (
        "app.routers.auth",
        "app.endpoints.chat",
        "app.endpoints.chain",
        "app.auth.google.routes",
        "app.auth.google.callback",
    ):
        if name not in sys.modules:
            mod = types.ModuleType(name)
            mod.router = APIRouter()
            sys.modules[name] = mod

    # Ensure environment variables expected by app.main middlewares
    os.environ.setdefault("SESSION_SECRET_KEY", "session-secret")

    # Import inside test to ensure module-level code executes during coverage
    from app.main import app

    client = TestClient(app)

    # Swagger/OpenAPI path uses relaxed CSP
    r = client.get("/openapi.json")
    assert r.status_code in (200, 404)  # 404 acceptable if schema generation disabled
    # Middleware should attach common security headers regardless of route status
    assert r.headers.get("X-Content-Type-Options") == "nosniff"
    assert r.headers.get("X-Frame-Options") == "DENY"
    csp = r.headers.get("Content-Security-Policy", "")
    assert "default-src 'self'" in csp

    # Non-docs route uses strict CSP (no unsafe-inline)
    r2 = client.get("/non-existent")
    assert r2.status_code == 404
    csp2 = r2.headers.get("Content-Security-Policy", "")
    assert "script-src 'self'" in csp2
    assert "unsafe-inline" not in csp2
