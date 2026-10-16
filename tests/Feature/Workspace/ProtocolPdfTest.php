<?php

namespace Tests\Feature\Workspace;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ProtocolPdfTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_owners_download_the_registration_certificate(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);

        $response = $this->actingAs($owner)->get("/dashboard/protocols/{$protocol->id}/certificate.pdf")->assertOk();

        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringContainsString("{$protocol->pct_id}-certificate.pdf", $response->headers->get('Content-Disposition'));
        $this->assertStringStartsWith('%PDF', $response->getContent());
        if (getenv('PCT_KEEP_PDFS')) {
            file_put_contents(getenv('PCT_KEEP_PDFS').'/certificate.pdf', $response->getContent());
        }
    }

    public function test_only_owners_and_admins_get_a_certificate_and_only_for_registered_protocols(): void
    {
        $owner = $this->makeUser();
        $published = $this->makePublishedProtocol($owner);
        $draft = $this->makeProtocol($owner);

        $this->actingAs($this->makeUser())->get("/dashboard/protocols/{$published->id}/certificate.pdf")->assertForbidden();
        $this->actingAs($this->makeAdmin())->get("/dashboard/protocols/{$published->id}/certificate.pdf")->assertOk();
        $this->actingAs($owner)->get("/dashboard/protocols/{$draft->id}/certificate.pdf")->assertNotFound();
    }

    public function test_the_protocol_pdf_follows_the_protocol_page_access_rules(): void
    {
        $owner = $this->makeUser();
        $published = $this->makePublishedProtocol($owner);
        $embargoed = $this->makePublishedProtocol($owner, true);
        $draft = $this->makeProtocol($owner);
        $reader = $this->makeUser();

        $this->get("/database/view-protocol/{$published->id}/pdf")->assertRedirect('/login');
        $this->actingAs($reader)->get("/database/view-protocol/{$published->id}/pdf")->assertOk();
        $this->actingAs($reader)->get("/database/view-protocol/{$embargoed->id}/pdf")->assertForbidden();
        $this->actingAs($reader)->get("/database/view-protocol/{$draft->id}/pdf")->assertForbidden();

        $response = $this->actingAs($owner)->get("/database/view-protocol/{$draft->id}/pdf")->assertOk();
        $this->assertStringContainsString("draft-{$draft->id}-protocol.pdf", $response->headers->get('Content-Disposition'));
        if (getenv('PCT_KEEP_PDFS')) {
            file_put_contents(getenv('PCT_KEEP_PDFS').'/protocol.pdf', $response->getContent());
        }
    }

    public function test_readers_do_not_get_the_contact_email_in_the_pdf(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);

        $html = fn ($user) => $this->actingAs($user)->get("/database/view-protocol/{$protocol->id}/pdf")->getContent();

        // dompdf compresses text streams, so check the view data instead of the bytes.
        $this->withoutExceptionHandling();
        $captured = [];
        view()->composer('pdf.protocol', function ($view) use (&$captured) {
            $captured[] = collect($view->sections)->pluck('fields')->flatten(1)->pluck('label')->all();
        });
        $html($this->makeUser());
        $html($owner);

        $this->assertNotContains('Email', $captured[0]);
        $this->assertContains('Email', $captured[1]);
    }
}
