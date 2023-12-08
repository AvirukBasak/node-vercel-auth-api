# Node.js Auth Api

## MongoDB Schema
```json
{
    "username": "string",
    "email": "string",
    "hash": "string",
}
```

## Register API
```json
POST /api/register
{
    "username": "string",
    "email": "string",
    "password": "string",
}
```

#### Response on OK
```json
200 OK
{}
```

#### Response on Error
HTTP error status code with user-friendly message in JSON body.
```json
{
    "message": "string",
}
```

## Login API
```json
POST /api/login
{
    "username": "string",
    "password": "string",
}
```

#### Response on OK
```json
200 OK
{
    "token": "string",
}
```

#### Response on Error
HTTP error status code with user-friendly message in JSON body.
```json
{
    "message": "string",
}
```

## Forgot Password API
```json
POST /api/forgot-password
{
    "username": "string",
    "email": "string",
}
```

#### Response on OK
```json
200 OK
{}
```

#### Response on Error
HTTP error status code with user-friendly message in JSON body.
```json
{
    "message": "string",
}
```

## Change Password API
```json
POST /api/reset-password
{
    "username": "string",
    "email": "string",
    "otp": "string",
    "password": "string",
}
```

#### Response on OK
```json
200 OK
{}
```

#### Response on Error
HTTP error status code with user-friendly message in JSON body.
```json
{
    "message": "string",
}
```
