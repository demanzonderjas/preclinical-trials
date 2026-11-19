<?php

namespace Tests\Feature\Frontend;

use App\Models\User;
use App\Services\PublicRegister;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/** A protocol with several study centres shows every one of them, not only the first. */
class StudyCentresTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private const CENTRES = [
        ['name' => 'Ankara University', 'city' => 'Ankara', 'country' => 'TR'],
        // Older rows: blank rows in between and escaped characters.
        ['name' => '', 'city' => '', 'country' => ''],
        ['name' => 'Smith &amp; Jones Lab', 'city' => 'Berlin', 'country' => 'DE'],
    ];

    public function test_the_register_summary_lists_every_centre(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);
        $protocol->addDetailsToDatabase(['study_centre' => self::CENTRES]);

        $summary = PublicRegister::summarize($protocol->fresh('details'));

        $this->assertSame([
            ['name' => 'Ankara University', 'city' => 'Ankara', 'country' => 'TR', 'country_name' => 'Turkey'],
            ['name' => 'Smith & Jones Lab', 'city' => 'Berlin', 'country' => 'DE', 'country_name' => 'Germany'],
        ], $summary['centres']);
        // The first centre stays where it was.
        $this->assertSame('Ankara University', $summary['centre_name']);
        $this->assertSame('TR', $summary['country']);
        $this->assertSame('Ankara University, Ankara, Turkey; Smith & Jones Lab, Berlin, Germany', PublicRegister::centreLine($summary['centres']));
    }

    public function test_the_countries_figure_counts_embargoed_protocols_without_naming_them(): void
    {
        $owner = $this->makeUser();
        $this->makePublishedProtocol($owner)->addDetailsToDatabase(['study_centre' => [['name' => 'Lab', 'city' => 'Utrecht', 'country' => 'NL']]]);
        $this->makePublishedProtocol($owner, embargo: true)->addDetailsToDatabase(['study_centre' => [['name' => 'Secret lab', 'city' => 'Ankara', 'country' => 'TR']]]);
        PublicRegister::forget();

        $figures = app(PublicRegister::class)->figures();

        $this->assertSame(2, $figures['countries']);
        $this->assertSame(['Netherlands'], $figures['top_countries']);
    }

    public function test_older_storage_shapes_read_as_centres(): void
    {
        $this->assertSame([], PublicRegister::centres(null));
        $this->assertSame([], PublicRegister::centres(''));
        $this->assertSame([], PublicRegister::centres([['name' => null, 'city' => null, 'country' => null]]));
        // As json_decode returns them: objects, a single centre, a list keyed "0", "1".
        $this->assertSame('Lalu Lab', PublicRegister::centres([(object) ['name' => 'Lalu Lab', 'city' => 'Ottawa', 'country' => 'CA']])[0]['name']);
        $this->assertSame('Canada', PublicRegister::centres((object) ['name' => 'Lalu Lab', 'city' => 'Ottawa', 'country' => 'CA'])[0]['country_name']);
        $this->assertCount(2, PublicRegister::centres((object) ['0' => (object) ['name' => 'A'], '1' => (object) ['name' => 'B']]));
        // A code without a name shows as itself.
        $this->assertSame('XX', PublicRegister::centres([['name' => 'A', 'city' => '', 'country' => 'XX']])[0]['country_name']);
    }

    public function test_the_database_search_finds_and_exports_every_centre(): void
    {
        $protocol = $this->makePublishedProtocol($this->makeUser());
        $protocol->addDetailsToDatabase(['study_centre' => self::CENTRES]);
        PublicRegister::forget();

        $this->get('/database?q=Jones&in=centre')->assertInertia(fn (Assert $page) => $page
            ->where('results.total', 1)
            ->has('results.data.0.centres', 2)
            ->where('results.data.0.centres.1.name', 'Smith & Jones Lab'));

        $csv = $this->actingAs(User::factory()->create())->get('/database/export.csv')->assertOk()->streamedContent();
        $this->assertStringContainsString('"Ankara University; Smith & Jones Lab","Ankara; Berlin","Turkey; Germany"', $csv);
    }

    public function test_the_protocol_page_and_my_protocols_show_every_centre(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);
        $protocol->addDetailsToDatabase(['study_centre' => self::CENTRES]);

        $this->actingAs($this->makeUser())->get("/database/view-protocol/{$protocol->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('protocol.centre', 'Ankara University; Smith & Jones Lab')
                ->has('protocol.details.study_centre', 3)
                ->where('protocol.countries', ['TR' => 'Turkey', 'DE' => 'Germany']));

        $this->actingAs($owner)->get('/dashboard/manage-protocols')
            ->assertInertia(fn (Assert $page) => $page->where('protocols.0.centre', 'Ankara University · Ankara, TR; Smith & Jones Lab · Berlin, DE'));
    }

    public function test_the_certificate_names_every_centre(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);
        $protocol->addDetailsToDatabase(['study_centre' => self::CENTRES]);

        $record = (new \ReflectionMethod(\App\Http\Controllers\Pages\ProtocolPdfController::class, 'record'))
            ->invoke(app(\App\Http\Controllers\Pages\ProtocolPdfController::class), $protocol->fresh('details'));

        $this->assertSame('Ankara University, Ankara, Turkey; Smith & Jones Lab, Berlin, Germany', $record['centre']);
        $this->actingAs($owner)->get("/dashboard/protocols/{$protocol->id}/certificate.pdf")->assertOk();
    }

    protected function tearDown(): void
    {
        PublicRegister::forget();
        parent::tearDown();
    }
}
