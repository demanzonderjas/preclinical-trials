<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/**
 * PRIS exports as they come: the format the legacy importer read, saved in other encodings,
 * and older or hand-edited variants (tests/fixtures/pris). Files that cannot be imported get a
 * message that says why.
 */
class PrisImportTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = $this->makeUser();
    }

    private function upload(string $name, ?string $content = null): TestResponse
    {
        $content ??= file_get_contents(base_path("tests/fixtures/pris/$name"));

        return $this->actingAs($this->owner)
            ->from('/dashboard/manage-protocols')
            ->post('/dashboard/protocols/import', ['file' => UploadedFile::fake()->createWithContent($name, $content)]);
    }

    /** @return array<string, mixed> */
    private function imported(TestResponse $response): array
    {
        $protocol = $this->owner->protocols()->latest('id')->firstOrFail();
        $response->assertRedirect("/dashboard/edit-protocol/{$protocol->id}")->assertSessionHas('success');

        return $protocol->fresh('details')->values();
    }

    public function test_a_full_export_fills_every_pris_answer(): void
    {
        $values = $this->imported($this->upload('export.json'));

        $this->assertSame('Remote ischemic conditioning before cardiac surgery in pigs', $values['title']);
        $this->assertSame('RIC-PIG', $values['short_title']);
        $this->assertSame('Cardiology', $values['research_field']);
        $this->assertSame('study_stage_2_value', $values['study_stage']);
        $this->assertSame('pig', $values['species']);
        $this->assertSame('Landrace - Topigs - SUS; Yorkshire - Topigs - SUS', $values['strain']);
        $this->assertSame('female', $values['sex']);
        $this->assertEquals(36, $values['sum_of_animals']);
        $this->assertEquals('AVD1150020174264', $values['application_number']);
        $this->assertSame('2027-04-01', $values['start_date']);
        $this->assertSame('2028-03-31', $values['end_date']);
        $this->assertSame('Troponin T at 24 hours', $values['primary_readout_parameter']);
        $this->assertEquals(['sham', 'control', 'intervention'], array_map(fn ($arm) => $arm->type, $values['study_arms']));
        $this->assertSame('no', $values['placebo_controlled']);
        $this->assertSame('yes', $values['randomisation']);
        $this->assertSame('yes', $values['investigators_blinded_intervention']);
        $this->assertSame('yes_partially', $values['investigators_blinded_assessment']);
        $this->assertSame('yes', $values['sample_size_calculation']);
        $this->assertSame('yes', $values['exclusive_animal_use']);
        $this->assertSame(['surgery'], $values['intervention_type']);
        $this->assertSame(['investigator_driven', 'grants'], $values['financial_support']);
        $this->assertEquals([(object) ['name' => 'Amsterdam UMC', 'city' => 'Amsterdam', 'country' => 'NL']], $values['study_centre']);
        $this->assertSame('Dr. Lotte Jansen', $values['contact_name']);
    }

    public function test_exports_in_other_encodings_and_line_endings_read_the_same(): void
    {
        foreach (['export-utf8-bom-crlf.json', 'export-utf16le.json', 'export-windows-1252.json'] as $file) {
            $values = $this->imported($this->upload($file));

            $this->assertSame('Remote ischemic conditioning before cardiac surgery in pigs', $values['title'], $file);
            $this->assertSame('Dr. Lotte Jansen-Müller', $values['contact_name'], $file);
            $this->assertSame('Cardiologie & hartchirurgie (cœur)', $values['research_field'], $file);
            $this->assertSame('pig', $values['species'], $file);
        }
    }

    public function test_older_and_hand_edited_exports_are_read_leniently(): void
    {
        $values = $this->imported($this->upload('older-flat.json'));

        // No "content" wrapper, snake_case names, numbers and choices as text, words for choices.
        $this->assertSame('Neuroprotection by xenon after neonatal asphyxia in rats – a randomised study', $values['title']);
        $this->assertSame('XENON', $values['short_title']);
        $this->assertSame('Xenon reduces brain injury after asphyxia.', $values['hypothesis']);
        $this->assertSame('Neurology, Neonatology', $values['research_field']);
        $this->assertSame('study_stage_1_value', $values['study_stage']);
        $this->assertSame('rat', $values['species']);
        $this->assertSame('both', $values['sex']);
        $this->assertEquals(48, $values['sum_of_animals']);
        // Day-first dates, as written in Europe.
        $this->assertSame('2026-09-01', $values['start_date']);
        $this->assertSame('2027-08-31', $values['end_date']);
        $this->assertEquals(['control', 'control', 'intervention'], array_map(fn ($arm) => $arm->type, $values['study_arms']));
        $this->assertEquals(16, $values['study_arms'][0]->number);
        $this->assertSame('yes', $values['randomisation']);
        $this->assertSame('no', $values['sample_size_calculation']);
        $this->assertSame('yes', $values['exclusive_animal_use']);
        $this->assertSame('yes', $values['placebo_controlled']);
        $this->assertSame(['grants'], $values['financial_support']);
        $this->assertSame(['compound', 'other'], $values['intervention_type']);
        $this->assertSame('Gas inhalation', $values['other_intervention_type']);
        // Every centre; a country name becomes its code.
        $this->assertEquals([
            (object) ['name' => 'Universitair Medisch Centrum Utrecht', 'city' => 'Utrecht', 'country' => 'NL'],
            (object) ['name' => 'Charité', 'city' => 'Berlin', 'country' => 'DE'],
        ], $values['study_centre']);
    }

    public function test_a_list_of_exports_imports_the_first_and_an_unknown_species_becomes_other(): void
    {
        $values = $this->imported($this->upload('list.json', json_encode([
            ['content' => ['title' => 'Zebra finch song learning', 'species' => ['description' => 'Zebra finches'], 'stage' => 0]],
            ['content' => ['title' => 'Second one']],
        ])));

        $this->assertSame('Zebra finch song learning', $values['title']);
        $this->assertSame('other', $values['species']);
        $this->assertSame('Zebra finches', $values['other_species']);
        $this->assertSame('study_stage_1_value', $values['study_stage']);
        // Answers PRIS did not give stay empty instead of defaulting to yes or no.
        $this->assertArrayNotHasKey('randomisation', $values);
        $this->assertArrayNotHasKey('sample_size_calculation', $values);
    }

    public function test_an_answer_that_cannot_be_read_is_skipped_and_named(): void
    {
        $response = $this->upload('odd.json', json_encode(['content' => [
            'title' => 'Odd dates',
            'date' => ['start' => '31-02-2027', 'end' => '2028-01-31'],
        ]]));

        $values = $this->imported($response);
        $this->assertSame('Odd dates', $values['title']);
        $this->assertArrayNotHasKey('start_date', $values);
        $this->assertSame('2028-01-31', $values['end_date']);
        $this->assertStringContainsString('could not be read and are left empty: start date.', session('success'));
    }

    /**
     * @return array<string, array{0: string, 1: string}>
     */
    public static function unreadableFiles(): array
    {
        return [
            'empty' => ["  \n", 'The file is empty.'],
            'PDF' => ["%PDF-1.7\n%âãÏÓ\n1 0 obj", 'This file is a PDF document.'],
            'Word document' => ["PK\x03\x04\x14\x00\x06\x00", 'This file is a ZIP archive or an Office document'],
            'CSV' => ["title;stage;species\nA study;1;Mice\n", 'This file is a spreadsheet or CSV file'],
            'damaged JSON' => ['{"content": {"title": "Cut off', 'This looks like a PRIS export (.json), but it is damaged or incomplete'],
            'other JSON' => ['{"name": "pct", "version": "1.0.0", "scripts": {}}', 'This JSON file is not a PRIS protocol export: it has none of the PRIS fields (such as title, hypotheses or animalCount), only: name, version, scripts.'],
            'other XML' => ['<?xml version="1.0"?><protocol><title>x</title></protocol>', 'This XML file is not an APAFiS project form (it starts with <protocol> instead of <Formulaire_Apafis>).'],
            'damaged XML' => ['<?xml version="1.0"?><Formulaire_Apafis><Informations', 'This looks like an APAFiS form (.xml), but it is damaged or incomplete'],
        ];
    }

    #[DataProvider('unreadableFiles')]
    public function test_a_file_that_cannot_be_imported_says_why(string $content, string $message): void
    {
        $this->upload('export.json', $content)
            ->assertRedirect('/dashboard/manage-protocols')
            ->assertSessionHasErrors('file');
        $this->assertStringContainsString($message, session('errors')->first('file'));

        $this->assertSame(0, $this->owner->protocols()->count());
    }
}
