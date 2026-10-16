<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $this->get('/register')->assertRedirect('/create-account');
        $this->get('/create-account')->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'institution' => 'UMC Utrecht',
            'country' => 'NL',
            'city' => 'Utrecht',
            'role' => 'Postdoc',
            'email' => 'test@example.com',
            'password' => 'A-strong-Passw0rd',
            'password_confirmation' => 'A-strong-Passw0rd',
            'terms_conditions' => true,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/verify-email');
    }
}
