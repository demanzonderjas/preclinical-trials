<?php

use App\Http\Middleware\CheckIfUserIsAdmin;
use App\Http\Middleware\EnsureUserIsOwner;
use App\Http\Middleware\VerifyExternalApiKey;
use App\Http\Middleware\VerifyILESToken;
use App\Http\Middleware\VerifyUserHasChannelAccess;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // The React SPA authenticates API calls with the session cookie (Sanctum).
        $middleware->statefulApi();
        $middleware->throttleApi();

        $middleware->alias([
            'admin' => CheckIfUserIsAdmin::class,
            'auth.owner' => EnsureUserIsOwner::class,
            'channel' => VerifyUserHasChannelAccess::class,
            'iles' => VerifyILESToken::class,
            'external-api' => VerifyExternalApiKey::class,
        ]);

        // Guests are sent to the home page, which opens the login form and returns them afterwards.
        $middleware->redirectGuestsTo(fn (Request $request) => route('index', ['login_to' => $request->path()]));

        // Test helper routes, only registered when APP_ENV=e2e (App\Providers\E2EServiceProvider).
        $middleware->validateCsrfTokens(except: ['__e2e/*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
