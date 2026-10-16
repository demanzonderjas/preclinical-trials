<?php

namespace Tests\Feature\Workspace;

use App\Mail\AmendmentSubmitted;
use App\Models\ActivityLog;
use App\Models\Amendment;
use App\Models\FeedbackPoint;
use App\Models\ImportLog;
use App\Models\Protocol;
use App\Services\AmendmentWorkflow;
use App\Services\ProtocolWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ProtocolFormTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_a_new_protocol_starts_with_the_researchers_own_details(): void
    {
        $user = $this->makeUser(['first_name' => 'Sanne', 'last_name' => 'de Vries', 'role' => 'Postdoc', 'institution' => 'UMC Utrecht', 'city' => 'Utrecht', 'country' => 'NL']);

        $this->actingAs($user)->get('/dashboard/add-protocol')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('workspace/protocol-form')
                ->where('protocol', null)
                ->where('values.contact_name', 'Sanne de Vries')
                ->where('values.contact_role', 'Postdoc')
                ->where('values.publish_name', false)
                ->where('values.study_centre.0.name', 'UMC Utrecht'));
    }

    public function test_the_first_autosave_creates_a_draft_and_later_ones_update_it(): void
    {
        $user = $this->makeUser();

        $created = $this->actingAs($user)->postJson('/dashboard/protocols', ['values' => ['title' => 'My new study', 'not_a_field' => 'x']])
            ->assertCreated()
            ->assertJsonStructure(['id', 'saved_at', 'progress' => ['percent', 'missing', 'required', 'next_step']]);
        $protocol = Protocol::findOrFail($created->json('id'));

        $this->assertSame('draft', $protocol->status);
        $this->assertSame('My new study', $protocol->title);
        $this->assertSame($user->email, $protocol->values()['contact_email'], 'profile defaults are saved with it');
        $this->assertArrayNotHasKey('not_a_field', $protocol->values());
        $this->assertSame('draft_created', ActivityLog::first()->type);

        $this->actingAs($user)->putJson("/dashboard/protocols/{$protocol->id}/answers", ['values' => ['species' => 'pig']])->assertOk();
        $this->assertSame('pig', $protocol->fresh('details')->values()['species']);
        $this->assertSame('My new study', $protocol->fresh()->title, 'answers not sent stay as they are');
    }

    public function test_autosave_marks_feedback_points_addressed_on_a_returned_protocol(): void
    {
        Mail::fake();
        $owner = $this->makeUser();
        $protocol = $this->makeProtocol($owner, 'submitted_for_publication');
        $workflow = app(ProtocolWorkflow::class);
        $point = $workflow->currentRound($protocol)->points()->create(['protocol_id' => $protocol->id, 'field_key' => 'title', 'body' => 'Mention the species.']);
        $workflow->returnWithFeedback($protocol, $this->makeAdmin(), 'One point');

        $this->actingAs($owner)->get("/dashboard/edit-protocol/{$protocol->id}")
            ->assertInertia(fn (Assert $page) => $page->where('feedback.0.field_key', 'title')->where('feedback.0.status', 'open'));

        $this->actingAs($owner)->putJson("/dashboard/protocols/{$protocol->id}/answers", ['values' => ['title' => 'Dapagliflozin in mice']])->assertOk();
        $this->assertSame(FeedbackPoint::ADDRESSED, $point->fresh()->status);
    }

    public function test_only_the_owner_edits_and_submitted_protocols_are_locked(): void
    {
        $owner = $this->makeUser();
        $draft = $this->makeProtocol($owner);
        $submitted = $this->makeProtocol($owner, 'submitted_for_publication');
        $published = $this->makePublishedProtocol($owner);

        $this->actingAs($this->makeUser())->get("/dashboard/edit-protocol/{$draft->id}")->assertForbidden();
        $this->actingAs($this->makeUser())->putJson("/dashboard/protocols/{$draft->id}/answers", ['values' => ['title' => 'x']])->assertForbidden();
        $this->actingAs($owner)->get("/dashboard/edit-protocol/{$submitted->id}")->assertRedirect("/database/view-protocol/{$submitted->id}");
        $this->actingAs($owner)->putJson("/dashboard/protocols/{$submitted->id}/answers", ['values' => ['title' => 'x']])->assertStatus(409);
        $this->actingAs($owner)->putJson("/dashboard/protocols/{$published->id}/answers", ['values' => ['title' => 'x']])->assertStatus(409);
        $this->actingAs($owner)->get("/dashboard/edit-protocol/{$published->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('protocol.status', 'published')->where('values.publish_name', true));
    }

    public function test_an_amendment_needs_a_change_and_a_reason_and_waits_for_review(): void
    {
        Mail::fake();
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);

        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/amend", ['values' => ['species' => 'mouse'], 'why_amendment' => 'Nothing'])
            ->assertSessionHas('error');
        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/amend", ['values' => ['species' => 'rat']])
            ->assertSessionHasErrors('why_amendment');
        $this->assertSame(0, $protocol->amendments()->count());

        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/amend", ['values' => ['species' => 'rat', 'title' => $protocol->title], 'why_amendment' => 'Rats after all'])
            ->assertRedirect("/database/view-protocol/{$protocol->id}");

        $amendment = $protocol->amendments()->sole();
        $this->assertSame(Amendment::PENDING, $amendment->status);
        $this->assertSame(['species' => 'rat'], $amendment->values, 'only what differs from the published version');
        $this->assertSame('Rats after all', $amendment->reason);
        $this->assertSame(['species'], ActivityLog::where('type', 'amendment_submitted')->firstOrFail()->data['fields']);
        Mail::assertSent(AmendmentSubmitted::class);

        // Readers keep the published version: no new status, value or public version yet.
        $this->assertSame('published', $protocol->fresh()->status);
        $this->assertSame('mouse', $this->detailValue($protocol, 'species'));
        $this->assertSame(0, $protocol->revisions()->count());
        $this->assertFalse(ActivityLog::where('type', 'amended')->exists());

        // While it is with the PCT team the researcher cannot change it.
        $this->actingAs($owner)->get("/dashboard/edit-protocol/{$protocol->id}")->assertRedirect("/database/view-protocol/{$protocol->id}");
        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/amend", ['values' => ['species' => 'pig'], 'why_amendment' => 'Pigs'])->assertStatus(409);
    }

    public function test_a_returned_amendment_continues_from_its_changes_and_can_be_withdrawn(): void
    {
        Mail::fake();
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);
        $amendment = app(AmendmentWorkflow::class)->submit($protocol, $owner, ['species' => 'rat'], 'Rats after all');
        app(AmendmentWorkflow::class)->return($amendment, $this->makeAdmin(), 'Say how many rats.');

        $this->actingAs($owner)->get("/dashboard/edit-protocol/{$protocol->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('values.species', 'rat')
                ->where('values.why_amendment', 'Rats after all')
                ->where('amendment.status', Amendment::RETURNED)
                ->where('amendment.message', 'Say how many rats.')
                ->where('amendment.fields', ['species']));

        // Sending it again keeps the earlier changes and adds the new ones.
        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/amend", ['values' => ['sum_of_animals' => '24'], 'why_amendment' => 'Rats, 24 of them'])
            ->assertRedirect();
        $this->assertSame(['species' => 'rat', 'sum_of_animals' => '24'], $amendment->fresh()->values);
        $this->assertSame(Amendment::PENDING, $amendment->fresh()->status);
        $this->assertSame(1, $protocol->amendments()->count(), 'the same amendment, sent again');

        $this->actingAs($owner)->delete("/dashboard/protocols/{$protocol->id}/amendment")->assertRedirect('/dashboard/manage-protocols');
        $this->assertSame(Amendment::WITHDRAWN, $amendment->fresh()->status);
        $this->assertSame('mouse', $this->detailValue($protocol, 'species'));
        $this->actingAs($owner)->get("/dashboard/edit-protocol/{$protocol->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('values.species', 'mouse')->where('amendment', null));
    }

    public function test_images_are_uploaded_for_own_protocols(): void
    {
        $owner = $this->makeUser();
        $draft = $this->makeProtocol($owner);

        $this->actingAs($this->makeUser())->post("/dashboard/protocols/{$draft->id}/images", ['image' => UploadedFile::fake()->image('a.png')])->assertForbidden();
        $filename = $this->actingAs($owner)->postJson("/dashboard/protocols/{$draft->id}/images", ['image' => UploadedFile::fake()->image('a.png')])->assertOk()->json('filename');

        $this->assertFileExists(public_path("images/protocols/$filename"));
        unlink(public_path("images/protocols/$filename"));
    }

    public function test_a_pris_file_starts_a_new_draft(): void
    {
        $owner = $this->makeUser();
        $pris = ['content' => [
            'title' => 'PRIS study',
            'animalSex' => 'F',
            'animalCount' => 24,
            'stage' => 1,
            'species' => ['description' => 'Mice'],
            'supportSources' => ['selection' => [2]],
            'groups' => [['name' => 'Vehicle', 'count' => 12, 'type' => ['selection' => 1]]],
            'date' => ['start' => '2027-03-01T00:00:00Z'],
            'randomisation' => ['selection' => 1],
        ]];

        $response = $this->actingAs($owner)->post('/dashboard/protocols/import', ['file' => UploadedFile::fake()->createWithContent('pris.json', json_encode($pris))]);

        $protocol = $owner->protocols()->latest('id')->firstOrFail();
        $response->assertRedirect("/dashboard/edit-protocol/{$protocol->id}")->assertSessionHas('success');
        $values = $protocol->fresh('details')->values();
        $this->assertSame('PRIS study', $values['title']);
        $this->assertSame('female', $values['sex']);
        $this->assertSame('mouse', $values['species']);
        $this->assertSame('study_stage_2_value', $values['study_stage']);
        $this->assertSame(['grants'], $values['financial_support']);
        $this->assertSame('2027-03-01', $values['start_date']);
        $this->assertSame('yes', $values['randomisation']);
        $this->assertEquals([(object) ['type' => 'control', 'intervention' => 'Vehicle', 'number' => 12]], $values['study_arms']);
        $this->assertSame('pris', ImportLog::where('protocol_id', $protocol->id)->value('type'));
        $this->assertSame(['source' => 'PRIS'], ActivityLog::where('type', 'imported')->firstOrFail()->data);
    }

    public function test_an_apafis_file_is_imported_and_translated(): void
    {
        Http::fake(['api.openai.com/*' => Http::response(['choices' => [['message' => ['content' => 'Translated']]]])]);
        $owner = $this->makeUser();
        $xml = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<Formulaire_Apafis>
  <InformationsGenerales><TitreProjet>Étude des souris</TitreProjet></InformationsGenerales>
  <ProceduresExperimentales><ObjetsVises><PointA>false</PointA><PointB>true</PointB><PointC>false</PointC><PointD>false</PointD><PointE>false</PointE><PointF>false</PointF><PointG>false</PointG></ObjetsVises></ProceduresExperimentales>
  <InformationsAdministrativesEtReglementaires>
    <Animaux>
      <ListeAnimaux><Rats>false</Rats><Souris>true</Souris></ListeAnimaux>
      <OrigineAnimaux><AnimauxReutilisesProjetPrecedent>false</AnimauxReutilisesProjetPrecedent></OrigineAnimaux>
      <AnimauxUtilises><NombreAnimauxUtilises>40</NombreAnimauxUtilises></AnimauxUtilises>
    </Animaux>
    <EtablissementUtilisateur><ResponsablesMiseEnOeuvre><CoordonneesResponsablesMiseEnOeuvre><Email>a@example.test</Email></CoordonneesResponsablesMiseEnOeuvre><CoordonneesResponsablesMiseEnOeuvre><Email>b@example.test</Email></CoordonneesResponsablesMiseEnOeuvre></ResponsablesMiseEnOeuvre></EtablissementUtilisateur>
  </InformationsAdministrativesEtReglementaires>
</Formulaire_Apafis>
XML;

        $this->actingAs($owner)->post('/dashboard/protocols/import', ['file' => UploadedFile::fake()->createWithContent('apafis.xml', $xml)])->assertSessionHas('success');

        $values = $owner->protocols()->latest('id')->firstOrFail()->values();
        $this->assertSame('Translated', $values['title']);
        $this->assertSame('study_stage_2_value', $values['study_stage']);
        $this->assertSame('mouse', $values['species']);
        $this->assertSame('yes', $values['exclusive_animal_use']);
        $this->assertSame('40', $values['sum_of_animals']);
        $this->assertSame('a@example.test', $values['contact_email']);
        $this->assertSame('not_started', $values['study_status']);
    }

    public function test_an_unreadable_file_is_refused(): void
    {
        $this->actingAs($this->makeUser())->from('/dashboard/add-protocol')
            ->post('/dashboard/protocols/import', ['file' => UploadedFile::fake()->createWithContent('x.json', 'not json')])
            ->assertRedirect('/dashboard/add-protocol')
            ->assertSessionHasErrors('file');
        $this->assertSame(0, Protocol::count());
    }

    public function test_answers_are_encrypted_at_rest(): void
    {
        $user = $this->makeUser();
        $id = $this->actingAs($user)->postJson('/dashboard/protocols', ['values' => ['title' => 'A secret plan']])->json('id');

        $raw = \Illuminate\Support\Facades\DB::table('details')->where(['protocol_id' => $id, 'key' => 'title'])->value('value');
        $this->assertStringNotContainsString('A secret plan', $raw);
        $this->assertSame('A secret plan', Protocol::find($id)->title);
    }
}
