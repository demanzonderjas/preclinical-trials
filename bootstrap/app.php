<?php

use App\Http\Middleware\CheckIfUserIsAdmin;
use App\Http\Middleware\EnsureAdminTwoFactor;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\VerifyExternalApiKey;
use App\Http\Middleware\VerifyILESToken;
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
        // Every page is an Inertia response.
        // AuthenticateSession ends other sessions after "log out on all devices" or a password change.
        $middleware->web(append: [\Illuminate\Session\Middleware\AuthenticateSession::class, \App\Http\Middleware\TrackLastActivity::class, HandleInertiaRequests::class]);

        $middleware->throttleApi();

        $middleware->alias([
            'admin' => CheckIfUserIsAdmin::class,
            'admin.2fa' => EnsureAdminTwoFactor::class,
            'iles' => VerifyILESToken::class,
            'external-api' => VerifyExternalApiKey::class,
        ]);

        // Guests are sent to the log in page, which returns them to the page they wanted.
        $middleware->redirectGuestsTo(fn () => route('login'));

        // Test helper routes, only registered when APP_ENV=e2e (App\Providers\E2EServiceProvider).
        $middleware->validateCsrfTokens(except: ['__e2e/*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Pages get the A2 error page; server errors keep Laravel's debug page while developing.
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, Request $request) {
            $status = $response->getStatusCode();
            if ($request->is('api/*') || $request->expectsJson() || ! in_array($status, [403, 404, 419, 429, 500, 503], true)) {
                return $response;
            }
            if ($status === 419) {
                return back()->with('error', 'The page expired. Please try again.');
            }
            if ($status >= 500 && config('app.debug')) {
                return $response;
            }

            return \Inertia\Inertia::render('error', ['status' => $status])->toResponse($request)->setStatusCode($status);
        });
    })->create();
