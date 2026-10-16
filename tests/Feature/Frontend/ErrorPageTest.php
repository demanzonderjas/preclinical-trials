<?php

namespace Tests\Feature\Frontend;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_unknown_pages_get_the_a2_error_page(): void
    {
        $this->get('/no-such-page')->assertNotFound()->assertInertia(fn (Assert $page) => $page->component('error')->where('status', 404));
        $this->actingAs($this->makeUser())->get('/dashboard/no-such-page')->assertNotFound()->assertInertia(fn (Assert $page) => $page->component('error'));
    }

    public function test_forbidden_pages_and_json_requests(): void
    {
        $this->actingAs($this->makeUser())->get('/admin/protocols')->assertForbidden()->assertInertia(fn (Assert $page) => $page->component('error')->where('status', 403));
        $this->getJson('/no-such-page')->assertNotFound()->assertJsonStructure(['message']);
        $this->get('/api/no-such-endpoint')->assertNotFound();
    }
}
