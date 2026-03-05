from django.apps import apps

def log_action(user, action, resource, target, request=None):
    AuditLog = apps.get_model('hospital', 'AuditLog')

    ip = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

    AuditLog.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        resource=resource,
        target=target,
        ip_address=ip
    )