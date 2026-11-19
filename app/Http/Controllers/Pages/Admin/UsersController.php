<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Protocol;
use App\Models\User;
use App\Services\UserRegions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
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

    /** The country filter value for accounts without a country (most legacy accounts). */
    private const NO_COUNTRY = 'none';

    public function index(Request $request): Response
    {
        $filter = in_array($request->query('filter'), self::FILTERS, true) ? $request->query('filter') : 'all';
        $q = trim((string) $request->query('q'));
        [$country, $institution] = $this->audience($request);

        $users = $this->filtered($this->inAudience(User::query(), $country, $institution), $filter)
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
            'filters' => ['filter' => $filter, 'q' => $q, 'country' => $country, 'institution' => $institution],
            // The chips count within the chosen country and institution, so "Verified" reads as
            // "verified researchers of this institute".
            'counts' => collect(self::FILTERS)->mapWithKeys(fn ($f) => [$f => $this->filtered($this->inAudience(User::query(), $country, $institution), $f)->count()]),
            'countries' => $this->countryOptions(),
            'regions' => UserRegions::figures(),
            'selected' => $selected ? $this->details($selected) : null,
            'temporaryPassword' => $request->session()->get('temporary_password'),
        ]);
    }

    /** Institution suggestions for the filter: distinct values containing the typed text, with counts. */
    public function institutions(Request $request): JsonResponse
    {
        [$country] = $this->audience($request);
        $q = trim((string) $request->query('q'));
        $options = $this->inAudience(User::query(), $country, $q)
            ->where('institution', '<>', '')
            ->selectRaw('trim(institution) as value, count(*) as total')
            ->groupByRaw('trim(institution)')
            ->orderByDesc('total')
            ->orderBy('value')
            ->limit(15)
            ->get()
            ->map(fn ($row) => ['value' => $row->value, 'count' => (int) $row->total]);

        return response()->json([
            'options' => $options,
            'contains' => $q === '' ? null : $this->inAudience(User::query(), $country, $q)->count(),
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

    /** @return array{0: string, 1: string} the country ('' for any, 'none' for no country) and the institution text */
    private function audience(Request $request): array
    {
        $country = $request->query('country');
        $country = is_string($country) && preg_match('/^[A-Za-z0-9]{1,20}$/', $country) ? ($country === self::NO_COUNTRY ? $country : strtoupper($country)) : '';
        $institution = $request->query('institution');

        return [$country, is_string($institution) ? mb_substr(trim($institution), 0, 255) : ''];
    }

    /** Country and institution: the institution matches when it contains the text, case-insensitively. */
    private function inAudience(Builder $query, string $country, string $institution): Builder
    {
        return $query
            ->when($country === self::NO_COUNTRY, fn (Builder $q) => $q->where(fn (Builder $q) => $q->whereNull('country')->orWhere('country', '')))
            ->when($country !== '' && $country !== self::NO_COUNTRY, fn (Builder $q) => $q->where('country', $country))
            ->when($institution !== '', fn (Builder $q) => $q->whereRaw('lower(institution) like ?', ['%'.addcslashes(mb_strtolower($institution), '%_\\').'%']));
    }

    /** Every country present in the data, by name, with "No country set" first. */
    private function countryOptions(): array
    {
        $rows = User::query()->selectRaw("nullif(country, '') as code, count(*) as total")->groupByRaw("nullif(country, '')")->get();
        $none = (int) $rows->firstWhere('code', null)?->total;

        return collect([['value' => self::NO_COUNTRY, 'label' => 'No country set', 'count' => $none]])
            ->concat($rows->whereNotNull('code')
                ->map(fn ($row) => ['value' => $row->code, 'label' => config("pct.countries.{$row->code}") ?? $row->code, 'count' => (int) $row->total])
                ->sortBy('label', SORT_NATURAL | SORT_FLAG_CASE)
                ->values())
            ->all();
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
