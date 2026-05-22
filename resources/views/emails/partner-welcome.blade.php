<!DOCTYPE html>
<html>

<head>
    <title>Welcome {{ $partner->organization_name }}</title>
</head>

<body>
    <h1>Welcome to {{ config('app.name') }}!</h1>

    <p>Dear {{ $partner->contact_person }},</p>

    <p>Thank you for registering {{ $partner->organization_name }} as a partner.</p>

    <h3>Your Account Details:</h3>
    <ul>
        <li>Organization: {{ $partner->organization_name }}</li>
        <li>Email: {{ $partner->email }}</li>
        <li>Phone: {{ $partner->phone }}</li>
        @if($password)
        <li>Temporary Password: {{ $password }}</li>
        @endif
    </ul>

    <p>You can login at: {{ url('/partner/login') }}</p>

    <p>Best regards,<br>{{ config('app.name') }} Team</p>
</body>

</html>