import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.middleware.logger import RequestLoggerMiddleware


def test_request_logger_middleware_success():
    """Test request logger middleware with successful request"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    @app.get("/test")
    def test_endpoint():
        return {"message": "success"}

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        response = client.get("/test")

        assert response.status_code == 200
        assert response.json() == {"message": "success"}

        # Verify logging was called
        assert mock_logger.info.call_count >= 2  # At least request and response logs


def test_request_logger_middleware_logs_request_details():
    """Test that middleware logs request method and URL"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    @app.post("/api/data")
    def post_endpoint(data: dict):
        return {"received": data}

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        response = client.post("/api/data", json={"test": "value"})

        assert response.status_code == 200

        # Check that request was logged with method and URL
        call_args = [str(call) for call in mock_logger.info.call_args_list]
        request_logged = any("POST" in str(call) and "/api/data" in str(call) for call in call_args)
        assert request_logged


def test_request_logger_middleware_logs_response_status():
    """Test that middleware logs response status code"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    @app.get("/status")
    def status_endpoint():
        return {"status": "ok"}

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        response = client.get("/status")

        assert response.status_code == 200

        # Check that response status was logged
        call_args = [str(call) for call in mock_logger.info.call_args_list]
        response_logged = any("200" in str(call) for call in call_args)
        assert response_logged


def test_request_logger_middleware_exception_handling():
    """Test that middleware logs errors when an exception occurs"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    @app.get("/error")
    def error_endpoint():
        raise ValueError("Test error")

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        # This should raise an exception
        with pytest.raises(ValueError):
            client.get("/error")

        # Verify error was logged
        assert mock_logger.error.called
        error_call_args = str(mock_logger.error.call_args)
        assert "error" in error_call_args.lower()
        assert "GET" in error_call_args
        assert "/error" in error_call_args


def test_request_logger_middleware_http_exception():
    """Test middleware with HTTP exception"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    @app.get("/forbidden")
    def forbidden_endpoint():
        raise HTTPException(status_code=403, detail="Access denied")

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        response = client.get("/forbidden")

        # FastAPI handles HTTPException, so it should return 403
        assert response.status_code == 403

        # Request should be logged
        assert mock_logger.info.called


def test_request_logger_middleware_logs_headers():
    """Test that middleware logs request headers"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    @app.get("/headers")
    def headers_endpoint():
        return {"ok": True}

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        response = client.get("/headers", headers={"X-Custom-Header": "test-value"})

        assert response.status_code == 200

        # Check that headers were logged
        call_args = [str(call) for call in mock_logger.info.call_args_list]
        headers_logged = any("Headers" in str(call) for call in call_args)
        assert headers_logged


def test_request_logger_middleware_different_methods():
    """Test middleware with different HTTP methods"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    @app.get("/resource")
    def get_resource():
        return {"method": "GET"}

    @app.post("/resource")
    def post_resource():
        return {"method": "POST"}

    @app.put("/resource")
    def put_resource():
        return {"method": "PUT"}

    @app.delete("/resource")
    def delete_resource():
        return {"method": "DELETE"}

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        methods = ["get", "post", "put", "delete"]

        for method in methods:
            getattr(client, method)("/resource")

        # Should have logged all methods
        call_args = [str(call) for call in mock_logger.info.call_args_list]
        assert any("GET" in str(call) for call in call_args)
        assert any("POST" in str(call) for call in call_args)
        assert any("PUT" in str(call) for call in call_args)
        assert any("DELETE" in str(call) for call in call_args)


def test_request_logger_middleware_404():
    """Test middleware logs 404 responses"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        response = client.get("/nonexistent")

        assert response.status_code == 404

        # Should log the 404 response
        call_args = [str(call) for call in mock_logger.info.call_args_list]
        response_logged = any("404" in str(call) for call in call_args)
        assert response_logged


def test_request_logger_middleware_reraises_exception():
    """Test that middleware re-raises exceptions after logging"""
    app = FastAPI()
    app.add_middleware(RequestLoggerMiddleware)

    custom_exception = RuntimeError("Custom test exception")

    @app.get("/runtime-error")
    def runtime_error_endpoint():
        raise custom_exception

    client = TestClient(app)

    with patch('app.middleware.logger.logger') as mock_logger:
        # Should re-raise the exception
        with pytest.raises(RuntimeError) as exc_info:
            client.get("/runtime-error")

        # Verify it's the same exception
        assert exc_info.value is custom_exception

        # Verify error was logged
        assert mock_logger.error.called
