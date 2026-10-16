<?php

namespace Tests\Feature\Characterization;

use App\Models\EmbargoExtension;
use App\Models\FaqCategory;
use App\Models\FaqItem;
use App\Models\Message;
use App\Models\NewsItem;
use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route as Router;
use Tests\TestCase;

/**
 * Every route under /admin is for the PCT team only. The routes are read from the router,
 * so a new admin route is covered without touching this test.
 */
class AdminAccessTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	/** @var array<string, int> */
	private array $ids = [];

	protected function setUp(): void
	{
		parent::setUp();
		Mail::fake();

		$protocol = $this->makePublishedProtocol($this->makeUser(), true);
		$extension = $protocol->embargoExtensions()->save(new EmbargoExtension(['reason' => 'More time']));
		$category = new FaqCategory();
		$category->name = 'General';
		$category->save();
		$faq = new FaqItem(['title' => 'Q', 'content' => 'A', 'status' => 'published']);
		$faq->faq_category_id = $category->id;
		$faq->save();
		$page = new Page();
		$page->title = 'About';
		$page->slug = 'about';
		$page->save();
		$point = app(\App\Services\ProtocolWorkflow::class)->currentRound($protocol)->points()->create(['protocol_id' => $protocol->id, 'field_key' => 'title', 'body' => 'x']);

		$this->ids = [
			'id' => $protocol->id,
			'extension' => $extension->id,
			'category' => $category->id,
			'point' => $point->id,
		];
	}

	/** @return array<int, array{0: string, 1: string}> method and URI of every admin route */
	private function adminRoutes(): array
	{
		return collect(Router::getRoutes()->getRoutes())
			->filter(fn (Route $route) => str_starts_with($route->uri(), 'admin/'))
			->flatMap(fn (Route $route) => collect($route->methods())->reject(fn ($m) => $m === 'HEAD')->map(fn ($m) => [$m, '/'.preg_replace_callback('/\{(\w+)\}/', fn ($p) => (string) ($this->ids[$p[1]] ?? 1), $route->uri())]))
			->values()
			->all();
	}

	public function test_the_admin_area_has_routes(): void
	{
		$this->assertGreaterThan(20, count($this->adminRoutes()));
	}

	public function test_guests_are_sent_to_log_in(): void
	{
		foreach ($this->adminRoutes() as [$method, $uri]) {
			$status = $this->call($method, $uri)->getStatusCode();
			$this->assertContains($status, [302, 401], "$method $uri for a guest");
		}
	}

	public function test_researchers_are_forbidden(): void
	{
		$this->actingAs($this->makeUser());

		foreach ($this->adminRoutes() as [$method, $uri]) {
			$response = $this->call($method, $uri);
			// Redirect routes (old admin URLs) only point to other admin pages.
			if ($response->isRedirect()) {
				$this->assertStringContainsString('/admin/', $response->headers->get('Location'), "$method $uri");

				continue;
			}
			$this->assertSame(403, $response->getStatusCode(), "$method $uri for a researcher");
		}
	}

	public function test_researchers_cannot_change_state_through_admin_routes(): void
	{
		$protocol = $this->makeProtocol($this->makeUser(), 'submitted_for_publication');
		$this->actingAs($this->makeUser());

		$this->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'approve'])->assertForbidden();
		$this->post("/admin/embargo-extensions/{$this->ids['extension']}/approve")->assertForbidden();
		$this->post('/admin/content/news', ['title' => 'x', 'summary' => 'x', 'content' => 'x', 'status' => 'published'])->assertForbidden();

		$this->assertSame('submitted_for_publication', $protocol->fresh()->status);
		$this->assertSame('awaiting_approval', EmbargoExtension::find($this->ids['extension'])->status);
		$this->assertSame(0, NewsItem::count());
		$this->assertSame(0, Message::count());
	}

	public function test_admins_reach_every_admin_page(): void
	{
		$waiting = $this->makeProtocol($this->makeUser(), 'submitted_for_publication');
		$this->actingAs($this->makeAdmin());

		foreach (['/admin/protocols', "/admin/protocols/{$waiting->id}/review", '/admin/embargoes', '/admin/users', '/admin/statistics', '/admin/content'] as $uri) {
			$this->get($uri)->assertSuccessful();
		}
	}
}
