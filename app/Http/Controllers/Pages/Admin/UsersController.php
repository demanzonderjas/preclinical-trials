<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Protocol;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** A2 admin users (F8): find an account and help a researcher back in. */
class UsersController extends Controller
{
    private const FILTERS = ['all', 'verified', 'unverified', 'admins'];

    public function index(Request $request): Response
    {
        $filter = in_array($request->query('filter'), self::FILTERS, true) ? $request->query('filter') : 'all';
        $q = trim((string) $request->query('q'));

        $users = $this->filtered(User::query(), $filter)
            ->when($q !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->where('first_name', 'like', "%$q%")->orWhere('last_name', 'like', "%$q%")
                ->orWhereRaw("concat(first_name, ' ', last_name) like ?", ["%$q%"])
                ->orWhere('email', 'like', "%$q%")->orWhere('institution', 'like', "%$q%")
                ->orWhere('country', 'like', "%$q%")->orWhere('city', 'like', "%$q%")))
            ->with('roles')
            ->withCount('protocols')
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'institution' => $user->institution,
                'country' => config("pct.countries.{$user->country}") ?? $user->country,
                'role' => $user->role,
                'verified' => $user->hasVerifiedEmail(),
                'admin' => $user->is_admin,
                'protocols' => $user->protocols_count,
                'joined' => $user->created_at?->toIso8601String(),
                'active' => $user->last_active_at?->toIso8601String(),
            ]);

        $selected = $request->integer('user') ? User::with('roles', 'protocols.details', 'protocols.adminActions')->find($request->integer('user')) : null;

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => ['filter' => $filter, 'q' => $q],
            'counts' => collect(self::FILTERS)->mapWithKeys(fn ($f) => [$f => $this->filtered(User::query(), $f)->count()]),
            'regions' => $this->regions(),
            'selected' => $selected ? $this->details($selected) : null,
            'temporaryPassword' => $request->session()->get('temporary_password'),
        ]);
    }

    public function verify(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return back()->with('success', "The email address of {$user->name} is marked as verified.");
    }

    public function sendResetLink(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        Password::sendResetLink(['email' => $user->email]);

        return back()->with('success', "A reset link was sent to {$user->email}.");
    }

    /** For when the reset mail does not arrive: shown once to the admin, to pass on by phone. */
    public function temporaryPassword(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $password = Str::password(16, symbols: false);
        $user->forceFill(['password' => Hash::make($password)])->save();

        return back()->with('temporary_password', ['user' => $user->id, 'email' => $user->email, 'password' => $password]);
    }

    private function filtered(Builder $query, string $filter): Builder
    {
        return match ($filter) {
            'verified' => $query->whereNotNull('email_verified_at'),
            'unverified' => $query->whereNull('email_verified_at'),
            'admins' => $query->whereHas('roles', fn (Builder $q) => $q->where('name', 'admin')),
            default => $query,
        };
    }

    /** The legacy region figures (UserController::getRegionSpecificStats). */
    private function regions(): array
    {
        $utrecht = fn (Builder $q) => $q->where('institution', 'LIKE', '%Utrecht%')->orWhereIn('institution', ['uu', 'hu', 'uumc']);
        $nijmegen = fn (Builder $q) => $q->where('institution', 'LIKE', '%Radboud%');

        return [
            'total' => User::count(),
            'dutch' => User::where('country', 'NL')->count(),
            'utrecht' => User::where($utrecht)->count(),
            'nijmegen' => User::where($nijmegen)->count(),
            'utrecht_nijmegen_protocols' => Protocol::whereHas('user', fn (Builder $q) => $q->where(fn ($q) => $utrecht($q))->orWhere(fn ($q) => $nijmegen($q)))->count(),
        ];
    }

    private function details(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'initials' => HandleInertiaRequests::initials($user->first_name, $user->last_name),
            'email' => $user->email,
            'verified_at' => $user->email_verified_at?->toIso8601String(),
            'institution' => $user->institution,
            'city' => $user->city,
            'country' => config("pct.countries.{$user->country}") ?? $user->country,
            'role' => $user->role,
            'admin' => $user->is_admin,
            'joined' => $user->created_at?->toIso8601String(),
            'active' => $user->last_active_at?->toIso8601String(),
            'protocols' => $user->protocols->sortByDesc('updated_at')->values()->map(fn (Protocol $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'status' => $p->status,
                'pct_id' => $p->status === 'published' ? $p->pct_id : null,
            ]),
        ];
    }
}
