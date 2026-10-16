<?php

namespace Tests\Feature\Characterization;

use App\Models\Ambassador;
use App\Models\EmbargoExtension;
use App\Models\FaqCategory;
use App\Models\FaqItem;
use App\Models\NewsItem;
use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	/** @var array<string, int> */
	protected $ids = [];

	protected function setUp(): void
	{
		parent::setUp();
		Mail::fake();
		$this->seedRecords();
	}

	protected function seedRecords(): void
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true);
		$extension = new EmbargoExtension(['reason' => 'More time']);
		$protocol->embargoExtensions()->save($extension);

		$news = new NewsItem(['title' => 'News', 'status' => 'published']);
		$news->save();

		$category = new FaqCategory();
		$category->name = 'General';
		$category->save();
		$faq = new FaqItem(['title' => 'Q', 'content' => 'A', 'status' => 'published']);
		$faq->faq_category_id = $category->id;
		$faq->save();

		$ambassador = Ambassador::create([
			'name' => 'Amb', 'description' => 'D', 'geo_search' => 'Utrecht', 'longitude' => '5.1', 'latitude' => '52.1',
		]);

		$page = new Page();
		$page->title = 'About';
		$page->slug = 'about';
		$page->save();

		$this->ids = [
			'{protocol}' => $protocol->id,
			'{extension}' => $extension->id,
			'{news}' => $news->id,
			'{faq}' => $faq->id,
			'{ambassador}' => $ambassador->id,
			'{page}' => $page->id,
			'{owner_email}' => $owner->email,
		];
	}

	/**
	 * Every route inside the `admin` middleware group in routes/api.php.
	 */
	public static function adminRoutes(): array
	{
		return [
			'change password' => ['POST', '/api/admin/change-password', []],
			'protocols admin' => ['GET', '/api/protocols/admin', []],
			'approve protocol' => ['POST', '/api/protocol/{protocol}/approve', []],
			'reject protocol' => ['POST', '/api/protocol/{protocol}/reject', ['message' => 'No']],
			'counts rejected' => ['GET', '/api/protocols/counts-rejected', []],
			'counts per month' => ['GET', '/api/protocols/counts-per-month', []],
			'import logs' => ['GET', '/api/import-logs', []],
			'store news item' => ['POST', '/api/news-item', ['title' => 'T', 'status' => 'draft']],
			'upload news image' => ['POST', '/api/news-item/upload-image', []],
			'delete news image' => ['POST', '/api/news-item/delete-image', ['filename' => 'does-not-exist.png']],
			'update news item' => ['PUT', '/api/news-item', ['news_item_id' => '{news}', 'title' => 'T2', 'status' => 'draft']],
			'news items admin' => ['GET', '/api/news-items/admin', []],
			'delete news item' => ['DELETE', '/api/news-item/{news}', []],
			'users counts total' => ['GET', '/api/users/counts-total', []],
			'users regions' => ['GET', '/api/users/regions', []],
			'store ambassador' => ['POST', '/api/ambassador', [
				'contact_name' => 'N', 'description' => 'D', 'geo_search' => 'G', 'longitude' => '1', 'latitude' => '2',
			]],
			'delete ambassador' => ['DELETE', '/api/ambassador/{ambassador}', []],
			'store faq item' => ['POST', '/api/faq-item', []],
			'update faq item' => ['PUT', '/api/faq-item', []],
			'faq items admin' => ['GET', '/api/faq-items/admin', []],
			'get faq item' => ['GET', '/api/faq-item/{faq}', []],
			'delete faq item' => ['DELETE', '/api/faq-item/{faq}', []],
			'update page' => ['PUT', '/api/page', ['page_id' => '{page}', 'title' => 'About us']],
			'pages' => ['GET', '/api/pages', []],
			'embargo extensions' => ['GET', '/api/embargo-extensions', []],
			'approve extension' => ['POST', '/api/embargo-extension/{extension}/approve', []],
			'reject extension' => ['POST', '/api/embargo-extension/{extension}/reject', ['message' => 'No']],
			'extend embargo' => ['POST', '/api/embargo-end-date/{protocol}/extend', []],
			'users' => ['GET', '/api/users', []],
		];
	}

	protected function callRoute(string $method, string $uri, array $payload)
	{
		$uri = strtr($uri, $this->ids);
		array_walk_recursive($payload, function (&$value) {
			if (is_string($value) && isset($this->ids[$value])) {
				$value = $this->ids[$value];
			}
		});

		return $this->json($method, $uri, $payload);
	}

	#[DataProvider('adminRoutes')]
	public function test_guests_are_forbidden_on_admin_routes(string $method, string $uri, array $payload)
	{
		$this->callRoute($method, $uri, $payload)->assertForbidden();
	}

	#[DataProvider('adminRoutes')]
	public function test_researchers_are_forbidden_on_admin_routes(string $method, string $uri, array $payload)
	{
		$this->actingAs($this->makeUser());

		$this->callRoute($method, $uri, $payload)->assertForbidden();
	}

	#[DataProvider('adminRoutes')]
	public function test_admins_pass_the_admin_middleware(string $method, string $uri, array $payload)
	{
		$this->actingAs($this->makeAdmin());

		$status = $this->callRoute($method, $uri, $payload)->getStatusCode();

		$this->assertNotSame(403, $status, "$method $uri");
		$this->assertNotSame(401, $status, "$method $uri");
	}

	public function test_researchers_cannot_change_state_through_admin_routes()
	{
		$this->actingAs($this->makeUser());
		$protocolId = $this->ids['{protocol}'];

		$this->postJson("/api/protocol/{$protocolId}/reject", ['message' => 'No'])->assertForbidden();
		$this->deleteJson("/api/news-item/{$this->ids['{news}']}")->assertForbidden();

		$this->assertSame('published', \App\Models\Protocol::find($protocolId)->status);
		$this->assertNotNull(NewsItem::find($this->ids['{news}']));
	}

	public function test_admins_list_all_users()
	{
		$admin = $this->makeAdmin();

		$response = $this->actingAs($admin)->getJson('/api/users')
			->assertOk()
			->assertJsonPath('success', true)
			->assertJsonStructure(['users' => [['id', 'email', 'first_name', 'last_name', 'is_verified', 'protocols']]]);

		$emails = collect($response->json('users'))->pluck('email')->all();
		$this->assertContains($admin->email, $emails);
		$this->assertContains($this->ids['{owner_email}'], $emails);
		$this->assertCount(User::count(), $emails);
		$this->assertArrayNotHasKey('password', $response->json('users.0'));
		$this->assertArrayNotHasKey('remember_token', $response->json('users.0'));
	}

	public function test_admin_changes_another_users_password()
	{
		$user = User::where('email', $this->ids['{owner_email}'])->firstOrFail();

		$response = $this->actingAs($this->makeAdmin())->postJson('/api/admin/change-password', [
			'email' => $user->email,
			'password' => 'a-new-password-123',
			'password_confirmation' => 'a-new-password-123',
		])->assertOk();

		$response->assertExactJson(['success' => true]);
		$this->assertTrue(Hash::check('a-new-password-123', $user->fresh()->password));
	}

	public function test_admin_change_password_validates_confirmation_and_unknown_email()
	{
		$admin = $this->makeAdmin();
		$user = User::where('email', $this->ids['{owner_email}'])->firstOrFail();
		$before = $user->password;

		$this->actingAs($admin)->postJson('/api/admin/change-password', [
			'email' => $user->email,
			'password' => 'a-new-password-123',
			'password_confirmation' => 'different-123',
		])->assertStatus(422)->assertJsonValidationErrors('password');

		$this->actingAs($admin)->postJson('/api/admin/change-password', [
			'email' => 'nobody@example.test',
			'password' => 'a-new-password-123',
			'password_confirmation' => 'a-new-password-123',
		])->assertNotFound();

		$this->assertSame($before, $user->fresh()->password);
	}
}
