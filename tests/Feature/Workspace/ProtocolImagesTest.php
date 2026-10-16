<?php

namespace Tests\Feature\Workspace;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ProtocolImagesTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    /** Same-site requests from the app, which Sanctum gives a session. */
    private const BROWSER = ['Accept' => 'application/json', 'Referer' => 'http://localhost/dashboard'];

    private array $created = [];

    protected function tearDown(): void
    {
        foreach ($this->created as $file) {
            File::delete(public_path("images/protocols/$file"));
        }
        parent::tearDown();
    }

    public function test_a_researcher_can_remove_an_image_they_just_uploaded_but_not_someone_elses(): void
    {
        $owner = $this->makeUser();
        $filename = $this->actingAs($owner)->post('/api/protocol/upload-image', ['image' => UploadedFile::fake()->image('plot.png')], self::BROWSER)
            ->assertOk()->json('filename');
        $this->created[] = $filename;
        $this->assertFileExists(public_path("images/protocols/$filename"));

        // Another session (another user) cannot delete it.
        $this->flushSession();
        $this->actingAs($this->makeUser())->post('/api/protocol/delete-image', ['filename' => $filename], self::BROWSER)
            ->assertOk()->assertJson(['success' => false]);
        $this->assertFileExists(public_path("images/protocols/$filename"));
    }

    public function test_the_uploader_can_remove_it_in_the_same_session(): void
    {
        $owner = $this->makeUser();
        $this->actingAs($owner);
        $filename = $this->post('/api/protocol/upload-image', ['image' => UploadedFile::fake()->image('plot.png')], self::BROWSER)->json('filename');
        $this->created[] = $filename;

        $this->post('/api/protocol/delete-image', ['filename' => $filename], self::BROWSER)->assertJson(['success' => true]);
        $this->assertFileDoesNotExist(public_path("images/protocols/$filename"));
    }
}
