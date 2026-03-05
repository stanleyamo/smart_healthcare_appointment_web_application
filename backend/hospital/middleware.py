from .utils import log_action

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            resource = request.path.split('/')[2] if len(request.path.split('/')) > 2 else "Unknown"

            log_action(
                user=request.user,
                action=request.method,
                resource=resource.capitalize(),
                target=f"API Request to {request.path}",
                request=request
            )

        return response