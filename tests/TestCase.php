<?php

namespace Tests;

use App\Services\TwoFactor;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /** Admins acting in a test have passed the admin area's two-factor step; tests of that step turn this off. */
    protected bool $passAdminTwoFactor = true;

    public function actingAs(Authenticatable $user, $guard = null)
    {
        if ($this->passAdminTwoFactor && $user->is_admin) {
            $this->withSession([TwoFactor::SESSION_KEY => $user->getAuthIdentifier()]);
        }

        return parent::actingAs($user, $guard);
    }
}
