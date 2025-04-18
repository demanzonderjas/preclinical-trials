<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @unless (!Auth::check())
        <meta name="session-id" content={{ rand() }}>
    @endunless
    <link rel="stylesheet" href="/css/app.css?t={{ time() }}">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <title>{{ env('APP_NAME') }}</title>
</head>

<body>
    <div id="app"></div>
    <script src="/js/index.js?t={{ time() }}" type="text/javascript"></script>
</body>

</html>
