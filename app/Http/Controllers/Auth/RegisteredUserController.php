<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /** Suggested roles; the column stays free text, as on the legacy form. */
    public const ROLES = ['PhD student', 'Postdoc', 'Principal investigator', 'Research technician', 'Veterinarian', 'Animal welfare body / ethics committee', 'Other'];

    /**
     * Handle an incoming registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'institution' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'country' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'password' => ['required', Rules\Password::defaults()],
            'terms_conditions' => ['required', 'boolean']
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'institution' => $request->institution,
            'email' => $request->email,
            'country' => $request->country,
            'city' => $request->city,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect('/verify-email');
    }

    /**
     * The A2 "create your account" page.
     */
    public function create(Request $request)
    {
        if ($request->user()) {
            return redirect('/dashboard');
        }

        return Inertia::render('auth/register', [
            'countries' => collect(config('pct.countries'))->map(fn ($name, $code) => ['value' => $code, 'label' => $name])->values(),
            'roles' => self::ROLES,
        ]);
    }
}
