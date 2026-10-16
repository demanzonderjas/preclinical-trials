<?php

namespace Tests\Feature\Admin;

use App\Models\ImportLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class StatisticsTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_the_figures_cover_protocols_users_and_imports(): void
    {
        $admin = $this->makeAdmin();
        $owner = $this->makeUser();
        $this->makePublishedProtocol($owner);
        $this->makePublishedProtocol($owner, true);
        $draft = $this->makeProtocol($owner);
        $this->makeProtocol($owner, 'submitted_for_publication');
        ImportLog::create(['protocol_id' => $draft->id])->forceFill(['type' => 'pris'])->save();

        $this->actingAs($admin)->get('/admin/statistics')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/statistics')
                ->where('lifecycle', ['submitted' => 3, 'published' => 2, 'rejected' => 0, 'awaiting' => 1])
                ->where('embargo', ['embargoed' => 1, 'public' => 1])
                ->has('per_month', 12)
                ->where('per_month.0.count', 2)
                ->where('users.total', 2)
                ->where('imports.counts.0', ['source' => 'PRIS', 'count' => 1])
                ->where('imports.recent.0.result', 'Draft created'));
    }

    public function test_exports_are_csv_and_pdf_without_formulas(): void
    {
        $admin = $this->makeAdmin();
        $this->makeProtocol($this->makeUser(['institution' => '=HYPERLINK("http://evil")']), 'draft', ['title' => '@SUM(1+1)']);

        $protocols = $this->actingAs($admin)->get('/admin/statistics/protocols.csv')->assertOk();
        $this->assertStringContainsString('text/csv', $protocols->headers->get('Content-Type'));
        $csv = $protocols->streamedContent();
        $this->assertStringContainsString("'@SUM(1+1)", $csv);
        $this->assertStringContainsString("'=HYPERLINK", $csv);

        $users = $this->actingAs($admin)->get('/admin/statistics/users.csv')->assertOk()->streamedContent();
        $this->assertStringContainsString('Email verified', $users);

        $pdf = $this->actingAs($admin)->get('/admin/statistics/statistics.pdf')->assertOk();
        $this->assertStringStartsWith('%PDF', $pdf->getContent());
    }

    public function test_researchers_are_kept_out(): void
    {
        $user = $this->makeUser();
        $this->actingAs($user)->get('/admin/statistics')->assertForbidden();
        $this->actingAs($user)->get('/admin/statistics/users.csv')->assertForbidden();
    }
}
