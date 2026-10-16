<?php

namespace App\Http\Middleware;

use App\Services\Inbox;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template for pages built in the A2 design. Pages that have not been
     * rebuilt yet are still served by the legacy SPA in resources/views/index.blade.php.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Props every page receives.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'first_name' => $user->first_name,
                    'initials' => self::initials($user->first_name, $user->last_name),
                    'institution' => $user->institution,
                    'is_admin' => $user->is_admin,
                    'is_verified' => $user->is_verified,
                ] : null,
            ],
            // The counts on the workspace tabs.
            'workspace' => fn () => $user ? [
                'protocols' => $user->protocols()->count(),
                'unread_messages' => Inbox::for($user)->unreadCount(),
            ] : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * "Sanne de Vries" becomes "SV": the surname's last word skips prefixes like "de" or "van der".
     */
    public static function initials(?string $firstName, ?string $lastName): string
    {
        $surname = collect(preg_split('/\s+/', trim((string) $lastName)))->filter()->last() ?? '';

        return mb_strtoupper(mb_substr(trim((string) $firstName), 0, 1).mb_substr($surname, 0, 1));
    }
}
