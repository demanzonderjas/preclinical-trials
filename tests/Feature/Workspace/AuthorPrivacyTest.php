<?php

namespace Tests\Feature\Workspace;

use App\Models\Channel;
use App\Models\User;
use App\Services\Inbox;
use App\Services\ProtocolSchema;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/**
 * Who wrote a protocol stays private unless the author published their name (F11), as the
 * legacy site kept every contact detail from other users.
 */
class AuthorPrivacyTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private User $owner;

    private User $reader;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->owner = $this->makeUser(['first_name' => 'Sanne', 'last_name' => 'de Vries', 'institution' => 'UMC Utrecht', 'role' => 'Postdoc']);
        $this->reader = $this->makeUser(['first_name' => 'Curious', 'last_name' => 'Reader', 'institution' => 'Karolinska Institutet', 'role' => 'PhD candidate']);
    }

    public function test_asking_the_author_does_not_reveal_who_they_are(): void
    {
        $protocol = $this->makePublishedProtocol($this->owner);
        $protocol->addDetailsToDatabase(['publish_name' => false]);

        $response = $this->actingAs($this->reader)->post("/database/view-protocol/{$protocol->id}/ask");
        $channel = Channel::where('questioner_id', $this->reader->id)->sole();
        $response->assertRedirect("/dashboard/messages/{$channel->id}");
        Inbox::for($this->owner)->post($channel, 'Happy to explain.', notify: false);

        $page = $this->actingAs($this->reader)->get("/dashboard/messages/{$channel->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('conversation.name', 'Protocol author')
                ->where('conversation.initials', 'PA')
                ->where('conversation.affiliation', null)
                ->where('conversation.role', null)
                ->where('conversation.messages.0.author', 'Protocol author')
                ->where('conversation.messages.0.initials', 'PA'));
        $props = json_encode($page->viewData('page')['props']);
        foreach (['Sanne', 'de Vries', 'UMC Utrecht', 'Postdoc', 'sanne@example.test'] as $private) {
            $this->assertStringNotContainsString($private, $props, "\"$private\" reached the person asking");
        }

        $this->actingAs($this->reader)->get('/dashboard/messages')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('conversations.0.name', 'Protocol author'));

        // The author still sees who asks.
        $this->actingAs($this->owner)->get("/dashboard/messages/{$channel->id}")
            ->assertInertia(fn (Assert $page) => $page->where('conversation.name', $this->reader->name)->where('conversation.messages.0.author', 'You'));
    }

    public function test_a_published_name_is_the_contact_name_and_nothing_more(): void
    {
        $protocol = $this->makePublishedProtocol($this->owner);
        $protocol->addDetailsToDatabase(['publish_name' => true, 'contact_name' => 'Dr. S. de Vries']);
        $channel = Channel::create(['protocol_id' => $protocol->id, 'protocol_owner_id' => $this->owner->id, 'questioner_id' => $this->reader->id]);
        Inbox::for($this->owner)->post($channel, 'Hello', notify: false);

        $this->actingAs($this->reader)->get("/dashboard/messages/{$channel->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('conversation.name', 'Dr. S. de Vries')
                ->where('conversation.affiliation', null)
                ->where('conversation.role', null)
                ->where('conversation.messages.0.author', 'Dr. S. de Vries'));
    }

    public function test_protocols_without_a_stored_choice_keep_the_name_private(): void
    {
        // Before A2 (and from ILES) no publish_name was stored; the legacy site hid the name.
        $protocol = $this->makePublishedProtocol($this->owner);
        $this->assertNull($protocol->details->firstWhere('key', 'publish_name'));
        $this->assertFalse($protocol->publishes_name);

        $this->actingAs($this->reader)->get("/database/view-protocol/{$protocol->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->missing('protocol.details.contact_name')->missing('protocol.details.contact_email'));

        $this->withoutExceptionHandling();
        $labels = [];
        view()->composer('pdf.protocol', function ($view) use (&$labels) {
            $labels = collect($view->sections)->flatMap(fn ($section) => [...($section['fields'] ?? []), ...collect($section['groups'] ?? [])->flatMap(fn ($group) => $group['fields'])])->pluck('label')->all();
        });
        $this->actingAs($this->reader)->get("/database/view-protocol/{$protocol->id}/pdf")->assertOk();
        $this->assertNotContains(ProtocolSchema::field('contact_name')['label'], $labels);

        // The author opens the form with the switch off, and can turn it on.
        $this->actingAs($this->owner)->get("/dashboard/edit-protocol/{$protocol->id}")
            ->assertInertia(fn (Assert $page) => $page->where('values.publish_name', false));
    }

    public function test_the_external_api_does_not_reveal_linked_embargoed_or_unpublished_protocols(): void
    {
        $public = $this->makePublishedProtocol($this->owner);
        $embargoed = $this->makePublishedProtocol($this->owner, true);
        $draft = $this->makeProtocol($this->owner, 'draft', ['title' => 'Secret draft']);
        $otherPublic = $this->makePublishedProtocol($this->owner);
        $embargoed->addDetailsToDatabase(['title' => 'Secret embargoed study']);
        $public->linkedTo()->attach([$embargoed->id, $draft->id, $otherPublic->id]);

        $body = $this->withHeaders(['Authorization' => 'Bearer test-external-key'])->getJson('/api/external/viewable-protocols')->assertOk()->getContent();

        $this->assertStringNotContainsString('Secret embargoed study', $body);
        $this->assertStringNotContainsString('Secret draft', $body);
        $item = collect(json_decode($body, true)['protocols'])->firstWhere('id', $public->id);
        $this->assertSame([$otherPublic->id], array_column($item['linked'], 'id'));
        $this->assertStringNotContainsString('sanne@example.test', json_encode($item['linked']), 'no contact details of linked protocols');
    }

    public function test_link_and_image_answers_are_cleaned_on_save(): void
    {
        $name = '1760000000-AbCdEfGhIjKlMnOp.png';

        $this->assertSame(
            ['link_to_publication' => '', 'additional_information_images' => [$name]],
            ProtocolSchema::cleanAnswers(['link_to_publication' => ' javascript:alert(1)', 'additional_information_images' => [$name, '../../.env', 'https://evil.example/x.png']])
        );
        $this->assertSame(['link_to_publication' => 'PubMed 42493553'], ProtocolSchema::cleanAnswers(['link_to_publication' => 'PubMed 42493553']));
    }
}
